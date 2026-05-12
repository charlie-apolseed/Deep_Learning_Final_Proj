import google.genai as genai
from google.genai import types
from google.cloud import storage
from concurrent.futures import ThreadPoolExecutor, as_completed
import os
from time import sleep

# Configuration
PROJECT_ID = "deeplearningfinal-494212"
LOCATION = "us-central1"
BUCKET_NAME = "image_summary_bucket_0"
IMG_FOLDER = "img"
IMAGE_URI = "gs://image_summary_bucket_0/image_0.jpeg"

_MIME_TYPES = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
}

client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)


def upload_single_image(filepath):
    """Upload one image to GCS and return its gs:// URI."""
    storage_client = storage.Client(project=PROJECT_ID)
    bucket = storage_client.bucket(BUCKET_NAME)
    filename = os.path.basename(filepath)
    blob = bucket.blob(filename)
    blob.upload_from_filename(filepath)
    print(f"✓ Uploaded: {filename}")
    return f"gs://{BUCKET_NAME}/{filename}"


def upload_images_to_bucket():
    """Upload all images from the img folder to the Google Cloud Storage bucket."""
    storage_client = storage.Client(project=PROJECT_ID)
    bucket = storage_client.bucket(BUCKET_NAME)

    img_path = IMG_FOLDER
    if os.path.exists(img_path) and os.path.isdir(img_path):
        files = [f for f in os.listdir(img_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif'))]
        if files:
            print(f"Uploading {len(files)} image(s) to bucket '{BUCKET_NAME}'...")
            for filename in files:
                file_path = os.path.join(img_path, filename)
                blob = bucket.blob(filename)
                blob.upload_from_filename(file_path)
                print(f"✓ Uploaded: {filename}")
        else:
            print(f"No images found in {img_path}")
    else:
        print(f"Folder '{img_path}' does not exist")


def get_image_description(gcs_uri):
    """Describe a single image from its GCS URI."""
    MODEL = "gemini-2.5-flash"
    ext = os.path.splitext(gcs_uri)[1].lower()
    mime_type = _MIME_TYPES.get(ext, 'image/jpeg')
    image_part = types.Part.from_uri(file_uri=gcs_uri, mime_type=mime_type)
    response = client.models.generate_content(
        model=MODEL,
        contents=[image_part, "Describe this image in detail and summarize the main subjects."],
    )
    print(f"✓ Described: {gcs_uri}")
    return response.text


def aggregate_descriptions(descriptions):
    """Weave multiple per-image descriptions into one cohesive story."""
    MODEL = "gemini-2.5-flash"
    numbered = "\n\n".join(f"Image {i+1}: {d}" for i, d in enumerate(descriptions))
    prompt = (
        "You have been given descriptions of multiple images. "
        "Write a single cohesive narrative that connects all of them into one story or scene. "
        "The narrative should feel like a unified whole — not a list. "
        "Keep it evocative and detailed, as it will be used to generate song lyrics.\n\n"
        + numbered
    )
    response = client.models.generate_content(model=MODEL, contents=[prompt])
    print("✓ Aggregated story generated")
    return response.text


def _run_lyrics_genre_instruments(description, user_genre=None, user_mood=None, user_vocals=None):
    """Generate lyrics, genre, and instrument list from a description or story."""
    MODEL = "gemini-2.5-flash"

    mood_hint = f" The mood of the song should feel {user_mood.lower()}." if user_mood else ""
    vocals_hint = (
        " Write instrumental-only lyrics (no sung lines, just descriptive scene-setting stanzas)."
        if user_vocals == 'Instrumental'
        else f" The vocals should feel suited to a {user_vocals.lower()} voice." if user_vocals else ""
    )
    lyrics = client.models.generate_content(
        model=MODEL,
        contents=[
            "Write a 4 verse song about the following description: "
            + description + mood_hint + vocals_hint
        ],
    )
    sleep(2)

    if user_genre:
        genre_text = user_genre
    else:
        genre_resp = client.models.generate_content(
            model=MODEL,
            contents=[
                "Based on the following description, suggest a single music genre "
                "that would fit well with the theme. Only return the name of the genre and "
                "nothing else: " + description
            ],
        )
        sleep(2)
        genre_text = genre_resp.text

    music_description = client.models.generate_content(
        model=MODEL,
        contents=[
            "Based on the following description, suggest a set of musical"
            " instruments that would fit well with the theme. Do not give any explanation or reasoning, I just"
            " want a list of 3-5 instruments to match the song in the following genre and description: "
            + genre_text + " " + description
        ],
    )

    return lyrics.text, genre_text, music_description.text


def run_summarization(image_uri=IMAGE_URI, user_genre=None, user_mood=None, user_vocals=None):
    """Single-image pipeline: describe → lyrics → genre → instruments."""
    print("Generating summary...")
    description = get_image_description(image_uri)
    sleep(2)
    lyrics, genre_text, music_desc = _run_lyrics_genre_instruments(
        description, user_genre=user_genre, user_mood=user_mood, user_vocals=user_vocals
    )

    print("\n--- Image Summary ---")
    print(description)
    print("\n--- Song Lyrics ---")
    print(lyrics)
    print("\n--- Music Genre ---")
    print(genre_text)
    print("\n--- Music Description ---")
    print(music_desc)

    return description, lyrics, genre_text, music_desc


def run_multi_summarization(gcs_uris, user_genre=None, user_mood=None, user_vocals=None):
    """Multi-image pipeline: describe each in parallel → aggregate → lyrics → genre → instruments."""
    print(f"Describing {len(gcs_uris)} images in parallel...")
    descriptions = [None] * len(gcs_uris)
    with ThreadPoolExecutor(max_workers=len(gcs_uris)) as executor:
        future_to_idx = {executor.submit(get_image_description, uri): i for i, uri in enumerate(gcs_uris)}
        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            descriptions[idx] = future.result()

    sleep(2)
    print("Aggregating descriptions into story...")
    story = aggregate_descriptions(descriptions)
    sleep(2)

    lyrics, genre_text, music_desc = _run_lyrics_genre_instruments(
        story, user_genre=user_genre, user_mood=user_mood, user_vocals=user_vocals
    )

    print("\n--- Story ---")
    print(story)
    print("\n--- Song Lyrics ---")
    print(lyrics)
    print("\n--- Music Genre ---")
    print(genre_text)
    print("\n--- Music Description ---")
    print(music_desc)

    return story, lyrics, genre_text, music_desc


if __name__ == "__main__":
    upload_images_to_bucket()
    sleep(10)
    run_summarization()
