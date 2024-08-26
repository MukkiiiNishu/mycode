//Latest chnages

import React, { useRef, useEffect } from 'react';
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
  display: flex;
  justify-content: space-between; /* Space buttons on opposite sides */
  align-items: center;
  width: 100%;
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

const ServerVideosButton = styled.button`
  padding: 10px 20px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;

const VideoPlayer = ({ onVideoUpload, videoSrc, navigateToServerVideos }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoSrc && videoRef.current) {
      const videoUrl = URL.createObjectURL(videoSrc);
      videoRef.current.src = videoUrl;

      // Cleanup old URL object to prevent memory leaks
      return () => {
        URL.revokeObjectURL(videoUrl);
      };
    }
  }, [videoSrc]);

  return (
    <>
      <VideoContainer>
        {videoSrc ? (
          <Video ref={videoRef} controls />
        ) : (
          <p>Upload a video to play</p>
        )}
      </VideoContainer>
      <UploadWrapper>
        <CustomButton htmlFor="video-upload">Upload Video</CustomButton>
        <HiddenInput
          type="file"
          accept="video/*"
          id="video-upload"
          onChange={(e) => {
            onVideoUpload(e.target.files[0]); // Handle video upload
          }}
        />
        <ServerVideosButton onClick={navigateToServerVideos}>Server Videos</ServerVideosButton>
      </UploadWrapper>
    </>
  );
};

export default VideoPlayer;


// import React, { useState, useEffect, useRef } from 'react';
// import styled from 'styled-components';

// const VideoContainer = styled.div`
//   width: 100%;
//   height: 60%;
//   background-color: #eaeaea;
//   border-radius: 10px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   margin-bottom: 20px;
// `;

// const Video = styled.video`
//   width: 100%;
//   height: 100%;
//   border-radius: 10px;
// `;

// const UploadWrapper = styled.div`
//   margin-top: 10px;
// `;

// const HiddenInput = styled.input`
//   display: none;
// `;

// const CustomButton = styled.label`
//   padding: 10px 20px;
//   background-color: #007bff;
//   color: #fff;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   display: inline-block;

//   &:hover {
//     background-color: #0056b3;
//   }
// `;

// const VideoPlayer = ({ onVideoUpload, videoSrc }) => {
//   const videoRef = useRef(null);

//   useEffect(() => {
//     if (videoSrc && videoRef.current) {
//       const videoUrl = URL.createObjectURL(videoSrc);
//       videoRef.current.src = videoUrl;

//       // Cleanup old URL object to prevent memory leaks
//       return () => {
//         URL.revokeObjectURL(videoUrl);
//       };
//     }
//   }, [videoSrc]);

//   return (
//     <>
//       <VideoContainer>
//         {videoSrc ? (
//           <Video ref={videoRef} controls />
//         ) : (
//           <p>Upload a video to play</p>
//         )}
//       </VideoContainer>
//       <UploadWrapper>
//         <HiddenInput
//           type="file"
//           accept="video/*"
//           id="video-upload"
//           onChange={(e) => {
//             onVideoUpload(e.target.files[0]); // Handle video upload
//           }}
//         />
//         <CustomButton htmlFor="video-upload">Upload Video</CustomButton>
//       </UploadWrapper>
//     </>
//   );
// };

// export default VideoPlayer;



// import React, { useState } from 'react';
// import styled from 'styled-components';

// const VideoContainer = styled.div`
//   width: 100%;
//   height: 60%;
//   background-color: #eaeaea;
//   border-radius: 10px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   margin-bottom: 20px;
// `;

// const Video = styled.video`
//   width: 100%;
//   height: 100%;
//   border-radius: 10px;
// `;

// const UploadWrapper = styled.div`
//   margin-top: 10px;
// `;

// const HiddenInput = styled.input`
//   display: none;
// `;

// const CustomButton = styled.label`
//   padding: 10px 20px;
//   background-color: #007bff;
//   color: #fff;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   display: inline-block;

//   &:hover {
//     background-color: #0056b3;
//   }
// `;

// function VideoPlayer({ onVideoUpload }) {
//   const [videoSrc, setVideoSrc] = useState(null);

//   const handleVideoUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setVideoSrc(url);
//       onVideoUpload(file); // Pass the video file to the parent component
//     }
//   };

//   return (
//     <>
//       <VideoContainer>
//         {videoSrc ? (
//           <Video controls>
//             <source src={videoSrc} type="video/mp4" />
//             Your browser does not support the video tag.
//           </Video>
//         ) : (
//           <p>Upload a video to play</p>
//         )}
//       </VideoContainer>
//       <UploadWrapper>
//         <HiddenInput
//           type="file"
//           accept="video/*"
//           id="video-upload"
//           onChange={handleVideoUpload}
//         />
//         <CustomButton htmlFor="video-upload">Upload Video</CustomButton>
//       </UploadWrapper>
//     </>
//   );
// }

// export default VideoPlayer;
