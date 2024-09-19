
/* Global chat container */
.chat-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  max-width: 900px;
  margin: auto;
  font-family: 'Roboto', sans-serif;
  background-color: #f4f6f9;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

/* Message area */
.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px 10px 0 0;
}

/* Message box container */
.message-box {
  display: flex;
  align-items: flex-start;
  margin: 10px 0;
}

/* User message container */
.message-box.user {
  justify-content: flex-end;
}

/* Assistant message container */
.message-box.assistant {
  justify-content: flex-start;
}

/* Avatar styles */
.message-box .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

/* User and assistant message bubbles */
.message-box .message-content {
  padding: 15px;
  font-size: 15px;
  border-radius: 15px;
  max-width: 70%;
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Styling for user's message */
.message-box.user .message-content {
  background-color: #e0f7fa;
  color: #004d40;
  border-bottom-right-radius: 0;
}

/* Styling for assistant's message */
.message-box.assistant .message-content {
  background-color: #eeeeee;
  color: #424242;
  border-bottom-left-radius: 0;
}

/* Input container */
.chat-input-container {
  display: flex;
  padding: 15px;
  background-color: #f4f6f9;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 10px 10px;
}

/* Chat input styling */
.chat-input-container input[type="text"] {
  flex-grow: 1;
  padding: 10px 15px;
  font-size: 16px;
  border-radius: 20px;
  border: 1px solid #ccc;
  outline: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Send button styling */
.chat-input-container button {
  margin-left: 10px;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 20px;
  background-color: #1976d2;
  color: #fff;
  border: none;
  cursor: pointer;
}

.chat-input-container button:hover {
  background-color: #1565c0;
}

/* New Chat and Clear Chat buttons */
.chat-buttons {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f4f6f9;
}

.chat-buttons .button {
  padding: 10px 20px;
  background-color: #1976d2;
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.chat-buttons .button:hover {
  background-color: #1565c0;
}


import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  let eventSource = null;
  let assistantResponse = '';

  // Function to handle sending a message
  const handleSendMessage = async (message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },  // User's message stays in its own box
      { role: 'assistant', content: '...' }  // Create a single assistant message box with placeholder
    ]);

    try {
      // Initialize the EventSource connection for streaming assistant response
      eventSource = new EventSource('http://localhost:5000/api/chat');

      eventSource.onmessage = (event) => {
        console.log("Received chunk of data from EventSource:", event.data);
        assistantResponse += event.data;  // Append new chunk to the assistant's response

        // Update the assistant's message content in the chat using ReactMarkdown
        setMessages((prevMessages) => 
          prevMessages.map((msg) => 
            msg.role === 'assistant' ? { ...msg, content: assistantResponse } : msg
          )
        );

        // Close the EventSource once the full response is received (using a final chunk marker)
        if (event.data.includes("final_chunk_marker")) {
          console.log("Final chunk marker detected. Closing EventSource.");
          eventSource.close();  // Close the connection after receiving the full response
          eventSource = null;  // Reset eventSource for the next question
        }
      };

      eventSource.onerror = (err) => {
        console.error("Error in EventSource connection:", err);
        setMessages((prevMessages) => 
          prevMessages.map((msg) => 
            msg.role === 'assistant' ? { ...msg, content: 'Error occurred while fetching response.' } : msg
          )
        );
        eventSource.close();
        eventSource = null;  // Reset eventSource after an error
      };

    } catch (error) {
      console.error("Error during POST request or EventSource initialization:", error);
      setMessages([...messages, { role: 'assistant', content: 'Sorry, something went wrong while fetching the response.' }]);
    }
  };

  // Handle Enter keypress to send message
  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedMessage = inputMessage.trim();
      if (trimmedMessage) {
        handleSendMessage(trimmedMessage);
        setInputMessage('');  // Clear input after sending the message
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div className={`message-box ${msg.role}`} key={index}>
            <div className="avatar">
              <img src={msg.role === 'user' ? 'path-to-user-avatar.png' : 'path-to-assistant-avatar.png'} alt="avatar" />
            </div>
            <div className="message-content">
              {/* Use ReactMarkdown to render markdown content */}
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Type your message here..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleInputKeyPress}
        />
        <button onClick={() => handleSendMessage(inputMessage)}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;



