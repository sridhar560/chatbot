from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load .env
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY is missing in .env file")

genai.configure(api_key=api_key)

app = Flask(__name__)
CORS(app)

@app.route("/")
def health():
    return jsonify({"message": "Flask server is running ✅"})

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "No question provided"}), 400

    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash")
        response = model.generate_content(question)
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ask-file", methods=["POST"])
def ask_file():
    if "files" not in request.files or "question" not in request.form:
        return jsonify({"error": "Files or question not provided"}), 400

    files = request.files.getlist("files")
    question = request.form["question"]

    if not files or not question.strip():
        return jsonify({"error": "Missing files or question"}), 400

    try:
        model = genai.GenerativeModel("models/gemini-1.5-pro")

        content = [{"text": question}]
        for file in files:
            file_data = file.read()
            content.append({
                "mime_type": file.mimetype,
                "data": file_data
            })

        response = model.generate_content(
            content,
            generation_config={"max_output_tokens": 2048}
        )

        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
