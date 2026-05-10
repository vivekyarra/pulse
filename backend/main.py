from __future__ import annotations

import asyncio
from typing import Any

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from analyzer import build_analysis, compute_predictions, parse_statement_with_gemini, sample_analysis
from parsers import extract_pdf_text, parse_csv_bytes

app = FastAPI(title="PULSE Financial Health Intelligence", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "healthy", "service": "PULSE"}


@app.post("/api/analyze")
async def analyze(file: UploadFile | None = File(default=None), sample_mode: bool = Form(default=False)) -> dict[str, Any]:
    async def _work() -> dict[str, Any]:
        if sample_mode or file is None:
            return sample_analysis()

        content = await file.read()
        filename = (file.filename or "").lower()
        error = None
        transactions = []

        try:
            if filename.endswith(".csv"):
                try:
                    transactions = parse_csv_bytes(content)
                except Exception as exc:
                    error = f"CSV parser fallback used: {exc}"
                    transactions = parse_statement_with_gemini(content.decode("utf-8", errors="ignore"), [])
            elif filename.endswith(".pdf"):
                raw_text = extract_pdf_text(content)
                transactions = parse_statement_with_gemini(raw_text, [])
            else:
                return {"error": "Unsupported file type. Please upload CSV or PDF.", **sample_analysis()}

            if not transactions:
                result = sample_analysis()
                result["error"] = error or "Could not extract transactions. Showing safe demo analysis instead."
                return result

            result = build_analysis(transactions)
            if error:
                result["warning"] = error
            return result
        except Exception as exc:
            result = sample_analysis()
            result["error"] = f"Analysis returned demo-safe partial results after an error: {exc}"
            return result

    try:
        return await asyncio.wait_for(_work(), timeout=30)
    except asyncio.TimeoutError:
        result = sample_analysis()
        result["error"] = "Analysis timed out after 30 seconds. Showing demo-safe partial results."
        return result


@app.post("/api/predict")
async def predict(payload: dict[str, Any]) -> dict[str, Any]:
    return {"predictions": compute_predictions(payload)}
