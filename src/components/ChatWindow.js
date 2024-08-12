import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

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
  width: calc(100% - 22px); /* Full width minus padding and border */
`;

const ChatWindow = React.memo(({ videoSrc, transcript, messages, setMessages, apiKey, setApiKey }) => {
  const chatEndRef = useRef(null); // Reference to the end of the chat

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom whenever messages change
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!apiKey) {
      setApiKey(message); // Save the API key if not already provided
      setMessages([...messages, { role: 'assistant', content: 'OpenAI API key set successfully. Now you can ask your questions!' }]);
    } else if (!videoSrc) {
      setMessages([...messages, { role: 'assistant', content: 'Please upload a video first to start the conversation.' }]);
    } else if (!transcript) {
      setMessages([...messages, { role: 'assistant', content: 'Please upload the transcript for the video to proceed.' }]);
    } else {
      try {
        // Send the message and transcript to the backend
        const response = await axios.post('http://localhost:5000/api/chat', {
          message: message,
          transcript: transcript
        });

        const assistantResponse = response.data.response;

        // Add the user's message and the assistant's response to the chat
        setMessages([...messages, { role: 'user', content: message }, { role: 'assistant', content: assistantResponse }]);
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
      <div ref={chatEndRef} /> {/* This div keeps track of the chat's end */}
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


// import React, { useState, useEffect, useRef } from 'react';
// import styled from 'styled-components';
// import axios from 'axios';

// const ChatContainer = styled.div`
//   flex: 1;
//   display: flex;
//   flex-direction: column;
//   background-color: #f7f7f7;
//   border-radius: 10px;
//   padding: 10px;
//   overflow-y: auto;
//   margin-bottom: 20px;
// `;

// const Message = styled.div`
//   padding: 10px;
//   margin-bottom: 10px;
//   border-radius: 5px;
//   background-color: ${({ role }) => (role === 'user' ? '#007bff' : '#e0e0e0')};
//   color: ${({ role }) => (role === 'user' ? '#fff' : '#333')};
//   align-self: ${({ role }) => (role === 'user' ? 'flex-end' : 'flex-start')};
// `;

// const Input = styled.input`
//   padding: 10px;
//   border-radius: 5px;
//   border: 1px solid #ccc;
//   width: calc(100% - 22px); /* Full width minus padding and border */
// `;

// const ChatWindow = React.memo(({ videoSrc, transcript, messages, setMessages, apiKey, setApiKey }) => {
//   const chatEndRef = useRef(null); // Reference to the end of the chat

//   // Function to scroll to the bottom of the chat
//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom(); // Scroll to bottom whenever messages change
//   }, [messages]);

//   const handleSendMessage = async (message) => {
//     if (!apiKey) {
//       setApiKey(message); // Save the API key if not already provided
//       setMessages([...messages, { role: 'assistant', content: 'OpenAI API key set successfully. Now you can ask your questions!' }]);
//     } else if (!videoSrc) {
//       setMessages([...messages, { role: 'assistant', content: 'Please upload a video first to start the conversation.' }]);
//     } else if (!transcript) {
//       setMessages([...messages, { role: 'assistant', content: 'Please upload the transcript for the video to proceed.' }]);
//     } else {
//       // Combine the transcript and the current conversation as context
//       const context = transcript + "\n\n" + messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join("\n") + "\n\nUser: " + message;

//       try {
//         const response = await axios.post(
//           'https://api.openai.com/v1/chat/completions',
//           {
//             model: 'gpt-3.5-turbo',
//             messages: [
//               { role: 'system', content: 'You are a helpful assistant.' },
//               { role: 'user', content: context }
//             ]
//           },
//           {
//             headers: {
//               'Authorization': `Bearer ${apiKey}`,
//               'Content-Type': 'application/json'
//             }
//           }
//         );

//         const assistantResponse = response.data.choices[0].message.content;

//         // Add the user's message and the assistant's response to the chat
//         setMessages([...messages, { role: 'user', content: message }, { role: 'assistant', content: assistantResponse }]);
//       } catch (error) {
//         console.error("Error fetching response from OpenAI:", error);
//         setMessages([...messages, { role: 'assistant', content: 'Sorry, something went wrong while fetching the response.' }]);
//       }
//     }
//   };

