from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

@app.route("/analyze", methods=["POST"])
def analyze():
    gene_name = request.form.get("gene", "").strip()
    csv_data = request.form.get("csvData", "").strip()
    
    # Uploaded files
    genomics_file = request.files.get("genomicsFile")
    image_file = request.files.get("imageFile")

    # Dummy processing for demonstration
    # Convert gene input to list
    gene_list = [g.strip() for g in gene_name.split(",") if g.strip()]
    
    # Check if gene exists in CSV data (simplified)
    found_genes = []
    csv_text = csv_data.lower() if csv_data else ""
    for gene in gene_list:
        found = gene.lower() in csv_text if csv_text else False
        found_genes.append({"gene": gene, "found": found})

    # Response message
    message = "Analysis complete! Genes processed: " + str(len(found_genes))
    return jsonify({"message": message, "found_genes": found_genes})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
