# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Deep Learning final project that uses Google Cloud Vertex AI (Gemini 2.5 Flash) to analyze images and generate creative content: an image description, song lyrics, a music genre suggestion, and a list of matching instruments.

Then, using Google Lyria model, converts these text descriptions into playable songs. 

The final product should be an elegant full stack application that allows users to upload a photo (or multiple), then get a file that is playable in a browser. 

## Running the Project

```bash
# Authenticate with Google Cloud first (if not already done)
gcloud auth application-default login

# Run the main script
python visionApi.py
```

The script will:
1. Upload all images from the `img/` folder to the GCS bucket
2. Wait 10 seconds for upload to complete
3. Run multi-step Gemini inference on the image

## GCP Configuration

- **Project ID**: `deeplearningfinal-494212`
- **Location**: `us-central1`
- **GCS Bucket**: `image_summary_bucket_0`
- **Model**: `gemini-2.5-flash` via Vertex AI

## Dependencies

```bash
pip install google-cloud-aiplatform google-cloud-storage
```

## Architecture

All logic lives in `visionApi.py`:

- `upload_images_to_bucket()` — uploads `.jpg/.jpeg/.png/.gif` files from `img/` to GCS
- `run_summarization()` — initializes Vertex AI, then runs 4 sequential Gemini prompts:
  1. Image description from the GCS URI
  2. 4-verse song lyrics based on the description
  3. Music genre suggestion
  4. Instrument list matching the genre and description

Images placed in `img/` are uploaded to GCS and referenced via `gs://image_summary_bucket_0/<filename>`. The hardcoded `IMAGE_URI` at the top of the file controls which image is analyzed — update it to point to a different uploaded image.
