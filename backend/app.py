from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import noisereduce as nr
import soundfile as sf
import numpy as np
import io
import os
import tempfile

app = Flask(__name__)
# Update CORS configuration to explicitly allow requests from localhost:3000
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Add this function to ensure CORS headers are properly set for all responses
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route('/api/denoise', methods=['POST'])
def denoise_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    file = request.files['audio']
    
    # Create a temporary file to save the uploaded audio
    temp_dir = tempfile.mkdtemp()
    input_path = os.path.join(temp_dir, 'input.wav')
    output_path = os.path.join(temp_dir, 'denoised.wav')
    
    file.save(input_path)
    
    # Load the audio file
    data, rate = sf.read(input_path)
    
    # Convert stereo to mono if needed
    if len(data.shape) > 1:
        data = np.mean(data, axis=1)
    
    # Apply noise reduction
    reduced_noise = nr.reduce_noise(y=data, sr=rate)
    
    # Save the denoised audio
    sf.write(output_path, reduced_noise, rate)
    
    # Send the file back to the client
    return send_file(
        output_path,
        mimetype="audio/wav",
        as_attachment=True,
        download_name="denoised.wav"
    )

# Add an OPTIONS route to handle preflight requests
@app.route('/api/denoise', methods=['OPTIONS'])
def options():
    return '', 200

if __name__ == '__main__':
    app.run(debug=True, port=8000)  # Use port 8000 instead of default 5000
