import React, { useState } from 'react';
import { GlobalStyles } from './styles/GlobalStyles';
import VideoPlayer from './components/VideoPlayer';
import TranscriptUpload from './components/TranscriptUpload';
import ChatWindow from './components/ChatWindow';
import ClearButton from './components/ClearButton';
import NewChatButton from './components/NewChatButton';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  padding: 20px;
`;

const LeftPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`;

const RightPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

function App() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [messages, setMessages] = useState([]);  // This state manages the chat messages
  const [apiKey, setApiKey] = useState('');  // This state manages the API key

  const handleVideoUpload = (file) => {
    setVideoSrc(file); // Pass the file object to TranscriptUpload
  };

  const handleTranscriptFetched = (transcriptData) => {
    setTranscript(transcriptData);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleNewChat = () => {
    setMessages([]);
    setApiKey('');  // Optionally reset the API key
  };

  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <LeftPane>
          <h2>Learning Assistant</h2>
          <VideoPlayer onVideoUpload={handleVideoUpload} />
          <TranscriptUpload videoSrc={videoSrc} onTranscriptFetched={handleTranscriptFetched} />
        </LeftPane>
        <RightPane>
          <ChatWindow
            videoSrc={videoSrc}
            transcript={transcript}
            messages={messages}
            setMessages={setMessages}
            apiKey={apiKey}
            setApiKey={setApiKey}
          />
          <ButtonContainer>
            <NewChatButton onClick={handleNewChat} />
            <ClearButton onClick={handleClearChat} />
          </ButtonContainer>
        </RightPane>
      </AppContainer>
    </>
  );
}

export default App;
