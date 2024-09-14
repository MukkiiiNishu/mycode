from flask import Flask, request, jsonify, Response, stream_with_context, session
from flask_cors import CORS
import openai
import time

app = Flask(__name__)
CORS(app)

# Secret key for session management (needed for Flask sessions)
app.secret_key = 'your_secret_key'

# Set up OpenAI API key
openai.api_key = 'your-openai-api-key'  # Replace with your OpenAI API key

# API endpoint to handle sending the chat message via POST
@app.route('/api/send-message', methods=['POST'])
def send_message():
    data = request.json
    message = data.get('message')
    transcript = data.get('transcript')

    if not message or not transcript:
        return jsonify({"error": "Message and transcript are required."}), 400

    # Store the message and transcript in session
    session['message'] = message
    session['transcript'] = transcript

    return jsonify({"success": True})

# API endpoint for real-time streaming via GET (SSE)
@app.route('/api/chat', methods=['GET'])
def chat():
    # Retrieve the message and transcript from session
    message = session.get('message')
    transcript = session.get('transcript')

    if not message or not transcript:
        return jsonify({"error": "Message and transcript are missing."}), 400

    # Prepare the conversation context
    context = f"{transcript}\n\nUser: {message}"

    def generate_response():
        try:
            # Call OpenAI API (Simulated as chunked responses)
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": context}
                ]
            )
            assistant_response = response.choices[0].message['content']

            # Simulating chunked responses (split the response into chunks)
            chunks = assistant_response.split('. ')  # Split by sentence or period
            for i, chunk in enumerate(chunks):
                print(f"Sending chunk {i + 1}: {chunk.strip()}")  # Log the chunk
                time.sleep(1)  # Simulate delay between chunks
                yield f"data: {chunk.strip()}\n\n"  # Send chunk as SSE data
        except Exception as e:
            yield f"data: Error occurred: {str(e)}\n\n"

    return Response(stream_with_context(generate_response()), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(port=5000, debug=True)


if __name__ == '__main__':
    app.run(port=5000, debug=True)


from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from moviepy.editor import VideoFileClip
import os
import subprocess
import uuid
import openai

app = Flask(__name__)
CORS(app)

# MySQL Database Connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Mukesh@22",
    database="learning_assistant_db"
)

cursor = db.cursor()

# Set up OpenAI API key
openai.api_key = 'your-openai-api-key'  # Replace with your OpenAI API key

# Function to extract audio from video and save it as a .wav file
def extract_audio(video_path, audio_path):
    try:
        clip = VideoFileClip(video_path)
        clip.audio.write_audiofile(audio_path)
        clip.close()
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return False
    return True

# Function to transcribe audio using Whisper
def transcribe_audio(audio_path):
    try:
        result = subprocess.run(['python3', 'transcribe.py', audio_path], stdout=subprocess.PIPE)
        transcript = result.stdout.decode('utf-8').strip()
        return transcript
    except Exception as e:
        print(f"Error during transcription: {e}")
        return ''

# API endpoint to handle video uploads and transcription
@app.route('/api/upload-video', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400

    video = request.files['video']
    video_id = str(uuid.uuid4())
    video_path = f"uploads/{video_id}.mp4"
    audio_path = f"uploads/{video_id}.wav"

    video.save(video_path)

    if not extract_audio(video_path, audio_path):
        return jsonify({"error": "Failed to extract audio"}), 500

    transcript = transcribe_audio(audio_path)

    if transcript:
        query = "INSERT INTO transcripts (video_id, transcript) VALUES (%s, %s)"
        cursor.execute(query, (video_id, transcript))
        db.commit()

        # Clean up files
        os.remove(video_path)
        os.remove(audio_path)

        return jsonify({"transcript": transcript})
    else:
        return jsonify({"error": "Failed to transcribe audio"}), 500

# API endpoint to handle chat messages
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    transcript = data.get('transcript')

    if not message or not transcript:
        return jsonify({"error": "Message and transcript are required."}), 400

    # Prepare the conversation context
    context = f"{transcript}\n\nUser: {message}"

    try:
        # Call the OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": context}
            ]
        )
        assistant_response = response.choices[0].message['content']

        return jsonify({"response": assistant_response})
    except Exception as e:
        print(f"Error during OpenAI request: {e}")
        return jsonify({"error": "Failed to fetch response from OpenAI."}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
