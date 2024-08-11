import React, { useState } from 'react';
import styled from 'styled-components';

const VideoContainer = styled.div`
  width: 100%;
  height: 60%;
  background-color: #eaeaea;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  border-radius: 10px;
`;

const UploadWrapper = styled.div`
  margin-top: 10px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const CustomButton = styled.label`
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: inline-block;

  &:hover {
    background-color: #0056b3;
  }
`;

function VideoPlayer({ onVideoUpload }) {
  const [videoSrc, setVideoSrc] = useState(null);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      onVideoUpload(url); // Pass the video URL to the parent component
    }
  };

  return (
    <>
      <VideoContainer>
        {videoSrc ? (
          <Video controls>
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </Video>
        ) : (
          <p>Upload a video to play</p>
        )}
      </VideoContainer>
      <UploadWrapper>
        <HiddenInput
          type="file"
          accept="video/*"
          id="video-upload"
          onChange={handleVideoUpload}
        />
        <CustomButton htmlFor="video-upload">Upload Video</CustomButton>
      </UploadWrapper>
    </>
  );
}

export default VideoPlayer;
