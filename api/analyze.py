from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import io
import base64
from gprofiler import GProfiler

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    gene_name = request.form.get("gene", "").strip()
    csv_text = request.form.get("csvData", "").strip().lower()
    gene_list = [g.strip() for g in gene_name.split(",") if g.strip()]

    # Simple CSV search
    found_genes = []
    for gene in gene_list:
        found = gene.lower() in csv_text if csv_text else False
        found_genes.append({
            "gene": gene,
            "status": "✅ Found" if found else "❌ Not Found"
        })

    # Optional: Pathway enrichment mock
    pathways = [
        {"Pathway": "Cell Cycle Regulation", "p-value": "1.20e-4"},
        {"Pathway": "DNA Repair Pathway", "p-value": "4.50e-3"},
        {"Pathway": "Cancer Signaling", "p-value": "1.80e-3"}
    ]

    message = f"Analysis complete! Genes processed: {len(found_genes)}"
    return jsonify({"message": message, "found_genes": found_genes, "pathways": pathways})

if __name__ == "__main__":
    app.run()