//   return (
//     <ChatContainer>
//       {messages.map((msg, index) => (
//         <Message key={index} role={msg.role}>
//           {msg.content}
//         </Message>
//       ))}
//       <div ref={chatEndRef} /> {/* This div keeps track of the chat's end */}
//       <Input
//         placeholder={apiKey ? "Type your message here..." : "Please enter your OpenAI API key..."}
//         onKeyPress={(e) => {
//           if (e.key === 'Enter') {
//             handleSendMessage(e.target.value);
//             e.target.value = ''; // Clear input after sending
//           }
//         }}
//       />
//     </ChatContainer>
//   );
// });

// export default ChatWindow;


// // import React, { useState } from 'react';
// // import styled from 'styled-components';
// // import axios from 'axios';

// // const ChatContainer = styled.div`
// //   flex: 1;
// //   display: flex;
// //   flex-direction: column;
// //   background-color: #f7f7f7;
// //   border-radius: 10px;
// //   padding: 10px;
// //   overflow-y: auto;
// //   margin-bottom: 20px;
// // `;

// // const Message = styled.div`
// //   padding: 10px;
// //   margin-bottom: 10px;
// //   border-radius: 5px;
// //   background-color: ${({ role }) => (role === 'user' ? '#007bff' : '#e0e0e0')};
// //   color: ${({ role }) => (role === 'user' ? '#fff' : '#333')};
// //   align-self: ${({ role }) => (role === 'user' ? 'flex-end' : 'flex-start')};
// // `;

// // const Input = styled.input`
// //   padding: 10px;
// //   border-radius: 5px;
// //   border: 1px solid #ccc;
// //   width: calc(100% - 22px); /* Full width minus padding and border */
// // `;

// // function ChatWindow({ videoSrc, transcript, messages, setMessages, apiKey, setApiKey }) {
// //   const handleSendMessage = async (message) => {
// //     if (!apiKey) {
// //       setApiKey(message); // Save the API key if not already provided
// //       setMessages([...messages, { role: 'assistant', content: 'OpenAI API key set successfully. Now you can ask your questions!' }]);
// //     } else if (!videoSrc) {
// //       setMessages([...messages, { role: 'assistant', content: 'Please upload a video first to start the conversation.' }]);
// //     } else if (!transcript) {
// //       setMessages([...messages, { role: 'assistant', content: 'Please upload the transcript for the video to proceed.' }]);
// //     } else {
// //       // Combine the transcript and the current conversation as context
// //       const context = transcript + "\n\n" + messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join("\n") + "\n\nUser: " + message;

// //       try {
// //         const response = await axios.post(
// //           'https://api.openai.com/v1/chat/completions',
// //           {
// //             model: 'gpt-3.5-turbo',
// //             messages: [
// //               { role: 'system', content: 'You are a helpful assistant.' },
// //               { role: 'user', content: context }
// //             ]
// //           },
// //           {
// //             headers: {
// //               'Authorization': `Bearer ${apiKey}`,
// //               'Content-Type': 'application/json'
// //             }
// //           }
// //         );

// //         const assistantResponse = response.data.choices[0].message.content;

// //         // Add the user's message and the assistant's response to the chat
// //         setMessages([...messages, { role: 'user', content: message }, { role: 'assistant', content: assistantResponse }]);
// //       } catch (error) {
// //         console.error("Error fetching response from OpenAI:", error);
// //         setMessages([...messages, { role: 'assistant', content: 'Sorry, something went wrong while fetching the response.' }]);
// //       }
// //     }
// //   };

// //   return (
// //     <ChatContainer>
// //       {messages.map((msg, index) => (
// //         <Message key={index} role={msg.role}>
// //           {msg.content}
// //         </Message>
// //       ))}
// //       <Input
// //         placeholder={apiKey ? "Type your message here..." : "Please enter your OpenAI API key..."}
// //         onKeyPress={(e) => {
// //           if (e.key === 'Enter') {
// //             handleSendMessage(e.target.value);
// //             e.target.value = ''; // Clear input after sending
// //           }
// //         }}
// //       />
// //     </ChatContainer>
// //   );
// // }

// // export default ChatWindow;
