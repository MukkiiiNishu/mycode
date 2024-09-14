let eventSource = null;  // Global variable to track the current EventSource connection

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




const handleSendMessage = async (message) => {
  if (!apiKey) {
    setApiKey(message);
    setMessages([...messages, { role: 'assistant', content: 'OpenAI API key set successfully. Now you can ask your questions!' }]);
  } else if (!videoSrc) {
    setMessages([...messages, { role: 'assistant', content: 'Please upload a video first to start the conversation.' }]);
  } else if (!transcript) {
    setMessages([...messages, { role: 'assistant', content: 'Please upload the transcript for the video to proceed.' }]);
  } else {
    try {
      // Step 1: Send the message and transcript to the backend via POST
      const response = await axios.post('http://localhost:5000/api/send-message', {
        message: message,
        transcript: transcript
      }, {
        withCredentials: true  // Ensure cookies are sent with the request
      });

      // Step 2: Only after the POST request succeeds, start the EventSource for SSE
      if (response.data.success) {
        const eventSource = new EventSource('http://localhost:5000/api/chat', {
          withCredentials: true  // Ensure cookies are sent with SSE request
        });

        // Listen to messages being sent chunk by chunk
        eventSource.onmessage = (event) => {
          console.log("Received event:", event);
          console.log("Received data:", event.data);

          // Append each chunk to the messages
          setMessages((prevMessages) => [
            ...prevMessages, 
            { role: 'assistant', content: event.data }
          ]);
        };

        // Handle errors in the EventSource connection
        eventSource.onerror = (err) => {
          console.error("EventSource error:", err);
          setMessages([...messages, { role: 'assistant', content: 'Error occurred while streaming response.' }]);
          eventSource.close();
        };
      }

    } catch (error) {
      console.error("Error fetching response from the backend:", error);
      setMessages([...messages, { role: 'assistant', content: 'Sorry, something went wrong while fetching the response.' }]);
    }
  }
};




import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';  // Still used for sending messages initially

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

const ChatWindow = React.memo(({ videoSrc, transcript, messages, setMessages, apiKey, setApiKey }) => {
  const chatEndRef = useRef(null);  // Keeps track of chat's bottom

  // Function to scroll to the bottom smoothly as new messages appear
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();  // Always scroll to the bottom when messages change
  }, [messages]);

  // Function to send a message to the backend and start the EventSource for real-time response
  const handleSendMessage = async (message) => {
    if (!apiKey) {
      setApiKey(message);
      setMessages([...messages, { role: 'assistant', content: 'OpenAI API key set successfully. Now you can ask your questions!' }]);
    } else if (!videoSrc) {
      setMessages([...messages, { role: 'assistant', content: 'Please upload a video first to start the conversation.' }]);
    } else if (!transcript) {
      setMessages([...messages, { role: 'assistant', content: 'Please upload the transcript for the video to proceed.' }]);
    } else {
      try {
        // Start listening to the SSE stream from backend
        const eventSource = new EventSource('http://localhost:5000/api/chat');

        // Listen to messages being sent chunk by chunk
        eventSource.onmessage = (event) => {
          // Append each chunk to the messages
          setMessages((prevMessages) => [
            ...prevMessages, 
            { role: 'assistant', content: event.data }
          ]);
        };

        // Handle errors in the EventSource connection
        eventSource.onerror = () => {
          setMessages([...messages, { role: 'assistant', content: 'Error occurred while streaming response.' }]);
          eventSource.close();
        };

        // Send the initial message to the backend via axios (optional)
        await axios.post('http://localhost:5000/api/chat', {
          message: message,
          transcript: transcript
        });

      } catch (error) {
        console.error("Error fetching response from the backend:", error);
        setMessages([...messages, { role: 'assistant', content: 'Sorry, something went wrong while fetching the response.' }]);
      }
    }
  };

  return (
    <ChatContainer>
      {messages.map((msg, index) => (
        <Message key={index} role={msg.role}>
          {msg.content}
        </Message>
      ))}
      <div ref={chatEndRef} /> {/* Keeps track of the bottom of the chat */}
      <Input
        placeholder={apiKey ? "Type your message here..." : "Please enter your OpenAI API key..."}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSendMessage(e.target.value);
            e.target.value = ''; // Clear input after sending
          }
        }}
      />
    </ChatContainer>
  );
});

export default ChatWindow;
