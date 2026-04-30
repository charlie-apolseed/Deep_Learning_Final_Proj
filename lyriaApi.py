from google import genai
import os
import time

client = genai.Client(api_key="AIzaSyCIk8g8vRtWm8VEDUTlnbS5D8vpEfKR-KQ")


def generate_music(_image_description, lyrics, genre, music_description):
    """Generate a music clip and save it to clips/. Returns the saved filename."""
    os.makedirs("clips", exist_ok=True)

    response = client.models.generate_content(
        model="lyria-3-clip-preview",
        contents=(
            f"Create a 30-second {genre} song based on this description: {music_description}."
            f" Here are some lyrics for inspiration: {lyrics}"
        ),
    )

    audio_filename = None
    for part in response.parts:
        if part.text is not None:
            print(part.text)
        elif part.inline_data is not None:
            audio_filename = f"clip_{int(time.time())}.mp3"
            filepath = os.path.join("clips", audio_filename)
            with open(filepath, "wb") as f:
                f.write(part.inline_data.data)
            print(f"Audio saved to {filepath}")

    return audio_filename


if __name__ == "__main__":
    import visionApi
    image_description, lyrics, genre, music_description = visionApi.run_summarization()
    generate_music(image_description, lyrics, genre, music_description)
