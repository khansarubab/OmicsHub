from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    genes = data.get("gene", "")

    gene_list = [g.strip() for g in genes.split(",") if g.strip()]

    pathways = [
        {"name": "Cell Cycle Regulation", "p_value": 0.00012},
        {"name": "DNA Repair Pathway", "p_value": 0.0045},
        {"name": "Cancer Signaling", "p_value": 0.0018}
    ]

    return jsonify({
        "message": "Analysis completed successfully",
        "genes": gene_list,
        "pathways": pathways
    })

# Required for Vercel
app = app
