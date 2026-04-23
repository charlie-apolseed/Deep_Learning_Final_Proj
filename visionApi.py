import vertexai
from vertexai.generative_models import GenerativeModel, Part
from google.cloud import storage
import os
from time import sleep

# Configuration
PROJECT_ID = "deeplearningfinal-494212"  # Your current project
LOCATION = "us-central1"  # e.g., us-central1
BUCKET_NAME = "image_summary_bucket_0"  # Your GCS bucket name
IMG_FOLDER = "img"
# Use a public image for testing, or upload one to your own GCS bucket
IMAGE_URI = "gs://image_summary_bucket_0/image_0.jpeg"


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


def run_summarization():
    # Initialize Vertex AI
    vertexai.init(project=PROJECT_ID, location=LOCATION)

    # Load the Gemini 2.5 Flash model
    model = GenerativeModel("gemini-2.5-flash")

    # Reference the image
    image_part = Part.from_uri(IMAGE_URI, mime_type="image/jpeg")

    # Prepare the prompt
    prompt = "Describe this image in detail and summarize the main subjects."

    # Generate the response
    print("Generating summary...")
    response = model.generate_content([image_part, prompt])

    lyric_prompt = (
        "Write a 4 verse song about the following image description: " + response.text
    )

    lyrics = model.generate_content([lyric_prompt])
    lyrics = lyrics

    genre_prompt = (
        """Based on the following image description, suggest a single music genre 
        that would fit well with the theme. Only return the name of the genre and 
        nothing else: """
        + response.text
    )
    genre = model.generate_content([genre_prompt])

    music_description_prompt = (
        """Based on the following image description, suggest a set of musical 
        instrument that would fit well with the theme. Do not give any explanation or reasoning, I just 
        want a list of 3-5 instruments to match the song in the following genre and description: """
        + genre.text + response.text
    )
    music_description = model.generate_content([music_description_prompt])

    print("\n--- Image Summary ---")
    print(response.text)

    print("\n--- Song Lyrics ---")
    print(lyrics.text)

    print("\n--- Music Genre ---")
    print(genre.text)

    print("\n--- Music Description ---")
    print(music_description.text)


if __name__ == "__main__":
    upload_images_to_bucket()
    #Sleep to allow iamge upload to complete 
    sleep(10)
    run_summarization()
