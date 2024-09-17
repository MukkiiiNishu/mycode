from flask import Flask, jsonify, request, Response, stream_with_context
import time
import openai
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
def add_message_to_db(username, role, content):
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "INSERT INTO conversation_history (username, sender, message) VALUES (%s, %s, %s)"
    cursor.execute(query, (username, role, content))
    connection.commit()
    cursor.close()
    connection.close()

# Function to retrieve the conversation history for a username
def get_history_from_db(username):
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "SELECT sender, message FROM conversation_history WHERE username = %s ORDER BY timestamp"
    cursor.execute(query, (username,))
    history = cursor.fetchall()
    cursor.close()
    connection.close()
    return history

# Function to clear conversation history for a username
def clear_history_in_db(username):
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "DELETE FROM conversation_history WHERE username = %s"
    cursor.execute(query, (username,))
    connection.commit()
    cursor.close()
    connection.close()

# Function to convert chat prompt list into a formatted string
def format_chat_prompt(chat_prompt_template):
    formatted_prompt = ""
    for message in chat_prompt_template:
        role = message['role'].capitalize()  # 'user' becomes 'User', 'assistant' becomes 'Assistant'
        content = message['content']
        formatted_prompt += f"{role}: {content}\n"
    return formatted_prompt

# Example function to interact with OpenAI API
def get_openai_response(chat_prompt_template):
    # Convert the prompt template into a string
    formatted_prompt = format_chat_prompt(chat_prompt_template)
    
    # OpenAI API call
    response = openai.Completion.create(
        engine="text-davinci-003",  # Use the appropriate engine
        prompt=formatted_prompt,
        max_tokens=150
    )
    
    return response.choices[0].text.strip()

# Simulating the chat flow
@app.route('/api/chat', methods=['GET'])
def chat():
    # Get the username, message, and transcript from the request
    username = request.args.get('username', '')
    global_message = request.args.get('message', '')
    global_transcript = request.args.get('transcript', '')

    if not username or not global_message or not global_transcript:
        return jsonify({"error": "Username, message, and transcript are required."}), 400

    # Get the updated chat prompt with the new transcript and user message
    chat_prompt_template = get_chat_prompt_template(username, global_transcript, global_message)

    # Format the chat prompt into a string to send to OpenAI
    formatted_prompt = format_chat_prompt(chat_prompt_template)

    # Simulating sending the prompt to OpenAI API and getting a response
    openai_response = get_openai_response(chat_prompt_template)

    # Add user message and OpenAI response to the database
    add_message_to_db(username, 'user', global_message)
    add_message_to_db(username, 'assistant', openai_response)

    def generate_response():
        try:
            # Send OpenAI response back in chunks
            response_chunks = [openai_response]
            for i, chunk in enumerate(response_chunks):
                yield f"data: {chunk}\n\n"

            # Send a final marker indicating the end of the response
            yield f"data: final_chunk_marker\n\n"
        except Exception as e:
            yield f"data: Error occurred: {str(e)}\n\n"

    return Response(stream_with_context(generate_response()), mimetype='text/event-stream')

# Route to clear chat history for a specific username
@app.route('/api/allclearchat', methods=['POST'])
def clear_chat():
    data = request.get_json()
    username = data.get('username', '')

    if not username:
        return jsonify({"error": "Username is required."}), 400

    if data.get('clear', False):
        clear_history_in_db(username)  # Clear history in the database for this username
        return jsonify({"message": f"Chat history for {username} cleared."}), 200
    else:
        return jsonify({"error": "Invalid request."}), 400

# Route to fetch chat history (optional, for debugging or displaying history)
@app.route('/api/history', methods=['GET'])
def get_history():
    username = request.args.get('username', '')
    
    if not username:
        return jsonify({"error": "Username is required."}), 400
    
    history = get_history_from_db(username)
    return jsonify(history), 200

if __name__ == '__main__':
    app.run(debug=True)





from flask import Flask, jsonify, request, Response, session, stream_with_context
import time
import openai
import mysql.connector

app = Flask(__name__)

# Set a secret key for Flask sessions
app.secret_key = 'your_secret_key'

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
def add_message_to_db(session_id, role, content):
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "INSERT INTO conversation_history (session_id, sender, message) VALUES (%s, %s, %s)"
    cursor.execute(query, (session_id, role, content))
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

# Function to convert chat prompt list into a formatted string
def format_chat_prompt(chat_prompt_template):
    formatted_prompt = ""
    for message in chat_prompt_template:
        role = message['role'].capitalize()  # 'user' becomes 'User', 'assistant' becomes 'Assistant'
        content = message['content']
        formatted_prompt += f"{role}: {content}\n"
    return formatted_prompt

# Example function to interact with OpenAI API
def get_openai_response(chat_prompt_template):
    # Convert the prompt template into a string
    formatted_prompt = format_chat_prompt(chat_prompt_template)
    
    # OpenAI API call
    response = openai.Completion.create(
        engine="text-davinci-003",  # Use the appropriate engine
        prompt=formatted_prompt,
        max_tokens=150
    )
    
    return response.choices[0].text.strip()

