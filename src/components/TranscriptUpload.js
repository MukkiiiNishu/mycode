
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin-bottom: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatusMessage = styled.p`
  color: #3498db;
  margin-top: 10px;
  text-align: center;
`;

const TranscriptUpload = React.memo(({ videoSrc, onTranscriptFetched }) => {
  const [loading, setLoading] = useState(false);
  const [transcriptAvailable, setTranscriptAvailable] = useState(false);
  const hasTranscribed = useRef(false); // Track if transcription is already done

  useEffect(() => {
    if (videoSrc && !hasTranscribed.current) {
      setLoading(true);
      setTranscriptAvailable(false);
      hasTranscribed.current = true; // Mark transcription as done

      const formData = new FormData();
      formData.append('video', videoSrc);

      axios.post('http://localhost:5000/api/upload-video', formData)
        .then(response => {
          setLoading(false);
          setTranscriptAvailable(true);
          onTranscriptFetched(response.data.transcript);
        })
        .catch(error => {
          console.error('Error uploading video:', error);
          setLoading(false);
        });
    }
  }, [videoSrc, onTranscriptFetched]);

  useEffect(() => {``
    // Reset transcription status if a new video is uploaded
    return () => {
      hasTranscribed.current = false;
    };
  }, [videoSrc]);

  return (
    <LoaderContainer>
      {loading && (
        <>
          <Loader />
          <StatusMessage>Transcription is in progress...</StatusMessage>
        </>
      )}
      {transcriptAvailable && <StatusMessage>Success, Let's chat!</StatusMessage>}
    </LoaderContainer>
  );
});

export default TranscriptUpload;


// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import axios from 'axios';

// const LoaderContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   margin-top: 20px;
// `;

// const Loader = styled.div`
//   border: 4px solid #f3f3f3;
//   border-top: 4px solid #3498db;
//   border-radius: 50%;
//   width: 40px;
//   height: 40px;
//   animation: spin 2s linear infinite;
//   margin-bottom: 10px;

//   @keyframes spin {
//     0% { transform: rotate(0deg); }
//     100% { transform: rotate(360deg); }
//   }
// `;

// const StatusMessage = styled.p`
//   color: #3498db;
//   margin-top: 10px;
//   text-align: center;
// `;

// function TranscriptUpload({ videoSrc, onTranscriptFetched }) {
//   const [loading, setLoading] = useState(false);
//   const [transcriptAvailable, setTranscriptAvailable] = useState(false);

//   useEffect(() => {
//     if (videoSrc) {
//       setLoading(true); // Start the loader

//       // Create form data to send the video file
//       const formData = new FormData();
//       formData.append('video', videoSrc);

//       // Send video to the backend for transcription
//       axios.post('http://localhost:5000/api/upload-video', formData)
//         .then(response => {
//           setLoading(false);
//           setTranscriptAvailable(true);
//           onTranscriptFetched(response.data.transcript);
//         })
//         .catch(error => {
//           console.error('Error uploading video:', error);
//           setLoading(false);
//         });
//     }
//   }, [videoSrc, onTranscriptFetched]);

//   return (
//     <LoaderContainer>
//       {loading && (
//         <>
//           <Loader />
//           <StatusMessage>Transcription is in progress...</StatusMessage>
//         </>
//       )}
//       {transcriptAvailable && <StatusMessage>Success, Let's chat!</StatusMessage>}
//     </LoaderContainer>
//   );
// }

// export default TranscriptUpload;
