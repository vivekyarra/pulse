# Testing Plan

## Parser Tests

Run:

```bash
cd backend
python -m unittest discover -s tests
```

Current fixtures:

- SBI-style CSV with `Txn Date`, `Debit`, `Credit`
- HDFC-style CSV with `Narration`, `Withdrawal Amt.`, `Deposit Amt.`

## Real Friend Testing

Ask three friends to test with real statements. Record only reactions, never raw bank data.

Questions:

1. Did the body scan make the statement easier to understand?
2. Which organ surprised you most?
3. Did the leak map reveal any charge you had forgotten?
4. Did the opportunity number feel motivating?
5. Would you trust this if the privacy promise was prominent?

Submission social proof format:

- "I never realized my salary-week food spend was visible like a pattern."
- "The organ scores made it feel like a real diagnosis."
- "The leak map instantly showed subscriptions I forgot."
