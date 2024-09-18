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
