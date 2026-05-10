# Devpost Draft

## Inspiration

Every Indian receives a bank statement, but almost nobody can truly read one. A statement is an X-ray of financial health: income, stress, habits, leaks, and future risk are all visible, but hidden in rows of transactions. PULSE is the AI radiologist that reads that X-ray and explains what it sees.

## What It Does

PULSE turns an Indian bank statement CSV or PDF into a Financial Health Scan. It maps each financial vital sign to a human organ:

- Heart: savings rate
- Lungs: liquidity and breathing room
- Stomach: spending discipline
- Spine: income stability
- Brain: investment ratio

Users upload a statement or use a sample profile. PULSE analyzes patterns, scores each organ, identifies subscription leaks, shows salary-cycle stress with a day-of-month heatmap, calculates opportunity cost, and generates conservative 30-day predictions.

## How We Built It

The frontend is React, Vite, Tailwind CSS, Recharts, and D3. The backend is FastAPI with stateless CSV/PDF parsing and Google Gemini 2.0 Flash for flexible statement interpretation and narrative analysis. There is no database. The privacy promise is central: data is analyzed and immediately discarded.

## Challenges

Indian bank statement formats vary wildly. SBI, HDFC, ICICI, and other banks use different column names, date formats, and debit/credit conventions. Gemini helps normalize ambiguous formats, but LLM JSON reliability is risky, so PULSE includes JSON sanitization, retries, deterministic fallbacks, and parser tests for SBI/HDFC-style CSVs.

## What's Next

- Add more bank-specific parser fixtures.
- Add UPI merchant normalization.
- Support encrypted PDFs through user-provided passwords.
- Build financial coaching plans in Indian languages.
- Add offline-first analysis for even stronger privacy.

## Social Impact

80% of Indians have no access to financial advice. PULSE democratizes financial health diagnosis for everyone by turning a bank statement, a document people already have, into an understandable health report.

## Keywords

Financial inclusion, social good, AI, India, fintech, personal finance, unbanked, Gemini, privacy, bank statements, financial literacy.