date : 19th sept

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column-reverse; /* Messages appear from bottom to top */
  background-color: #f7f7f7;
  border-radius: 10px;
  padding: 10px;
  overflow-y: auto;
  max-height: 50vh; /* Ensure the chat container occupies 50% of the screen */
  margin-bottom: 20px;
`;

const Message = styled.div`
  word-wrap: break-word; /* Break long words */
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  background-color: ${({ role }) => (role === 'user' ? '#0056b3' : '#e0e0e0')}; /* Improved contrast for user message */
  color: ${({ role }) => (role === 'user' ? '#fff' : '#333')};
  align-self: ${({ role }) => (role === 'user' ? 'flex-end' : 'flex-start')};
  max-width: 70%; /* Prevent overflow, limit message width */
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: calc(100% - 22px);
  position: sticky; /* Fix the input box at the bottom */
  bottom: 0;
  background-color: #fff;
  box-shadow: 0px -1px 5px rgba(0, 0, 0, 0.1); /* Slight shadow for visibility */
`;

const ChatWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh; /* Ensure the entire screen is used */
  justify-content: flex-end; /* Keep the input box at the bottom */
`;





import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f7f7f8;
  font-family: 'Inter', sans-serif;
`;

const MessagesWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const MessageContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 10px 0;
  position: relative;

  &:hover .copy-button {
    display: block;
  }
`;

const MessageContent = styled.div`
  max-width: 75%;
  padding: 12px 15px;
  border-radius: 8px;
  background-color: ${({ role }) => (role === 'user' ? '#ececf1' : '#ffffff')}; /* User msg: light gray, Assistant: white */
  color: ${({ role }) => (role === 'user' ? '#1a1a1b' : '#1a1a1b')}; /* Dark gray for both */
  font-size: 16px;
  line-height: 1.6;
  word-wrap: break-word;
  box-shadow: ${({ role }) => (role === 'user' ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : '0px 2px 4px rgba(0, 0, 0, 0.05)')};
  position: relative;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 15px;
`;

const InputContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
  border-top: 1px solid #eaeaea;
  position: sticky;
  bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;
  box-shadow: 0px -1px 4px rgba(0, 0, 0, 0.05);
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  margin-right: 10px;
  width: 100%;
`;

const SendButton = styled.button`
  background-color: #007bff;
  border: none;
  padding: 10px 16px;
  border-radius: 5px;
  color: white;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const SystemMessage = styled.div`
  font-size: 14px;
  color: #555;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 500;
`;

