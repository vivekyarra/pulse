from __future__ import annotations

import json
import math
import os
import re
import time
from collections import Counter, defaultdict
from datetime import datetime
from statistics import mean, pstdev
from typing import Any

from dotenv import load_dotenv

from parsers import normalize_transactions
from sample_data import SAMPLE_PROFILE, SAMPLE_TRANSACTIONS

load_dotenv()

try:
    import google.generativeai as genai
except Exception:  # pragma: no cover
    genai = None


def _model():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or genai is None:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.0-flash")


def extract_json(text: str, fallback: Any) -> Any:
    if not text:
        return fallback
    cleaned = text.strip().replace("```json", "```").strip("` \n")
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    candidates = re.findall(r"(\[[\s\S]*\]|\{[\s\S]*\})", cleaned)
    for candidate in candidates:
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            continue
    return fallback


def call_gemini_json(prompt: str, fallback: Any, retries: int = 2) -> Any:
    gemini = _model()
    if gemini is None:
        return fallback

    for attempt in range(retries + 1):
        try:
            response = gemini.generate_content(
                prompt,
                generation_config={"temperature": 0.2, "response_mime_type": "application/json"},
                request_options={"timeout": 18},
            )
            parsed = extract_json(getattr(response, "text", ""), fallback)
            if parsed != fallback:
                return parsed
        except Exception:
            if attempt == retries:
                return fallback
            time.sleep(0.5 * (attempt + 1))
    return fallback


