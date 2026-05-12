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


def _run_pipeline(job_id, image_paths, user_genre=None, user_mood=None, user_vocals=None, user_tempo=None):
    try:
        import visionApi
        import lyriaApi

        count = len(image_paths)
        _jobs[job_id]['message'] = f'Uploading {"images" if count > 1 else "image"} to cloud storage...'
        gcs_uris = [visionApi.upload_single_image(p) for p in image_paths]

        _jobs[job_id]['message'] = f'Analyzing {"images" if count > 1 else "image"} with Gemini 2.5...'
        if count == 1:
            description, lyrics, genre, music_desc = visionApi.run_summarization(
                gcs_uris[0], user_genre=user_genre, user_mood=user_mood, user_vocals=user_vocals
            )
        else:
            description, lyrics, genre, music_desc = visionApi.run_multi_summarization(
                gcs_uris, user_genre=user_genre, user_mood=user_mood, user_vocals=user_vocals
            )

        _jobs[job_id]['message'] = f'Composing {genre.strip()} music with Lyria...'
        audio_filename = lyriaApi.generate_music(
            description, lyrics, genre, music_desc,
            mood=user_mood, vocals=user_vocals, tempo=user_tempo
        )

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
        import traceback; traceback.print_exc()
        _jobs[job_id].update({'status': 'error', 'message': str(e)})


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/process', methods=['POST'])
def process():
    files = request.files.getlist('image')
    files = [f for f in files if f and f.filename]
    if not files:
        return jsonify({'error': 'No image provided'}), 400
    if len(files) > 5:
        return jsonify({'error': 'Maximum 5 images allowed'}), 400

    image_paths = []
    image_filenames = []
    for f in files:
        ext = os.path.splitext(f.filename)[1].lower() or '.jpg'
        filename = f"{uuid.uuid4()}{ext}"
        image_path = os.path.join(UPLOAD_FOLDER, filename)
        f.save(image_path)
        image_paths.append(image_path)
        image_filenames.append(filename)

    job_id = str(uuid.uuid4())
    _jobs[job_id] = {'status': 'processing', 'message': 'Starting pipeline...'}

    user_genre  = request.form.get('genre')  or None
    user_mood   = request.form.get('mood')   or None
    user_vocals = request.form.get('vocals') or None
    user_tempo  = request.form.get('tempo')  or None

    threading.Thread(
        target=_run_pipeline,
        args=(job_id, image_paths, user_genre, user_mood, user_vocals, user_tempo),
        daemon=True
    ).start()
    return jsonify({'job_id': job_id, 'image_filenames': image_filenames})


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
