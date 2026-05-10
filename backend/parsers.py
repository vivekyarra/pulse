from __future__ import annotations

import io
import re
from datetime import datetime
from typing import Any

import pandas as pd
from pdfminer.high_level import extract_text


CATEGORIES = {
    "salary": ["salary", "payroll", "blueorb"],
    "food": ["swiggy", "zomato", "grocery", "bigbasket", "instamart", "supermarket", "bazaar", "coffee"],
    "transport": ["uber", "ola", "metro", "fuel", "petrol", "cab"],
    "entertainment": ["bookmyshow", "movie", "pvr"],
    "utilities": ["bescom", "airtel", "jio", "electricity", "lic", "premium", "bill"],
    "healthcare": ["gym", "cult", "pharmacy", "doctor", "hospital"],
    "investment": ["sip", "mutual fund", "zerodha", "groww", "kuvera"],
    "subscription": ["netflix", "spotify", "prime", "cloud", "subscription", "design app"],
    "shopping": ["amazon", "myntra", "flipkart", "croma", "clothing", "electronics"],
    "transfer": ["rent", "transfer", "landlord", "neft", "imps"],
    "atm": ["atm", "cash withdrawal"],
}


def _parse_date(value: Any) -> str:
    if pd.isna(value):
        return datetime.utcnow().date().isoformat()
    parsed = pd.to_datetime(str(value), dayfirst=True, errors="coerce")
    if pd.isna(parsed):
        return datetime.utcnow().date().isoformat()
    return parsed.date().isoformat()


def _category_for(description: str) -> str:
    text = description.lower()
    for category, needles in CATEGORIES.items():
        if any(needle in text for needle in needles):
            return category
    return "other"


def normalize_transactions(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    transactions = []
    for row in rows:
        description = str(row.get("description") or row.get("narration") or row.get("details") or row.get("particulars") or "Transaction").strip()
        amount = row.get("amount")
        credit = row.get("credit")
        debit = row.get("debit")
        txn_type = str(row.get("type") or "").lower()

        if amount is None or amount == "":
            if credit not in (None, "", 0, "0"):
                amount = credit
                txn_type = "credit"
            else:
                amount = debit
                txn_type = "debit"

        amount_text = re.sub(r"[^0-9.\-]", "", str(amount or 0))
        try:
            numeric_amount = abs(float(amount_text))
        except ValueError:
            numeric_amount = 0.0

        if not txn_type:
            txn_type = "credit" if credit not in (None, "", 0, "0") or str(amount).strip().startswith("+") else "debit"
        if txn_type not in {"credit", "debit"}:
            txn_type = "credit" if any(k in description.lower() for k in ["salary", "credit", "refund"]) else "debit"

        category = str(row.get("category") or _category_for(description)).lower()
        transactions.append(
            {
                "date": _parse_date(row.get("date") or row.get("txn date") or row.get("transaction date") or row.get("value date")),
                "description": description,
                "amount": round(numeric_amount, 2),
                "type": txn_type,
                "category": category if category in CATEGORIES or category == "other" else _category_for(description),
            }
        )
    return [txn for txn in transactions if txn["amount"] > 0]


def parse_csv_bytes(content: bytes) -> list[dict[str, Any]]:
    text = content.decode("utf-8-sig", errors="ignore")
    dataframe = pd.read_csv(io.StringIO(text))
    dataframe.columns = [str(col).strip().lower() for col in dataframe.columns]
    return normalize_transactions(dataframe.to_dict(orient="records"))


def extract_pdf_text(content: bytes) -> str:
    return extract_text(io.BytesIO(content))