# Simulating the chat flow
@app.route('/api/chat', methods=['GET'])
def chat():
    # Check if session_id already exists in the session, otherwise create one
    if 'session_id' not in session:
        session['session_id'] = str(time.time())  # Unique session identifier
    
    session_id = session['session_id']

    global_message = request.args.get('message', '')
    global_transcript = request.args.get('transcript', '')

    if not global_message or not global_transcript:
        return jsonify({"error": "Message and transcript are missing."}), 400

    # Get the updated chat prompt with the new transcript and user message
    chat_prompt_template = get_chat_prompt_template(session_id, global_transcript, global_message)

    # Format the chat prompt into a string to send to OpenAI
    formatted_prompt = format_chat_prompt(chat_prompt_template)

    # Simulating sending the prompt to OpenAI API and getting a response
    openai_response = get_openai_response(chat_prompt_template)

    # Add user message and OpenAI response to the database
    add_message_to_db(session_id, 'user', global_message)
    add_message_to_db(session_id, 'assistant', openai_response)

    def generate_response():
        try:
            # Send OpenAI response back in chunks
            response_chunks = [openai_response]
            for i, chunk in enumerate(response_chunks):
                yield f"data: {chunk}\n\n"

            # Send a final marker indicating the end of the response
            yield f"data: final_chunk_marker\n\n"
        except Exception as e:
            yield f"data: Error occurred: {str(e)}\n\n"

    return Response(stream_with_context(generate_response()), mimetype='text/event-stream')

# Route to clear chat history but keep the initial prompt template
@app.route('/api/allclearchat', methods=['POST'])
def clear_chat():
    session_id = session.get('session_id')

    data = request.get_json()
    if data and data.get('clear', False):
        clear_history_in_db(session_id)  # Clear history in the database for this session
        return jsonify({"message": "Chat history cleared but initial prompt retained."}), 200
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





import openai

# Function to convert chat prompt list into a formatted string
def format_chat_prompt(chat_prompt_template):
    formatted_prompt = ""
    
    for message in chat_prompt_template:
        role = message['role'].capitalize()  # 'user' becomes 'User', 'assistant' becomes 'Assistant'
        content = message['content']
        formatted_prompt += f"{role}: {content}\n"
    
    return formatted_prompt

# Example function to interact with OpenAI API
def get_openai_response(chat_prompt_template):
    # Convert the prompt template into a string
    formatted_prompt = format_chat_prompt(chat_prompt_template)
    
    # OpenAI API call
    response = openai.Completion.create(
        engine="text-davinci-003",  # Use the appropriate engine
        prompt=formatted_prompt,
        max_tokens=150
    )
    
    return response.choices[0].text.strip()

# Simulating the chat flow
@app.route('/api/chat', methods=['GET'])
def chat():
    session_id = session.get('session_id', str(time.time()))  # Unique session identifier
    session['session_id'] = session_id  # Store session ID for this user

    global_message = request.args.get('message', '')
    global_transcript = request.args.get('transcript', '')

    if not global_message or not global_transcript:
        return jsonify({"error": "Message and transcript are missing."}), 400

    # Get the updated chat prompt with the new transcript and user message
    chat_prompt_template = get_chat_prompt_template(session_id, global_transcript, global_message)

    # Format the chat prompt into a string to send to OpenAI
    formatted_prompt = format_chat_prompt(chat_prompt_template)

    # Simulating sending the prompt to OpenAI API and getting a response
    openai_response = get_openai_response(chat_prompt_template)

    # Add user message and OpenAI response to the database
    add_message_to_db(session_id, 'user', global_message)
    add_message_to_db(session_id, 'assistant', openai_response)

    def generate_response():
        try:
            # Send OpenAI response back in chunks
            response_chunks = [openai_response]
            for i, chunk in enumerate(response_chunks):
                yield f"data: {chunk}\n\n"

            # Send a final marker indicating the end of the response
            yield f"data: final_chunk_marker\n\n"
        except Exception as e:
            yield f"data: Error occurred: {str(e)}\n\n"

    return Response(stream_with_context(generate_response()), mimetype='text/event-stream')
















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
def add_message_to_db(session_id, role, content):
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "INSERT INTO conversation_history (session_id, sender, message) VALUES (%s, %s, %s)"
    cursor.execute(query, (session_id, role, content))
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

# Function to get the dynamic chat prompt template
def get_chat_prompt_template(session_id, transcript, question):
    # Replace transcript and question in the template
    chat_prompt_template = [
        {"role": "user", "content": transcript},  # Replaces ${TRANSCRIPT}
        {"role": "assistant", "content": "Okay I will answer from transcript"},
        {"role": "user", "content": question},  # Replaces ${Question}
        {"role": "assistant", "content": "Add the response"}
    ]

    # Get the conversation history and append it to the chat prompt template
    history = get_history_from_db(session_id)
    for entry in history:
        chat_prompt_template.append({"role": entry[0], "content": entry[1]})
    
    return chat_prompt_template