const CopyButton = styled.button`
  display: none;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 14px;
  color: #007bff;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'This is for learning purposes. Use it wisely, and hope you enjoy using this tool!' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to the bottom of the chat when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const userAvatar = 'path_to_user_avatar.png'; // Replace with actual user avatar path
  const assistantAvatar = 'path_to_assistant_avatar.png'; // Replace with actual assistant avatar path

  const handleSendMessage = async (messageContent) => {
    if (messageContent.trim() === "") return;

    try {
      const newMessages = [...messages, { role: 'user', content: messageContent }];
      setMessages(newMessages);

      // Simulating assistant response (replace with actual API call)
      const assistantResponse = "This is a response from the assistant.";
      setMessages([...newMessages, { role: 'assistant', content: assistantResponse }]);
    } catch (error) {
      console.error("Error during message sending:", error);
      setMessages([...messages, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    }

    setInputMessage(''); // Clear input after sending the message
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  // Copy message content to clipboard
  const handleCopyMessage = (messageContent) => {
    navigator.clipboard.writeText(messageContent)
      .then(() => {
        alert("Message copied to clipboard!"); // Optional confirmation (can replace with a toast message)
      })
      .catch((err) => {
        console.error("Failed to copy message", err);
      });
  };

  return (
    <ChatContainer>
      {/* Chat messages */}
      <MessagesWrapper>
        {/* System message */}
        <SystemMessage>
          This is for learning purposes. Use it wisely, and hope you enjoy using this tool!
        </SystemMessage>

        {/* Render chat messages */}
        {messages.slice(1).map((msg, index) => (
          <MessageContainer key={index}>
            <Avatar src={msg.role === 'user' ? userAvatar : assistantAvatar} alt={`${msg.role}-avatar`} />
            <MessageContent role={msg.role}>
              <span dangerouslySetInnerHTML={{ __html: msg.content }} />
            </MessageContent>
            <CopyButton className="copy-button" onClick={() => handleCopyMessage(msg.content)}>
              Copy
            </CopyButton>
          </MessageContainer>
        ))}

        {/* Dummy div to ensure scroll stays at the bottom */}
        <div ref={messagesEndRef} />
      </MessagesWrapper>

      {/* Input field with Send Button */}
      <InputContainer>
        <Input
          type="text"
          placeholder="Type your message here..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleInputKeyPress}
        />
        <SendButton onClick={() => handleSendMessage(inputMessage)} disabled={!inputMessage.trim()}>
          Send
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatWindow;





import React, { useState } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  background-color: #f7f7f8;
  overflow-y: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const MessageContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const MessageContent = styled.div`
  max-width: 80%;
  padding: 10px;
  border-radius: 10px;
  background-color: ${({ role }) => (role === 'user' ? '#d1e7ff' : '#e9e9e9')};
  color: ${({ role }) => (role === 'user' ? '#0d6efd' : '#333')};
  font-size: 15px;
  line-height: 1.5;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const InputContainer = styled.div`
  margin-top: auto;
  display: flex;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  font-size: 15px;
  margin-top: 10px;
`;

