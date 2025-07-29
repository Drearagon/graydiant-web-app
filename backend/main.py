from flask import Flask, request, jsonify
from telegram_client import send_prompt

app = Flask(__name__)

@app.route('/render', methods=['POST'])
def render():
    data = request.get_json(force=True, silent=True)
    if not data or 'prompt' not in data:
        return jsonify({'error': 'Prompt missing'}), 400
    prompt = data['prompt']
    try:
        result = send_prompt(prompt)
        if result is None:
            return jsonify({'error': 'No image returned'}), 504
        return jsonify({'image': result})
    except Exception as exc:
        return jsonify({'error': str(exc)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
