import os
import re
from flask import Flask, request, jsonify
import pytesseract
from PIL import Image
from flask_cors import CORS

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/verify_passport", methods=["POST"])
def verify_passport():
    if "file" not in request.files:
        return jsonify({"passport_no": None, "error": "No file uploaded"}), 400

    file = request.files["file"]
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    text = pytesseract.image_to_string(Image.open(filepath))
    print("Extracted text:", text)

    match = re.search(r"[A-Z0-9]{6,9}", text)
    if match:
        passport_number = match.group(0)
        return jsonify({"passport_no": passport_number})
    else:
        return jsonify({"passport_no": None, "error": "No valid passport number detected"})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
