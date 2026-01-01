from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import io
import base64
from gprofiler import GProfiler

app = Flask(__name__)
CORS(app)  # Allow requests from any frontend

@app.route("/analyze", methods=["POST"])
def analyze():
    # Get genes from frontend
    gene_name = request.form.get("gene", "").strip()
    csv_data = request.form.get("csvData", "").strip()
    gene_list = [g.strip() for g in gene_name.split(",") if g.strip()]

    # Load CSV data into pandas DataFrame
    df = pd.DataFrame()
    if csv_data:
        from io import StringIO
        try:
            df = pd.read_csv(StringIO(csv_data))
        except Exception as e:
            return jsonify({"message": f"Error reading CSV: {str(e)}", "found_genes": [], "plot": None, "enriched_pathways": []})

    # Check which genes are in CSV
    found_genes = []
    for gene in gene_list:
        found = gene in df.columns if not df.empty else False
        found_genes.append({
            "gene": gene,
            "status": "✅ Found" if found else "❌ Not Found",
            "found": found
        })

    # Generate plot if data exists
    plot_base64 = None
    if not df.empty and any(g["found"] for g in found_genes):
        selected_genes = [g["gene"] for g in found_genes if g["found"]]
        mean_expr = df[selected_genes].mean()
        plt.figure(figsize=(6,4))
        sns.barplot(x=mean_expr.index, y=mean_expr.values)
        plt.title("Mean Expression of Selected Genes")
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        plot_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()

    # Pathway enrichment using g:Profiler
    enriched_pathways = []
    if gene_list:
        gp = GProfiler(return_dataframe=True)
        try:
            enrich_df = gp.profile(organism='hsapiens', query=gene_list)
            enriched_pathways = enrich_df[['term_name', 'p_value']].head(5).to_dict('records')
        except Exception as e:
            enriched_pathways = [{"error": str(e)}]

    message = f"Analysis complete! Genes processed: {len(found_genes)}"
    return jsonify({
        "message": message,
        "found_genes": found_genes,
        "plot": plot_base64,
        "enriched_pathways": enriched_pathways
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
