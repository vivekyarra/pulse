import { SAMPLE_DATA } from "./sample_data.js";

const monthKey = (date) => date.slice(0, 7);
const dayOfMonth = (date) => Number(date.slice(8, 10));

function merchant(description) {
  return description
    .toLowerCase()
    .replace(/^(upi|auto debit|pos|neft|imps)\s+/, "")
    .replace(/[^a-z0-9 ]/g, "")
    .toUpperCase()
    .split(" ")
    .slice(0, 3)
    .join(" ");
}

function recurringCharges(debits) {
  const groups = new Map();
  debits.forEach((txn) => {
    const key = txn.description.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ").slice(0, 4).join(" ");
    groups.set(key, [...(groups.get(key) || []), txn]);
  });
  return [...groups.entries()]
    .map(([key, items]) => {
      const months = new Set(items.map((txn) => monthKey(txn.date)));
      if (months.size < 2) return null;
      const amount = items.reduce((sum, txn) => sum + txn.amount, 0) / items.length;
      const day = Math.round(items.reduce((sum, txn) => sum + dayOfMonth(txn.date), 0) / items.length);
      return {
        merchant: key.replace(/\b\w/g, (char) => char.toUpperCase()),
        amount: Math.round(amount),
        monthly_total: Math.round(amount),
        frequency: months.size,
        category: items[0].category,
        next_expected_day: day,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.amount - b.amount);
}

function futurePredictions(summary, leakTotal) {
  const food = Math.round((summary.by_category.food || 0) / summary.months.length);
  return [
    { prediction: `Food delivery may overshoot by Rs ${Math.round(food * 0.18).toLocaleString("en-IN")}-Rs ${Math.round(food * 0.28).toLocaleString("en-IN")} if salary-week orders repeat.`, confidence: 76, urgency: "high", category: "food", amount_range: `Rs ${Math.round(food * 0.18)}-${Math.round(food * 0.28)}` },
    { prediction: "Electricity bill is likely due around the 18th based on the last three payments.", confidence: 91, urgency: "medium", category: "utilities", amount_range: "Rs 1,350-1,600" },
    { prediction: `Small recurring charges will drain about Rs ${Math.round(leakTotal).toLocaleString("en-IN")} this month unless cancelled.`, confidence: 88, urgency: "medium", category: "subscription", amount_range: `Rs ${Math.round(leakTotal)}` },
    { prediction: "Phone bill usually lands near month-end; reserve cash before day 28.", confidence: 84, urgency: "low", category: "utilities", amount_range: "Rs 999" },
    { prediction: `Post-salary surge is ${Math.max(0, Math.round(summary.post_salary_surge))}% above baseline, so the first week is your highest-risk window.`, confidence: 79, urgency: "high", category: "stress", amount_range: "First 5 days" },
  ];
}

export function buildLocalSampleAnalysis() {
  const transactions = SAMPLE_DATA.transactions;
  const credits = transactions.filter((txn) => txn.type === "credit");
  const debits = transactions.filter((txn) => txn.type === "debit");
  const totalIncome = credits.reduce((sum, txn) => sum + txn.amount, 0);
  const totalExpenses = debits.reduce((sum, txn) => sum + txn.amount, 0);
  const months = [...new Set(transactions.map((txn) => monthKey(txn.date)))].sort();
  const byCategory = {};
  const merchantTotals = {};
  const monthlyIncome = {};
  const monthlyExpenses = {};
  const monthlyInvestments = {};
  const stressByMonth = Object.fromEntries(months.map((month) => [month, Array(31).fill(0)]));
  const dayTotals = Array(31).fill(0);
  const dayCounts = Array(31).fill(0);

  debits.forEach((txn) => {
    const month = monthKey(txn.date);
    const day = dayOfMonth(txn.date) - 1;
    byCategory[txn.category] = (byCategory[txn.category] || 0) + txn.amount;
    merchantTotals[merchant(txn.description)] = (merchantTotals[merchant(txn.description)] || 0) + txn.amount;
    monthlyExpenses[month] = (monthlyExpenses[month] || 0) + txn.amount;
    stressByMonth[month][day] += txn.amount;
    dayTotals[day] += txn.amount;
    dayCounts[day] += 1;
    if (txn.category === "investment") monthlyInvestments[month] = (monthlyInvestments[month] || 0) + txn.amount;
  });
  credits.forEach((txn) => {
    const month = monthKey(txn.date);
    monthlyIncome[month] = (monthlyIncome[month] || 0) + txn.amount;
  });

  const recurring = recurringCharges(debits);
  const subscriptions = recurring.filter((charge) => charge.amount < 500 || charge.category === "subscription");
  const leakTotal = subscriptions.reduce((sum, charge) => sum + charge.monthly_total, 0);
  const savingsAmount = totalIncome - totalExpenses;
  const savingsRate = Math.round((savingsAmount / totalIncome) * 1000) / 10;
  const avgMonthlyExpenses = Object.values(monthlyExpenses).reduce((sum, value) => sum + value, 0) / months.length;
  const avgMonthlySavings = months.reduce((sum, month) => sum + (monthlyIncome[month] || 0) - (monthlyExpenses[month] || 0), 0) / months.length;
  const liquidityMonths = Math.max(0, (avgMonthlySavings * months.length) / avgMonthlyExpenses);
  const investmentRatio = Math.round((Object.values(monthlyInvestments).reduce((sum, value) => sum + value, 0) / totalIncome) * 1000) / 10;
  const spendingByDay = dayTotals.map((value, index) => Math.round(value / Math.max(1, dayCounts[index])));
  const restValues = spendingByDay.slice(5).filter(Boolean);
  const firstWeekDaily = spendingByDay.slice(0, 5).reduce((sum, value) => sum + value, 0) / 5;
  const restDaily = restValues.reduce((sum, value) => sum + value, 0) / restValues.length;
  const surge = Math.round(((firstWeekDaily - restDaily) / restDaily) * 1000) / 10;
  const liquidityScore = Math.round(Math.min(100, (liquidityMonths / 3) * 1000)) / 10;
  const heart = Math.max(0, Math.min(100, Math.round((savingsRate / 30) * 100)));
  const brain = Math.max(0, Math.min(100, Math.round((investmentRatio / 20) * 100)));
  const stomach = Math.max(20, Math.min(100, Math.round(78 - Math.max(0, Math.min(45, surge / 3)) + Object.keys(byCategory).length)));

  const summary = {
    total_income: totalIncome,
    total_expenses: totalExpenses,
    savings_amount: savingsAmount,
    savings_rate: savingsRate,
    avg_monthly_expenses: Math.round(avgMonthlyExpenses),
    by_category: Object.fromEntries(Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([key, value]) => [key, Math.round(value)])),
    recurring_charges: recurring,
    subscription_list: subscriptions,
    spending_by_day_of_month: spendingByDay,
    stress_matrix: months.map((month) => ({ month, days: stressByMonth[month] })),
    top_merchants: Object.entries(merchantTotals).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, amount]) => ({ merchant: name, amount: Math.round(amount) })),
    investment_ratio: investmentRatio,
    liquidity_score: liquidityScore,
    liquidity_months: Math.round(liquidityMonths * 100) / 100,
    income_stability: 100,
    post_salary_surge: surge,
    months,
  };

  return {
    profile: SAMPLE_DATA.profile,
    summary,
    scores: {
      heart_score: heart,
      lung_score: Math.round(liquidityScore),
      stomach_score: stomach,
      spine_score: 100,
      brain_score: brain,
      overall_grade: "C",
      headline: "Stable income and a real SIP habit are keeping you healthy, but salary-week spending and small subscriptions are quietly lowering your score.",
      top_concern: "Post-salary food delivery and small recurring charges are reducing monthly savings.",
      top_strength: "Salary is consistent and the monthly SIP is already building long-term financial muscle.",
    },
    predictions: futurePredictions(summary, leakTotal),
    leaks: {
      total_monthly: leakTotal,
      items: subscriptions,
      groups: [
        { name: "Streaming", amount: subscriptions.filter((item) => /netflix|spotify|prime/i.test(item.merchant)).reduce((sum, item) => sum + item.monthly_total, 0) },
        { name: "Tools and Cloud", amount: subscriptions.filter((item) => !/netflix|spotify|prime/i.test(item.merchant)).reduce((sum, item) => sum + item.monthly_total, 0) },
      ].filter((group) => group.amount > 0),
    },
    transactions,
  };
}
