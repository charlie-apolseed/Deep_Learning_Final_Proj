from google import genai
import os
import time

client = genai.Client(api_key=os.environ["GOOGLE_GENAI_API_KEY"])


def generate_music(_image_description, lyrics, genre, music_description, mood=None, vocals=None, tempo=None):
    """Generate a music clip and save it to clips/. Returns the saved filename."""
    os.makedirs("clips", exist_ok=True)

    prompt = f"Create a 2-4 minute {genre} song based on this description: {music_description}."
    if mood:
        prompt += f" The overall mood should be {mood.lower()}."
    if vocals == 'Instrumental':
        prompt += " This is an instrumental track — no vocals."
    elif vocals:
        prompt += f" Feature {vocals.lower()} vocals."
    if tempo:
        prompt += f" Target a tempo of approximately {tempo} BPM."
    prompt += f" Here are some lyrics for inspiration: {lyrics}"

    response = client.models.generate_content(
        model="lyria-3-pro-preview",
        contents=prompt,
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
