# PerSongify

Upload a photo, get an original song. PerSongify uses Gemini 2.5 Flash to analyze your image and write lyrics, then Google Lyria to compose a 30-second MP3 — all playable in the browser.

## How it works

1. **Upload** — drag a photo onto the web UI (JPG, PNG, or WEBP)
2. **Analyze** — the image is sent to Google Cloud Storage; Gemini 2.5 Flash describes it, writes 4-verse lyrics, picks a genre, and selects matching instruments
3. **Compose** — Lyria 3 generates a 30-second MP3 from that description
4. **Listen** — the result screen shows a built-in player, the full lyrics, and a download button

Optional direction controls let you override mood, genre, vocal style, and tempo before composing.

## Setup

### Prerequisites

- Python 3.9+
- A Google Cloud project with Vertex AI and Cloud Storage enabled
- A Google AI Studio API key (for Lyria via `google-genai`)

### Install dependencies

```bash
pip install flask google-cloud-aiplatform google-cloud-storage google-genai
```

### Authenticate

```bash
# Vertex AI + Cloud Storage (uses Application Default Credentials)
gcloud auth application-default login

# Lyria (google-genai SDK)
export GOOGLE_GENAI_API_KEY="your-api-key"
```

### GCP configuration

The following values are hardcoded in `visionApi.py` — update them if you use a different project:

| Variable | Value |
|---|---|
| `PROJECT_ID` | `deeplearningfinal-494212` |
| `LOCATION` | `us-central1` |
| `BUCKET_NAME` | `image_summary_bucket_0` |

### Run

```bash
python app.py
```

Open `http://localhost:5000` in your browser.

## Project structure

```
app.py              # Flask server — HTTP routes and job queue
visionApi.py        # GCS upload + Gemini 2.5 Flash inference
lyriaApi.py         # Lyria 3 music generation
templates/
  index.html        # Single-page UI (upload → loading → results)
uploads/            # Saved user images (auto-created)
clips/              # Generated MP3s (auto-created)
```

## API overview

| Route | Method | Description |
|---|---|---|
| `/` | GET | Serves the UI |
| `/process` | POST | Accepts `multipart/form-data` (image + optional controls), returns `job_id` |
| `/status/<job_id>` | GET | Polls job status; returns `done`/`processing`/`error` |
| `/audio/<filename>` | GET | Streams the generated MP3 |
| `/uploads/<filename>` | GET | Serves the uploaded image |

The pipeline runs in a background thread. The frontend polls `/status` every 2.5 seconds.
