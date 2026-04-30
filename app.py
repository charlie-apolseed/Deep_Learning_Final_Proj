from flask import Flask, request, jsonify, send_from_directory, render_template
import os
import uuid
import threading

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
AUDIO_FOLDER = os.path.join(BASE_DIR, 'clips')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

_jobs = {}


def _run_pipeline(job_id, image_path):
    try:
        import visionApi
        import lyriaApi

        _jobs[job_id]['message'] = 'Uploading image to cloud storage...'
        gcs_uri = visionApi.upload_single_image(image_path)

        _jobs[job_id]['message'] = 'Analyzing image with Gemini 2.5...'
        description, lyrics, genre, music_desc = visionApi.run_summarization(gcs_uri)

        _jobs[job_id]['message'] = f'Composing {genre.strip()} music with Lyria...'
        audio_filename = lyriaApi.generate_music(description, lyrics, genre, music_desc)

        if not audio_filename:
            raise RuntimeError('Lyria returned no audio data.')

        _jobs[job_id].update({
            'status': 'done',
            'description': description,
            'lyrics': lyrics,
            'genre': genre.strip(),
            'audio_filename': audio_filename,
        })
    except Exception as e:
        _jobs[job_id].update({'status': 'error', 'message': str(e)})


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/process', methods=['POST'])
def process():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    f = request.files['image']
    if not f.filename:
        return jsonify({'error': 'Empty filename'}), 400

    ext = os.path.splitext(f.filename)[1].lower() or '.jpg'
    filename = f"{uuid.uuid4()}{ext}"
    image_path = os.path.join(UPLOAD_FOLDER, filename)
    f.save(image_path)

    job_id = str(uuid.uuid4())
    _jobs[job_id] = {'status': 'processing', 'message': 'Starting pipeline...'}

    threading.Thread(target=_run_pipeline, args=(job_id, image_path), daemon=True).start()
    return jsonify({'job_id': job_id, 'image_filename': filename})


@app.route('/status/<job_id>')
def status(job_id):
    job = _jobs.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    return jsonify(job)


@app.route('/audio/<path:filename>')
def audio(filename):
    return send_from_directory(AUDIO_FOLDER, filename)


@app.route('/uploads/<path:filename>')
def uploads(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
