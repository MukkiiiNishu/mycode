latest 14 Dec

import os
import uuid
from flask import Flask, request, jsonify, session
from flask_session import Session
from datetime import timedelta
import redis
from rq import Queue
import threading
import time

app = Flask(__name__)

# Flask session configuration
app.secret_key = os.urandom(24)
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_KEY_PREFIX'] = 'flask:'
app.config['SESSION_REDIS'] = redis.StrictRedis(host='localhost', port=6379, db=0)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=2)

Session(app)

# Redis queue setup for parallel task handling
redis_conn = redis.StrictRedis(host='localhost', port=6379, db=1)
queue = Queue(connection=redis_conn)

# Function to transcribe audio
def transcribe_audio(audio_path):
    # Simulate a transcription process
    time.sleep(5)  # Mock delay
    return "Transcribed text from audio"

# Function to process a task (media transcription)
def process_task(media_id, audio_path, mime_type):
    transcript = transcribe_audio(audio_path)
    if transcript:
        # Store transcript in the database (pseudo-code)
        query = "INSERT INTO transcripts (media_id, transcript) VALUES (%s, %s)"
        cursor.execute(query, (media_id, transcript))
        db.commit()

        # Clean up files
        os.remove(audio_path)
        return {"transcript": transcript, "thumbnail": "sample_audio_thumbnail.png" if mime_type.startswith('audio') else None}
    else:
        raise Exception("Failed to transcribe audio")

# Media upload endpoint
@app.route('/api/upload', methods=['POST'])
def upload_media():
    media = request.files.get('media')
    mime_type = media.mimetype if media else None

    if not media:
        return jsonify({"error": "No media uploaded"}), 400

    # Generate session ID and associate it with the user
    session_id = session.get("session_id", str(uuid.uuid4()))
    session["session_id"] = session_id

    media_id = str(uuid.uuid4())
    media_path = f"uploads/{media_id}"

    if mime_type and mime_type.startswith('video'):
        audio_path = f"{media_path}.wav"
        media.save(audio_path)  # Save video and extract audio
    elif mime_type and mime_type.startswith('audio'):
        audio_path = f"{media_path}.wav"
        media.save(audio_path)
    else:
        return jsonify({"error": "Unsupported media type"}), 400

    # Enqueue task for processing
    job = queue.enqueue(process_task, media_id, audio_path, mime_type)

    return jsonify({"message": "Request added to queue", "session_id": session_id, "job_id": job.id})

# Chat endpoint
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    transcript = data.get('transcript')

    if not message or not transcript:
        return jsonify({"error": "Message and transcript are required."}), 400

    # Generate session ID and associate it with the user
    session_id = session.get("session_id", str(uuid.uuid4()))
    session["session_id"] = session_id

    # Prepare conversation context
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

        return jsonify({"response": assistant_response, "session_id": session_id})
    except Exception as e:
        print(f"Error during OpenAI request: {e}")
        return jsonify({"error": "Failed to fetch response from OpenAI."}), 500

# Function to clean up old session data
def clean_up_sessions():
    while True:
        time.sleep(3600)  # Run every hour
        session_store = app.session_interface.redis
        keys = session_store.keys(f"{app.config['SESSION_KEY_PREFIX']}*")
        for key in keys:
            session_store.delete(key)

# Run cleanup in a separate thread
cleanup_thread = threading.Thread(target=clean_up_sessions)
cleanup_thread.daemon = True
cleanup_thread.start()

if __name__ == '__main__':
    app.run(port=5000, debug=True)




multiple threading and server




laytets date : 26th sept
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from moviepy.editor import VideoFileClip
import os
import subprocess
import uuid
import openai
import mimetypes

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

# Function to handle audio files without needing to extract audio (since it's already audio)
def handle_audio_file(audio_path):
    transcript = transcribe_audio(audio_path)
    return transcript

# API endpoint to handle media uploads and transcription (both video and audio)
@app.route('/api/upload-media', methods=['POST'])
def upload_media():
    if 'media' not in request.files:
        return jsonify({"error": "No media file provided"}), 400

    media = request.files['media']
    media_id = str(uuid.uuid4())
    media_path = f"uploads/{media_id}"

    # Get MIME type to distinguish between video and audio files
    mime_type, _ = mimetypes.guess_type(media.filename)

    # Handle video and audio differently based on MIME type
    if mime_type and mime_type.startswith('video'):
        video_path = f"{media_path}.mp4"
        audio_path = f"{media_path}.wav"
        media.save(video_path)

        # Extract audio from video
        if not extract_audio(video_path, audio_path):
            return jsonify({"error": "Failed to extract audio"}), 500
    elif mime_type and mime_type.startswith('audio'):
        audio_path = f"{media_path}.wav"
        media.save(audio_path)
    else:
        return jsonify({"error": "Unsupported media type"}), 400

    # Transcribe audio
    transcript = transcribe_audio(audio_path)

    if transcript:
        # Store transcript in database
        query = "INSERT INTO transcripts (media_id, transcript) VALUES (%s, %s)"
        cursor.execute(query, (media_id, transcript))
        db.commit()

        # Clean up files
        os.remove(audio_path)
        if mime_type.startswith('video'):
            os.remove(video_path)

        return jsonify({"transcript": transcript, "thumbnail": "sample_audio_thumbnail.png" if mime_type.startswith('audio') else None})
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






@app.route('/api/chat', methods=['GET'])
def chat():
    global global_message, global_transcript  # Declare global variables

    # Retrieve the message and transcript from global variables
    if not global_message or not global_transcript:
        return jsonify({"error": "Message and transcript are missing."}), 400

    context = f"{global_transcript}\n\nUser: {global_message}"

    def generate_response():
        try:
            # Simulate chunked responses
            response_chunks = ["This is the first chunk.", "Here comes the second.", "And finally, the last chunk."]
            for i, chunk in enumerate(response_chunks):
                print(f"Sending chunk {i+1}: {chunk}")
                time.sleep(1)  # Simulate delay between chunks
                yield f"data: {chunk}\n\n"  # Send chunk as SSE data
            
            # Send a final marker indicating the end of the response
            yield f"data: final_chunk_marker\n\n"
        except Exception as e:
            yield f"data: Error occurred: {str(e)}\n\n"

    return Response(stream_with_context(generate_response()), mimetype='text/event-stream')







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
