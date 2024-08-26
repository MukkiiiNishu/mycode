import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 cards per row */
  gap: 20px;
  padding: 20px;
`;

const VideoCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const VideoTitle = styled.h3`
  margin: 10px 0;
  font-size: 16px;
`;

const VideoThumbnail = styled.img`
  width: 100%;
  height: auto;
  border-radius: 10px;
`;

function ServerVideos({ onVideoSelect }) {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/videos')
      .then(response => {
        setVideos(response.data.videos);
      })
      .catch(error => {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos');
      });
  }, []);

  return (
    <>
      {error && <p>{error}</p>}
      <VideoGrid>
        {videos.map((video) => (
          <VideoCard key={video.id} onClick={() => onVideoSelect(video)}>
            <VideoThumbnail src={video.thumbnailUrl || 'https://via.placeholder.com/150'} alt={video.title} />
            <VideoTitle>{video.title}</VideoTitle>
          </VideoCard>
        ))}
      </VideoGrid>
    </>
  );
}

export default ServerVideos;