# Route to handle chat requests
@app.route('/api/chat', methods=['GET'])
def chat():
    session_id = session.get('session_id', str(time.time()))  # Unique session identifier
    session['session_id'] = session_id  # Store session ID for this user

    global_message = request.args.get('message', '')
    global_transcript = request.args.get('transcript', '')

    if not global_message or not global_transcript:
        return jsonify({"error": "Message and transcript are missing."}), 400

    # Get the updated chat prompt with the new transcript and user message
    chat_prompt_template = get_chat_prompt_template(session_id, global_transcript, global_message)

    # Add user message to the database
    add_message_to_db(session_id, 'user', global_message)

    def generate_response():
        try:
            # Simulate chunked responses
            response_chunks = ["This is the first chunk based on the prompt.", 
                               "Here comes the second chunk.", 
                               "And finally, the last chunk."]
            for i, chunk in enumerate(response_chunks):
                print(f"Sending chunk {i+1}: {chunk}")
                time.sleep(1)  # Simulate delay between chunks
                yield f"data: {chunk}\n\n"  # Send chunk as SSE data

                # Add assistant's response chunks to the database
                add_message_to_db(session_id, 'assistant', chunk)
            
            # Send a final marker indicating the end of the response
            yield f"data: final_chunk_marker\n\n"
        except Exception as e:
            yield f"data: Error occurred: {str(e)}\n\n"

    return Response(stream_with_context(generate_response()), mimetype='text/event-stream')

# Route to clear chat history but keep the initial prompt template
@app.route('/api/allclearchat', methods=['POST'])
def clear_chat():
    session_id = session.get('session_id')

    data = request.get_json()
    if data and data.get('clear', False):
        clear_history_in_db(session_id)  # Clear history in the database for this session
        return jsonify({"message": "Chat history cleared but initial prompt retained."}), 200
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
def add_message_to_db(session_id, role, content):
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "INSERT INTO conversation_history (session_id, sender, message) VALUES (%s, %s, %s)"
    cursor.execute(query, (session_id, role, content))
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

# Initial prompt template
initial_chat_prompt_template = [
    {"role": "user", "content": "Hi"},
    {"role": "assistant", "content": "Hello"},
    {"role": "user", "content": "Add the transcript here automatically which user sent"}
]

# Function to fetch the prompt template for a session
def get_chat_prompt_template(session_id):
    # Start with the initial prompt template
    chat_prompt_template = initial_chat_prompt_template.copy()

    # Get the conversation history and append it to the chat prompt template
    history = get_history_from_db(session_id)
    for entry in history:
        chat_prompt_template.append({"role": entry[0], "content": entry[1]})
    
    return chat_prompt_template

# Route to handle chat requests
@app.route('/api/chat', methods=['GET'])
def chat():
    session_id = session.get('session_id', str(time.time()))  # Unique session identifier
    session['session_id'] = session_id  # Store session ID for this user

    global_message = request.args.get('message', '')
    global_transcript = request.args.get('transcript', '')

    if not global_message or not global_transcript:
        return jsonify({"error": "Message and transcript are missing."}), 400

    # Get the updated chat prompt with the transcript and user message
    chat_prompt_template = get_chat_prompt_template(session_id)
    
    # Add the current user question and transcript to the template
    chat_prompt_template.append({"role": "user", "content": global_message})
    chat_prompt_template.append({"role": "assistant", "content": "Response from assistant goes here."})

    # Add user message and assistant's response to the database
    add_message_to_db(session_id, 'user', global_message)

    def generate_response():
        try:
            # Simulate chunked responses
            response_chunks = ["This is the first chunk based on the prompt.", 
                               "Here comes the second chunk.", 
                               "And finally, the last chunk."]
            for i, chunk in enumerate(response_chunks):
                print(f"Sending chunk {i+1}: {chunk}")
                time.sleep(1)  # Simulate delay between chunks
                yield f"data: {chunk}\n\n"  # Send chunk as SSE data

                # Add assistant's response chunks to the database
                add_message_to_db(session_id, 'assistant', chunk)
            
            # Send a final marker indicating the end of the response
            yield f"data: final_chunk_marker\n\n"
        except Exception as e:
            yield f"data: Error occurred: {str(e)}\n\n"

    return Response(stream_with_context(generate_response()), mimetype='text/event-stream')

# Route to clear chat history but keep the initial prompt template
@app.route('/api/allclearchat', methods=['POST'])
def clear_chat():
    session_id = session.get('session_id')

    data = request.get_json()
    if data and data.get('clear', False):
        clear_history_in_db(session_id)  # Clear history in the database for this session
        return jsonify({"message": "Chat history cleared but initial prompt retained."}), 200
    else:
        return jsonify({"error": "Invalid request."}), 400

# Route to fetch chat history (optional, for debugging or displaying history)
@app.route('/api/history', methods=['GET'])
def get_history():
    session_id = session.get('session_id')
    if session_id:
        history = get_chat_prompt_template(session_id)
        return jsonify(history), 200
    else:
        return jsonify({"error": "No session found."}), 400

if __name__ == '__main__':
    app.run(debug=True)













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
