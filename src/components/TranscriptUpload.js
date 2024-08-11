import React from 'react';
import styled from 'styled-components';

const UploadWrapper = styled.div`
  margin-top: 10px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const CustomButton = styled.label`
  padding: 10px 20px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: inline-block;

  &:hover {
    background-color: #218838;
  }
`;

function TranscriptUpload({ onTranscriptUpload }) {
  const handleTranscriptUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      onTranscriptUpload(event.target.result); // Pass the transcript content to the parent component
    };
    reader.readAsText(file);
  };

  return (
    <UploadWrapper>
      <HiddenInput
        type="file"
        accept=".txt"
        id="transcript-upload"
        onChange={handleTranscriptUpload}
      />
      <CustomButton htmlFor="transcript-upload">Upload Transcript</CustomButton>
    </UploadWrapper>
  );
}

export default TranscriptUpload;
