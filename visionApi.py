import google.genai as genai
from google.genai import types
from google.cloud import storage
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


def run_summarization(image_uri=IMAGE_URI):
    MODEL = "gemini-2.5-flash"
    ext = os.path.splitext(image_uri)[1].lower()
    mime_type = _MIME_TYPES.get(ext, 'image/jpeg')
    image_part = types.Part.from_uri(file_uri=image_uri, mime_type=mime_type)

    print("Generating summary...")
    response = client.models.generate_content(
        model=MODEL,
        contents=[image_part, "Describe this image in detail and summarize the main subjects."],
    )
    sleep(2)

    lyrics = client.models.generate_content(
        model=MODEL,
        contents=["Write a 4 verse song about the following image description: " + response.text],
    )
    sleep(2)

    genre = client.models.generate_content(
        model=MODEL,
        contents=[
            """Based on the following image description, suggest a single music genre
        that would fit well with the theme. Only return the name of the genre and
        nothing else: """ + response.text
        ],
    )

    sleep(2)
    music_description = client.models.generate_content(
        model=MODEL,
        contents=[
            """Based on the following image description, suggest a set of musical
        instrument that would fit well with the theme. Do not give any explanation or reasoning, I just
        want a list of 3-5 instruments to match the song in the following genre and description: """
            + genre.text + response.text
        ],
    )

    print("\n--- Image Summary ---")
    print(response.text)

    print("\n--- Song Lyrics ---")
    print(lyrics.text)

    print("\n--- Music Genre ---")
    print(genre.text)

    print("\n--- Music Description ---")
    print(music_description.text)

    return response.text, lyrics.text, genre.text, music_description.text


if __name__ == "__main__":
    upload_images_to_bucket()
    sleep(10)
    run_summarization()
