from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    gene_name = request.form.get("gene", "").strip()
    csv_text = request.form.get("csvData", "").strip().lower()
    gene_list = [g.strip() for g in gene_name.split(",") if g.strip()]

    found_genes = []
    for gene in gene_list:
        found = gene.lower() in csv_text if csv_text else False
        found_genes.append({
            "gene": gene,
            "status": "✅ Found" if found else "❌ Not Found"
        })

    message = f"Analysis complete! Genes processed: {len(found_genes)}"
    return jsonify({"message": message, "found_genes": found_genes})
