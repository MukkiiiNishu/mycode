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