const SystemMessage = styled.div`
  font-size: 13px;
  color: #888;
  text-align: center;
  margin-bottom: 20px;
`;

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'This is for learning purposes. Use it wisely, and hope you enjoy using this tool!' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const userAvatar = 'path_to_user_avatar.png'; // Replace with the actual path or URL
  const assistantAvatar = 'path_to_assistant_avatar.png'; // Replace with the actual path or URL

  const handleSendMessage = async (messageContent) => {
    try {
      const newMessages = [...messages, { role: 'user', content: messageContent }];
      setMessages(newMessages);

      // Simulating assistant response (replace with actual API call)
      const assistantResponse = "This is a dummy response from the assistant.";
      setMessages([...newMessages, { role: 'assistant', content: assistantResponse }]);

    } catch (error) {
      console.error("Error during POST request or EventSource initialization:", error);
      setMessages([...messages, { role: 'assistant', content: 'Sorry, something went wrong while fetching the response.' }]);
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedMessage = inputMessage.trim();
      if (trimmedMessage) {
        handleSendMessage(trimmedMessage);
        setInputMessage(''); // Clear input after sending the message
      }
    }
  };

  return (
    <ChatContainer>
      {/* System message */}
      <SystemMessage>
        This is for learning purposes. Use it wisely, and hope you enjoy using this tool!
      </SystemMessage>

      {/* Render chat messages */}
      {messages.slice(1).map((msg, index) => (
        <MessageContainer key={index}>
          <Avatar
            src={msg.role === 'user' ? userAvatar : assistantAvatar}
            alt={`${msg.role}-avatar`}
          />
          <MessageContent role={msg.role}>
            <span dangerouslySetInnerHTML={{ __html: msg.content }} />
          </MessageContent>
        </MessageContainer>
      ))}

      {/* Input field */}
      <InputContainer>
        <Input
          type="text"
          placeholder="Type your message here..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleInputKeyPress}
        />
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatWindow;







let eventSource = null;  // Global variable to track the current EventSource connection

const ChatWindow = ({ videoSrc, transcript, messages, setMessages, apiKey, setApiKey }) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async (message) => {
    if (!apiKey) {
      console.log("API key is not set, setting API key.");
      setApiKey(message);
      setMessages([...messages, { role: 'assistant', content: 'OpenAI API key set successfully. Now you can ask your questions!' }]);
    } else if (!videoSrc) {
      console.log("No video source available.");
      setMessages([...messages, { role: 'assistant', content: 'Please upload a video first to start the conversation.' }]);
    } else if (!transcript) {
      console.log("No transcript available.");
      setMessages([...messages, { role: 'assistant', content: 'Please upload the transcript for the video to proceed.' }]);
    } else {
      try {
        // Step 1: Ensure any existing EventSource connection is fully closed
        if (eventSource) {
          console.log("Closing existing EventSource connection before starting a new one.");
          eventSource.close();
          eventSource = null;  // Reset the eventSource to null
        }

        console.log("Sending POST request to backend with message:", message);

        // Step 2: Send the message and transcript to the backend via POST
        const response = await axios.post('http://localhost:5000/api/send-message', {
          message: message,
          transcript: transcript
        });

        if (response.data.success) {
          console.log("POST request successful, initializing new EventSource.");

          let assistantResponse = '';  // Reset the assistant's response for the new message

          // Add the user message to the chat
          setMessages((prevMessages) => [
            ...prevMessages, 
            { role: 'user', content: message },  // User's message stays in its own box
            { role: 'assistant', content: '...' }  // Create a separate assistant message box for this response
          ]);

          // Capture the index of the new assistant message
          const newAssistantIndex = messages.length + 1;  // This points to the latest assistant message

          // Step 3: Initialize a new EventSource connection for the current question
          eventSource = new EventSource('http://localhost:5000/api/chat');

          // Function to convert newlines to HTML line breaks
          const formatTextWithNewlines = (text) => {
            return text.replace(/\n/g, "<br />").replace(/\n{2,}/g, "<br /><br />");
          };

          // Listen to messages being sent chunk by chunk
          eventSource.onmessage = (event) => {
            console.log("Received chunk of data from EventSource:", event.data);

            // Check if it's the exact final chunk marker and don't append it
            if (event.data.trim() === "final_chunk_marker") {
              console.log("Final chunk marker detected. Closing EventSource.");
              eventSource.close();  // Close the connection after receiving the full response
              eventSource = null;  // Reset eventSource for the next question
              return;  // Do not append the final chunk marker to the assistant's message
            }

            assistantResponse += event.data;  // Append new chunk to the assistant's response

            // Only update the latest assistant's message (the one we just added)
            setMessages((prevMessages) => 
              prevMessages.map((msg, idx) => 
                idx === newAssistantIndex ? { ...msg, content: formatTextWithNewlines(assistantResponse) } : msg
              )
            );
          };

          // Handle errors in the EventSource connection
          eventSource.onerror = (err) => {
            console.error("Error in EventSource connection:", err);
            setMessages((prevMessages) => 
              prevMessages.map((msg, idx) => 
                idx === newAssistantIndex ? { ...msg, content: 'Error occurred while fetching response.' } : msg
              )
            );
            eventSource.close();
            eventSource = null;  // Reset eventSource after an error
          };
        } else {
          console.log("POST request failed.");
        }

      } catch (error) {
        console.error("Error during POST request or EventSource initialization:", error);
        setMessages([...messages, { role: 'assistant', content: 'Sorry, something went wrong while fetching the response.' }]);
      }
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();  // Prevent the default form submission behavior
      const trimmedMessage = inputMessage.trim();
      if (trimmedMessage) {
        handleSendMessage(trimmedMessage);
        setInputMessage('');  // Clear input after sending the message
      }
    }
  };

  return (
    <ChatContainer>
      {messages.map((msg, index) => (
        <Message key={index} role={msg.role}>
          <span dangerouslySetInnerHTML={{ __html: msg.content }} />
        </Message>
      ))}
      <Input
        type="text"
        placeholder="Type your message here..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleInputKeyPress}
      />
    </ChatContainer>
  );
};

export default ChatWindow;











let eventSource = null;  // Global variable to track the current EventSource connection

