import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  padding: 10px 20px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #138496;
  }
`;

function NewChatButton({ onClick }) {
  return <Button onClick={onClick}>New Chat</Button>;
}

export default NewChatButton;
