document.addEventListener("DOMContentLoaded", () => {
    const languageSelect = document.getElementById("languageSelect");
    const subtitle = document.getElementById("appSubtitle");
    const labels = document.getElementsByClassName("form-label");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const voiceBtn = document.getElementById("voiceBtn");
    const cameraBtn = document.getElementById("cameraBtn");
    const geneInput = document.getElementById("geneInput");
    const omicsFileInput = document.getElementById("omicsFile");
    const genomicsFileInput = document.getElementById("genomicsFile");
    const imageUpload = document.getElementById("imageUpload");
    const resultsTableBody = document.querySelector("#resultsTable tbody");
    const resultsChartCanvas = document.getElementById("resultsChart");
    let chart = null;
    let uploadedImageFile = null;
    let uploadedGenomicsFile = null;

    const translations = {
        en: { 
            subtitle: "Integrated Multi-Omics Explorer", 
            uploadFile: "Upload Omics File (CSV / JSON)", 
            uploadGenomics: "Upload Genomics / Proteomics File (CSV / JSON)", 
            geneLabel: "Enter Gene / Protein Name(s) (comma separated)", 
            voiceBtn: "🎤 Voice Input", 
            analyzeBtn: "Analyze Omics Data" 
        },
        ur: { 
            subtitle: "ملٹی اوومکس ڈیٹا ایکسپلورر", 
            uploadFile: "اومکس فائل اپلوڈ کریں", 
            uploadGenomics: "جینومکس / پروٹیومکس فائل اپلوڈ کریں", 
            geneLabel: "جین / پروٹین کا نام درج کریں (comma سے الگ کریں)", 
            voiceBtn: "🎤 وائس ان پٹ", 
            analyzeBtn: "اومکس ڈیٹا تجزیہ کریں" 
        },
        ru: { 
            subtitle: "Integrated Multi-Omics Explorer", 
            uploadFile: "Omics file upload karein", 
            uploadGenomics: "Genomics / Proteomics file upload karein", 
            geneLabel: "Gene / protein ka naam likhein (comma separated)", 
            voiceBtn: "🎤 Voice Input", 
            analyzeBtn: "Analyze Omics Data" 
        }
    };

    // LANGUAGE SWITCH
    languageSelect.addEventListener("change", () => {
        const lang = languageSelect.value;
        subtitle.innerText = translations[lang].subtitle;
        labels[0].innerText = translations[lang].uploadFile;
        labels[1].innerText = translations[lang].uploadGenomics;
        labels[2].innerText = translations[lang].geneLabel;
        voiceBtn.innerText = translations[lang].voiceBtn;
        analyzeBtn.innerText = translations[lang].analyzeBtn;
    });

    // VOICE INPUT
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        voiceBtn.addEventListener("click", () => {
            recognition.start();
            voiceBtn.innerText = "🎙 Listening...";
        });

        recognition.onresult = (event) => {
            geneInput.value = event.results[0][0].transcript;
            voiceBtn.innerText = translations[languageSelect.value].voiceBtn;
        };

        recognition.onerror = () => {
            voiceBtn.innerText = translations[languageSelect.value].voiceBtn;
            alert("Voice recognition error. Please try again.");
        };
    }

    // OMICS CSV / JSON FILE PREVIEW
    omicsFileInput.addEventListener("change", async () => {
        const file = omicsFileInput.files[0]; 
        if (!file) return; 
        if (!file.name.endsWith(".csv") && !file.name.endsWith(".json")) { 
            alert("Please upload a CSV or JSON file only."); 
            return; 
        }
        const text = await file.text(); 
        const lines = text.split("\n"); 
        let preview = "Preview of Omics CSV/JSON Data:\n\n";
        for (let i = 0; i < Math.min(5, lines.length); i++) preview += lines[i] + "\n"; 
        alert(preview);
    });

    // GENOMICS / PROTEOMICS FILE
    genomicsFileInput.addEventListener("change", () => {
        uploadedGenomicsFile = genomicsFileInput.files[0];
    });

    // CAMERA BUTTON + IMAGE UPLOAD
    cameraBtn.addEventListener("click", () => imageUpload.click());
    imageUpload.addEventListener("change", () => {
        uploadedImageFile = imageUpload.files[0];
    });

    // ANALYZE BUTTON
    analyzeBtn.addEventListener("click", async () => {
        const geneName = geneInput.value.trim();
        const omicsFile = omicsFileInput.files[0];

        if (!geneName && !omicsFile && !uploadedGenomicsFile && !uploadedImageFile) {
            alert("Please enter gene, upload Omics/Genomics file, or image file.");
            return;
        }

        let csvContent = "";
        if (omicsFile) csvContent = await omicsFile.text();

        const formData = new FormData();
        formData.append("gene", geneName);
        formData.append("csvData", csvContent);
        if (uploadedGenomicsFile) formData.append("genomicsFile", uploadedGenomicsFile);
        if (uploadedImageFile) formData.append("imageFile", uploadedImageFile);

        try {
            const response = await fetch("http://127.0.0.1:5000/analyze", { method: "POST", body: formData });
            if (!response.ok) throw new Error("Server returned " + response.status);
            const result = await response.json();

            // TABLE RESULTS
            resultsTableBody.innerHTML = "";
            if (result.found_genes) {
                result.found_genes.forEach(item => {
                    const row = resultsTableBody.insertRow();
                    row.insertCell(0).innerText = item.gene;
                    row.insertCell(1).innerText = item.found ? "✅ Found" : "⚠️ Not Found";
                });
            }

            // CHART RESULTS
            if (resultsChartCanvas && result.found_genes) {
                const chartLabels = result.found_genes.map(item => item.gene);
                const chartData = result.found_genes.map(item => item.found ? 1 : 0);
                if (chart) chart.destroy();
                chart = new Chart(resultsChartCanvas, {
                    type: "bar",
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: "Gene Found Status",
                            data: chartData,
                            backgroundColor: chartData.map(v => v ? "green" : "red")
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: { beginAtZero: true, ticks: { stepSize: 1 } }
                        }
                    }
                });
            }

            alert(result.message);
        } catch (error) {
            alert("Error connecting to backend: " + error);
        }
    });
});