const ChatWindow = ({ videoSrc, transcript, messages, setMessages, apiKey, setApiKey }) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async (message) => {
    if (!apiKey) {
      console.log("API key is not set, setting API key.");
      setApiKey(message);
      setMessages([...messages, { role: 'assistant', content: 'OpenAI API key set successfully. Now you can ask your questions!' }]);
    } else if (!videoSrc) {
      console.log("No video source available.");
      setMessages([...messages, { role: 'assistant', content: 'Please upload a video first to start the conversation.' }]);
    } else if (!transcript) {
      console.log("No transcript available.");
      setMessages([...messages, { role: 'assistant', content: 'Please upload the transcript for the video to proceed.' }]);
    } else {
      try {
        // Step 1: Ensure any existing EventSource connection is fully closed
        if (eventSource) {
          console.log("Closing existing EventSource connection before starting a new one.");
          eventSource.close();
          eventSource = null;  // Reset the eventSource to null
        }

        console.log("Sending POST request to backend with message:", message);

        // Step 2: Send the message and transcript to the backend via POST
        const response = await axios.post('http://localhost:5000/api/send-message', {
          message: message,
          transcript: transcript
        });

        if (response.data.success) {
          console.log("POST request successful, initializing new EventSource.");

          let assistantResponse = '';  // Reset the assistant's response for the new message

          // Add the user message to the chat
          setMessages((prevMessages) => [
            ...prevMessages, 
            { role: 'user', content: message },  // User's message stays in its own box
            { role: 'assistant', content: '...' }  // Create a separate assistant message box for this response
          ]);

          // Capture the index of the new assistant message
          const newAssistantIndex = messages.length + 1;  // This points to the latest assistant message

          // Step 3: Initialize a new EventSource connection for the current question
          eventSource = new EventSource('http://localhost:5000/api/chat');

          // Listen to messages being sent chunk by chunk
          eventSource.onmessage = (event) => {
            console.log("Received chunk of data from EventSource:", event.data);

            // Check if it's the final chunk marker and don't append it
            if (event.data.includes("final_chunk_marker")) {
              console.log("Final chunk marker detected. Closing EventSource.");
              eventSource.close();  // Close the connection after receiving the full response
              eventSource = null;  // Reset eventSource for the next question
              return;  // Do not append the final chunk marker to the assistant's message
            }

            assistantResponse += event.data;  // Append new chunk to the assistant's response

            // Only update the latest assistant's message (the one we just added)
            setMessages((prevMessages) => 
              prevMessages.map((msg, idx) => 
                idx === newAssistantIndex ? { ...msg, content: assistantResponse.replace(/\n/g, "<br />") } : msg
              )
            );
          };

          // Handle errors in the EventSource connection
          eventSource.onerror = (err) => {
            console.error("Error in EventSource connection:", err);
            setMessages((prevMessages) => 
              prevMessages.map((msg, idx) => 
                idx === newAssistantIndex ? { ...msg, content: 'Error occurred while fetching response.' } : msg
              )
            );
            eventSource.close();
            eventSource = null;  // Reset eventSource after an error
          };
        } else {
          console.log("POST request failed.");
        }

      } catch (error) {
        console.error("Error during POST request or EventSource initialization:", error);
        setMessages([...messages, { role: 'assistant', content: 'Sorry, something went wrong while fetching the response.' }]);
      }
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();  // Prevent the default form submission behavior
      const trimmedMessage = inputMessage.trim();
      if (trimmedMessage) {
        handleSendMessage(trimmedMessage);
        setInputMessage('');  // Clear input after sending the message
      }
    }
  };

  return (
    <ChatContainer>
      {messages.map((msg, index) => (
        <Message key={index} role={msg.role}>
          <span dangerouslySetInnerHTML={{ __html: msg.content }} />
        </Message>
      ))}
      <Input
        type="text"
        placeholder="Type your message here..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleInputKeyPress}
      />
    </ChatContainer>
  );
};

export default ChatWindow;




import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f7f7f7;
  border-radius: 10px;
  padding: 10px;
  overflow-y: auto;
  margin-bottom: 20px;
