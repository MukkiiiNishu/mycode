import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

function ClearButton({ onClick }) {
  return <Button onClick={onClick}>Clear Chat</Button>;
}

export default ClearButton;


const handleClearChat = async () => {
  try {
    // Make a POST request to the backend to clear the chat
    const response = await fetch('/api/allclearchat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clear: true }),
    });

    if (response.ok) {
      setMessages([]); // Clear the frontend chat
    } else {
      console.error('Failed to clear chat on the backend.');
    }
  } catch (error) {
    console.error('Error clearing chat:', error);
  }
};

const handleNewChat = async () => {
  try {
    // Make a POST request to the backend to clear the chat
    const response = await fetch('/api/allclearchat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clear: true }),
    });

    if (response.ok) {
      setMessages([]); // Clear the frontend chat
      setApiKey('');   // Reset the API key
    } else {
      console.error('Failed to clear chat on the backend.');
    }
  } catch (error) {
    console.error('Error clearing chat:', error);
  }
};
