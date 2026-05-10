import unittest

from parsers import parse_csv_bytes


class IndianBankCsvParserTests(unittest.TestCase):
    def test_sbi_style_csv(self):
        csv = """Txn Date,Value Date,Description,Ref No./Cheque No.,Debit,Credit,Balance
01/03/2026,01/03/2026,SALARY CREDIT - BLUEORB,,,"85000.00","100000.00"
02/03/2026,02/03/2026,UPI SWIGGY FOOD ORDER,,1320.00,,"98680.00"
05/03/2026,05/03/2026,AMAZON PRIME SUBSCRIPTION,,299.00,,"98381.00"
"""
        txns = parse_csv_bytes(csv.encode("utf-8"))
        self.assertEqual(len(txns), 3)
        self.assertEqual(txns[0]["type"], "credit")
        self.assertEqual(txns[0]["category"], "salary")
        self.assertEqual(txns[1]["type"], "debit")
        self.assertEqual(txns[1]["category"], "food")

    def test_hdfc_style_csv(self):
        csv = """Date,Narration,Chq./Ref.No.,Value Dt,Withdrawal Amt.,Deposit Amt.,Closing Balance
01/03/26,SALARY CREDIT BLUEORB,ABC123,01/03/26,,85000.00,90000.00
02/03/26,ZERODHA COIN MUTUAL FUND SIP,UPI001,02/03/26,5000.00,,85000.00
06/03/26,NETFLIX INDIA,NACH002,06/03/26,649.00,,84351.00
"""
        txns = parse_csv_bytes(csv.encode("utf-8"))
        self.assertEqual(len(txns), 3)
        self.assertEqual(txns[1]["category"], "investment")
        self.assertEqual(txns[2]["category"], "subscription")


if __name__ == "__main__":
    unittest.main()