`;

const Message = styled.div`
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  background-color: ${({ role }) => (role === 'user' ? '#007bff' : '#e0e0e0')};
  color: ${({ role }) => (role === 'user' ? '#fff' : '#333')};
  align-self: ${({ role }) => (role === 'user' ? 'flex-end' : 'flex-start')};
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: calc(100% - 22px);
`;

let eventSource = null;  // Global variable to track the current EventSource connection

const ChatWindow = ({ videoSrc, transcript, messages, setMessages, apiKey, setApiKey }) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async (message) => {
    if (!apiKey) {
      console.log("API key is not set, setting API key.");
      setApiKey(message);
      setMessages([...messages, { role: 'assistant', content: 'OpenAI API key set successfully. Now you can ask your questions!' }]);
    } else if (!videoSrc) {
      console.log("No video source available.");
      setMessages([...messages, { role: 'assistant', content: 'Please upload a video first to start the conversation.' }]);
    } else if (!transcript) {
      console.log("No transcript available.");
      setMessages([...messages, { role: 'assistant', content: 'Please upload the transcript for the video to proceed.' }]);
    } else {
      try {
        // Step 1: Ensure any existing EventSource connection is fully closed
        if (eventSource) {
          console.log("Closing existing EventSource connection before starting a new one.");
          eventSource.close();
          eventSource = null;  // Reset the eventSource to null
        }

        console.log("Sending POST request to backend with message:", message);

        // Step 2: Send the message and transcript to the backend via POST
        const response = await axios.post('http://localhost:5000/api/send-message', {
          message: message,
          transcript: transcript
        });

        if (response.data.success) {
          console.log("POST request successful, initializing new EventSource.");

          let assistantResponse = '';  // Reset the assistant's response for the new message

          // Add the user message to the chat
          setMessages((prevMessages) => [
            ...prevMessages, 
            { role: 'user', content: message },  // User's message stays in its own box
            { role: 'assistant', content: '...' }  // Create a single assistant message box
          ]);

          // Step 3: Initialize a new EventSource connection for the current question
          eventSource = new EventSource('http://localhost:5000/api/chat');

          // Listen to messages being sent chunk by chunk
          eventSource.onmessage = (event) => {
            console.log("Received chunk of data from EventSource:", event.data);
            assistantResponse += event.data;  // Append new chunk to the assistant's response

            // Update the assistant's message content in the chat
            setMessages((prevMessages) => 
              prevMessages.map((msg) => 
                msg.role === 'assistant' ? { ...msg, content: assistantResponse.replace(/\n/g, "<br />") } : msg
              )
            );

            // Close the EventSource once the full response is received (using a final chunk marker)
            if (event.data.includes("final_chunk_marker")) {
              console.log("Final chunk marker detected. Closing EventSource.");
              eventSource.close();  // Close the connection after receiving the full response
              eventSource = null;  // Reset eventSource for the next question
            }
          };

          // Handle errors in the EventSource connection
          eventSource.onerror = (err) => {
            console.error("Error in EventSource connection:", err);
            setMessages((prevMessages) => 
              prevMessages.map((msg) => 
                msg.role === 'assistant' ? { ...msg, content: 'Error occurred while fetching response.' } : msg
              )
            );
            eventSource.close();
            eventSource = null;  // Reset eventSource after an error
          };
        } else {
          console.log("POST request failed.");
        }

      } catch (error) {
        console.error("Error during POST request or EventSource initialization:", error);
        setMessages([...messages, { role: 'assistant', content: 'Sorry, something went wrong while fetching the response.' }]);
      }
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();  // Prevent the default form submission behavior
      const trimmedMessage = inputMessage.trim();
      if (trimmedMessage) {
        handleSendMessage(trimmedMessage);
        setInputMessage('');  // Clear input after sending the message
      }
    }
  };

  return (
    <ChatContainer>
      {messages.map((msg, index) => (
        <Message key={index} role={msg.role}>
          <span dangerouslySetInnerHTML={{ __html: msg.content }} />
        </Message>
      ))}
      <Input
        type="text"
        placeholder="Type your message here..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleInputKeyPress}
      />
    </ChatContainer>
  );
};

export default ChatWindow;