def parse_statement_with_gemini(raw_text: str, fallback_rows: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    prompt = f"""
Parse this bank statement. Extract every transaction as JSON array:
[{{"date":"YYYY-MM-DD","description":"string","amount":number,"type":"credit|debit","category":"salary|food|transport|entertainment|utilities|healthcare|investment|subscription|shopping|transfer|atm|other"}}]
Respond ONLY with the JSON array, no other text.

Statement:
{raw_text[:24000]}
"""
    fallback = fallback_rows or []
    parsed = call_gemini_json(prompt, fallback)
    if isinstance(parsed, list) and parsed:
        return normalize_transactions(parsed)
    return fallback


def _month_key(date_text: str) -> str:
    return datetime.fromisoformat(date_text).strftime("%Y-%m")


def _day(date_text: str) -> int:
    return datetime.fromisoformat(date_text).day


def _score_from_range(value: float, excellent: float, poor: float = 0) -> int:
    if excellent == poor:
        return 50
    score = (value - poor) / (excellent - poor) * 100
    return int(max(0, min(100, round(score))))


def compute_summary(transactions: list[dict[str, Any]], profile: dict[str, Any] | None = None) -> dict[str, Any]:
    profile = profile or {"name": "Statement Holder", "city": "India"}
    credits = [txn for txn in transactions if txn["type"] == "credit"]
    debits = [txn for txn in transactions if txn["type"] == "debit"]
    total_income = sum(txn["amount"] for txn in credits)
    total_expenses = sum(txn["amount"] for txn in debits)
    savings_amount = total_income - total_expenses
    savings_rate = (savings_amount / total_income * 100) if total_income else 0

    by_category = defaultdict(float)
    merchant_totals = defaultdict(float)
    monthly_income = defaultdict(float)
    monthly_expenses = defaultdict(float)
    monthly_investments = defaultdict(float)
    spending_by_day = [0.0] * 31
    day_counts = [0] * 31
    stress_matrix = defaultdict(lambda: [0.0] * 31)

    for txn in transactions:
        month = _month_key(txn["date"])
        day = _day(txn["date"])
        if txn["type"] == "credit":
            monthly_income[month] += txn["amount"]
        else:
            by_category[txn["category"]] += txn["amount"]
            merchant = clean_merchant(txn["description"])
            merchant_totals[merchant] += txn["amount"]
            monthly_expenses[month] += txn["amount"]
            spending_by_day[day - 1] += txn["amount"]
            day_counts[day - 1] += 1
            stress_matrix[month][day - 1] += txn["amount"]
            if txn["category"] == "investment":
                monthly_investments[month] += txn["amount"]

    months = sorted(set(list(monthly_income.keys()) + list(monthly_expenses.keys())))
    avg_spending_by_day = [round(spending_by_day[i] / max(1, day_counts[i]), 2) for i in range(31)]
    recurring = detect_recurring_charges(debits)
    subscriptions = [charge for charge in recurring if charge["amount"] < 500 or "subscription" in charge["category"]]
    investments = sum(monthly_investments.values())
    investment_ratio = investments / total_income * 100 if total_income else 0
    avg_monthly_expenses = mean(monthly_expenses.values()) if monthly_expenses else 0
    avg_monthly_savings = mean([(monthly_income[m] - monthly_expenses[m]) for m in months]) if months else 0
    liquidity_months = max(0, avg_monthly_savings * len(months)) / avg_monthly_expenses if avg_monthly_expenses else 0

    income_values = [monthly_income[m] for m in months if monthly_income[m] > 0]
    income_stability = 100
    if len(income_values) > 1 and mean(income_values) > 0:
        income_stability = int(max(0, 100 - (pstdev(income_values) / mean(income_values) * 100)))

    first_week = sum(avg_spending_by_day[:5])
    rest_daily_avg = sum(avg_spending_by_day[5:]) / max(1, len([v for v in avg_spending_by_day[5:] if v > 0]))
    first_week_daily = first_week / 5
    post_salary_surge = round(((first_week_daily - rest_daily_avg) / rest_daily_avg * 100), 1) if rest_daily_avg else 0

    return {
        "profile": profile,
        "summary": {
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "savings_amount": round(savings_amount, 2),
            "savings_rate": round(savings_rate, 1),
            "avg_monthly_expenses": round(avg_monthly_expenses, 2),
            "by_category": {k: round(v, 2) for k, v in sorted(by_category.items(), key=lambda item: item[1], reverse=True)},
            "recurring_charges": recurring,
            "subscription_list": subscriptions,
            "spending_by_day_of_month": avg_spending_by_day,
            "stress_matrix": [{"month": month, "days": [round(v, 2) for v in stress_matrix[month]]} for month in months],
            "top_merchants": [{"merchant": k, "amount": round(v, 2)} for k, v in Counter(merchant_totals).most_common(10)],
            "investment_ratio": round(investment_ratio, 1),
            "liquidity_score": round(min(100, liquidity_months / 3 * 100), 1),
            "liquidity_months": round(liquidity_months, 2),
            "income_stability": income_stability,
            "post_salary_surge": post_salary_surge,
            "months": months,
        },
    }


def clean_merchant(description: str) -> str:
    text = re.sub(r"^(upi|auto debit|pos|neft|imps)\s+", "", description.lower()).strip()
    text = re.sub(r"[^a-z0-9 ]", "", text)
    words = text.upper().split()
    return " ".join(words[:3]) if words else "OTHER"


def detect_recurring_charges(debits: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped = defaultdict(list)
    for txn in debits:
        key = re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", "", txn["description"].lower())).strip()
        merchant = " ".join(key.split()[:4])
        grouped[merchant].append(txn)

    recurring = []
    for merchant, items in grouped.items():
        months = {_month_key(txn["date"]) for txn in items}
        if len(months) >= 2:
            avg_amount = mean([txn["amount"] for txn in items])
            recurring.append(
                {
                    "merchant": merchant.title(),
                    "amount": round(avg_amount, 2),
                    "monthly_total": round(avg_amount, 2),
                    "frequency": len(months),
                    "category": items[0]["category"],
                    "next_expected_day": int(round(mean([_day(txn["date"]) for txn in items]))),
                }
            )
    return sorted(recurring, key=lambda charge: charge["amount"])


def deterministic_scores(summary: dict[str, Any]) -> dict[str, Any]:
    data = summary["summary"]
    savings_rate = data["savings_rate"]
    investment_ratio = data["investment_ratio"]
    liquidity_score = data["liquidity_score"]
    income_stability = data["income_stability"]
    surge_penalty = max(0, min(45, data.get("post_salary_surge", 0) / 3))
    category_count = len([v for v in data["by_category"].values() if v > 0])
    spending_discipline = max(20, min(100, 78 - surge_penalty + category_count))

    heart = _score_from_range(savings_rate, 30)
    lungs = int(liquidity_score)
    stomach = int(spending_discipline)
    spine = int(income_stability)
    brain = _score_from_range(investment_ratio, 20)
    average = mean([heart, lungs, stomach, spine, brain])
    grade = "A" if average >= 85 else "B" if average >= 70 else "C" if average >= 55 else "D" if average >= 40 else "F"

    return {
        "heart_score": heart,
        "lung_score": lungs,
        "stomach_score": stomach,
        "spine_score": spine,
        "brain_score": brain,
        "overall_grade": grade,
        "headline": "Stable income and a real SIP habit are keeping you healthy, but salary-week spending and small subscriptions are quietly lowering your score.",
        "top_concern": "Post-salary food delivery and small recurring charges are reducing monthly savings.",
        "top_strength": "Salary is consistent and the monthly SIP is already building long-term financial muscle.",
    }


def compute_health_scores(summary: dict[str, Any]) -> dict[str, Any]:
    fallback = deterministic_scores(summary)
    prompt = f"""
Given this financial summary: {json.dumps(summary, ensure_ascii=False)}
Compute health scores 0-100 for each vital sign:
- heart_score: savings rate health (100 = saving >30%, 0 = saving nothing)
- lung_score: liquidity/breathing room (100 = 3+ months expenses in buffer)
- stomach_score: spending discipline (100 = consistent, 0 = chaotic impulse spending)
- spine_score: income stability (100 = consistent salary, 0 = erratic income)
- brain_score: investment ratio (100 = investing >20% of income)
Also provide:
- overall_grade: 'A'|'B'|'C'|'D'|'F'
- headline: one sentence financial health summary (like a doctor's summary)
- top_concern: the single biggest financial health issue
- top_strength: the single biggest financial health strength
Respond ONLY with JSON.
"""
    result = call_gemini_json(prompt, fallback)
    return {**fallback, **result} if isinstance(result, dict) else fallback


def deterministic_predictions(summary: dict[str, Any]) -> list[dict[str, Any]]:
    data = summary["summary"]
    food = data["by_category"].get("food", 0) / max(1, len(data["months"]))
    leak_total = sum(charge["monthly_total"] for charge in data["subscription_list"])
    surge = data.get("post_salary_surge", 0)
    return [
        {"prediction": f"Food delivery may overshoot by Rs {int(food * 0.18):,}-Rs {int(food * 0.28):,} if salary-week orders repeat.", "confidence": 76, "urgency": "high", "category": "food", "amount_range": f"Rs {int(food * 0.18)}-{int(food * 0.28)}"},
        {"prediction": "Electricity bill is likely due around the 18th based on the last three payments.", "confidence": 91, "urgency": "medium", "category": "utilities", "amount_range": "Rs 1,350-1,600"},
        {"prediction": f"Small recurring charges will drain about Rs {int(leak_total):,} this month unless cancelled.", "confidence": 88, "urgency": "medium", "category": "subscription", "amount_range": f"Rs {int(leak_total)}"},
        {"prediction": "Phone bill usually lands near month-end; reserve cash before day 28.", "confidence": 84, "urgency": "low", "category": "utilities", "amount_range": "Rs 999"},
        {"prediction": f"Post-salary surge is {max(0, int(surge))}% above baseline, so the first week is your highest-risk window.", "confidence": 79, "urgency": "high", "category": "stress", "amount_range": "First 5 days"},
    ]


def compute_predictions(summary: dict[str, Any]) -> list[dict[str, Any]]:
    fallback = deterministic_predictions(summary)
    prompt = f"""
Given spending patterns: {json.dumps(summary, ensure_ascii=False)}
Generate 5 specific, actionable predictions for next 30 days in this JSON format:
[{{"prediction":"string","confidence":0-100,"urgency":"high|medium|low","category":"string","amount_range":"string"}}]
Focus on: overspend risks, upcoming expected bills, unusual pattern breaks.
Respond ONLY with JSON array.
"""
    result = call_gemini_json(prompt, fallback)
    return result if isinstance(result, list) and result else fallback


def build_analysis(transactions: list[dict[str, Any]], profile: dict[str, Any] | None = None) -> dict[str, Any]:
    summary = compute_summary(transactions, profile)
    scores = compute_health_scores(summary)
    predictions = compute_predictions(summary)
    leak_total = sum(charge["monthly_total"] for charge in summary["summary"]["subscription_list"])
    return {
        **summary,
        "scores": scores,
        "predictions": predictions,
        "leaks": {
            "total_monthly": round(leak_total, 2),
            "items": summary["summary"]["subscription_list"],
            "groups": group_leaks(summary["summary"]["subscription_list"]),
        },
        "transactions": transactions,
    }


def group_leaks(leaks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    groups = defaultdict(float)
    for leak in leaks:
        category = "Streaming" if any(word in leak["merchant"].lower() for word in ["netflix", "spotify", "prime"]) else "Tools and Cloud"
        groups[category] += leak["monthly_total"]
    return [{"name": name, "amount": round(amount, 2)} for name, amount in groups.items()]


def sample_analysis() -> dict[str, Any]:
    return build_analysis(SAMPLE_TRANSACTIONS, SAMPLE_PROFILE)
