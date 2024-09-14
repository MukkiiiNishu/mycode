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
