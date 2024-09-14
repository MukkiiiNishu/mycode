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
        console.log("Received event:", event);  // Log the entire event object
        console.log("Received data:", event.data);  // Log the data inside the event
        
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

      // Send the initial message to the backend via axios
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
