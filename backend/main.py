"""Flask application exposing a /render endpoint."""

from flask import Flask, request, jsonify
from telegram_client import send_prompt
import os
import base64

app = Flask(__name__)

@app.route('/render', methods=['POST'])
def render():
    """Handle image generation requests."""
    data = request.get_json(force=True, silent=True)
    if not data or not isinstance(data, dict) or "prompt" not in data:
        return jsonify({"error": "Prompt missing"}), 400

    prompt = data["prompt"]

    try:
        result = send_prompt(prompt)
        if not result:
            return jsonify({"error": "No image returned"}), 504

        if os.path.isfile(result):
            ext = os.path.splitext(result)[1].lower()
            if ext in {".jpg", ".jpeg"}:
                mime = "image/jpeg"
            elif ext == ".png":
                mime = "image/png"
            else:
                mime = "application/octet-stream"
            with open(result, "rb") as img_file:
                encoded = base64.b64encode(img_file.read()).decode("ascii")
            data_url = f"data:{mime};base64,{encoded}"
            return jsonify({"image": data_url})

        return jsonify({"image": result})
    except Exception as exc:  # pragma: no cover - simple error handling
        return jsonify({"error": str(exc)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
