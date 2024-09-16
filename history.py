from flask import Flask, jsonify, request, Response, session, stream_with_context
import time
import mysql.connector

app = Flask(__name__)

# MySQL connection configuration
db_config = {
    'user': 'your_mysql_username',
    'password': 'your_mysql_password',
    'host': 'localhost',
    'database': 'learning_assistant_db'
}

# Initialize the MySQL connection
def get_db_connection():
    return mysql.connector.connect(**db_config)

# Function to add a message to the conversation history
def add_message_to_db(session_id, sender, message):
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "INSERT INTO conversation_history (session_id, sender, message) VALUES (%s, %s, %s)"
    cursor.execute(query, (session_id, sender, message))
    connection.commit()
    cursor.close()
    connection.close()

# Function to retrieve the conversation history for a session
def get_history_from_db(session_id):
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "SELECT sender, message FROM conversation_history WHERE session_id = %s ORDER BY timestamp"
    cursor.execute(query, (session_id,))
    history = cursor.fetchall()
    cursor.close()
    connection.close()
    return history

# Function to clear conversation history for a session
def clear_history_in_db(session_id):
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "DELETE FROM conversation_history WHERE session_id = %s"
    cursor.execute(query, (session_id,))
    connection.commit()
    cursor.close()
    connection.close()

# Route to handle chat requests
@app.route('/api/chat', methods=['GET'])
def chat():
    session_id = session.get('session_id', str(time.time()))  # Unique session identifier
    session['session_id'] = session_id  # Store session ID for this user

    global_message = request.args.get('message', '')
    global_transcript = request.args.get('transcript', '')

    if not global_message or not global_transcript:
        return jsonify({"error": "Message and transcript are missing."}), 400

    context = f"{global_transcript}\n\nUser: {global_message}"

    # Add user message to the database
    add_message_to_db(session_id, 'User', global_message)

    def generate_response():
        try:
            # Simulate chunked responses
            response_chunks = ["This is the first chunk.", "Here comes the second.", "And finally, the last chunk."]
            for i, chunk in enumerate(response_chunks):
                print(f"Sending chunk {i+1}: {chunk}")
                time.sleep(1)  # Simulate delay between chunks
                yield f"data: {chunk}\n\n"  # Send chunk as SSE data

                # Add assistant's response chunks to the database
                add_message_to_db(session_id, 'Assistant', chunk)
            
            # Send a final marker indicating the end of the response
            yield f"data: final_chunk_marker\n\n"
        except Exception as e:
            yield f"data: Error occurred: {str(e)}\n\n"

    return Response(stream_with_context(generate_response()), mimetype='text/event-stream')

# Route to clear chat history
@app.route('/api/allclearchat', methods=['POST'])
def clear_chat():
    session_id = session.get('session_id')

    data = request.get_json()
    if data and data.get('clear', False):
        clear_history_in_db(session_id)  # Clear history in the database for this session
        return jsonify({"message": "Chat history cleared."}), 200
    else:
        return jsonify({"error": "Invalid request."}), 400

# Route to fetch chat history (optional, for debugging or displaying history)
@app.route('/api/history', methods=['GET'])
def get_history():
    session_id = session.get('session_id')
    if session_id:
        history = get_history_from_db(session_id)
        return jsonify(history), 200
    else:
        return jsonify({"error": "No session found."}), 400

if __name__ == '__main__':
    app.run(debug=True)
