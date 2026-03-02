import './Chatbot.css';
import samBot from '../../assets/img/samBot.png';
import botImage from '../../assets/img/bot2.png';
import user from '../../assets/img/user.png';
import React, { useEffect, useRef, useState } from 'react';
import httpInjectorService from 'services/http-injector.service';
import Tooltip from './Tooltip';
import { Button } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Cookies from 'js-cookie';
 
// chatbot component
const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const username = Cookies.get('username') || 'User';
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: `Hi ${username} ! I am your assistant. Ask me anything.`,
      time: new Date(),
    },
  ]);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
 
  // We'll send the payload from inside sendMessage so clearing `input` won't affect the sent message.
  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);
 
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
 
  console.log('User name from cookies:', username);
 
  // scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  };
 
  // handle message submission logic
  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!input || input.trim() === '') return;
    const userText = input;
    try {
      // Append user message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          from: 'user',
          text: userText,
          time: new Date(),
        },
      ]);
 
      setInput(''); // Clear input after sending message
      setIsTyping(true);
 
      const reqBody = {
        question: userText,
      };
 
      // Call chatbot API from http-injector service
      const response = await httpInjectorService.getChatbotData(reqBody);
      if (response) {
        const botText = response?.data?.response;
        if (botText && typeof botText === 'string') {
          // Delay appending bot response by 1 seconds
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: prevMessages.length + 1,
                from: 'bot',
                text: botText,
                time: new Date(),
              },
            ]);
            setIsTyping(false);
          }, 1000);
          console.log('Chatbot API response:', response);
        } else {
          console.error('Unexpected bot payload:', response?.data);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };
 
  // handle Enter key for submission
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // stop the browser from adding a new line
      handleSubmit();
    }
  };
 
  const renderMarkdownMessage = (text) => {
    // Convert literal "\n" to real newlines
    const formattedText = text.replace(/\\n/g, '\n');
 
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => {
            const isCSV = props.href?.toLowerCase().endsWith('.csv');
            return (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="chatbot-link"
                download={isCSV ? true : undefined}
                onClick={(e) => e.stopPropagation()}
              >
                {props.children}
              </a>
            );
          },
          li: ({ node, ...props }) => (
            <li className="chatbot-list-item" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="chatbot-ordered-list" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="chatbot-unordered-list" {...props} />
          ),
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code className="chatbot-inline-code" {...props} />
            ) : (
              <pre className="chatbot-code-block">
                <code {...props} />
              </pre>
            ),
        }}
      >
        {formattedText}
      </ReactMarkdown>
    );
  };
 
  return (
    <div className={`chatbot-container ${!open ? 'closed' : ''}`}>
      {!open && (
        <div
          aria-label="Open chat"
          onClick={() => setOpen(true)}
          className="chatbot-fab"
        >
          <Tooltip text={'Chat with SamBot'} position="top">
            <img src={samBot} alt="samBot" width={60} />
          </Tooltip>
        </div>
      )}
      {open && (
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between chatbot-header">
            <div className="d-flex align-items-center">
              {/* <div className="rounded-circle text-white d-flex align-items-center justify-content-center chatbot-avatar"> */}
              <img src={samBot} alt="samBot" width={45} />
              {/* </div> */}
              <div className="ms-2">
                <div className="mb-0">Assistant</div>
                <small className="text-muted">Online 🟢</small>
              </div>
            </div>
            <div>
              <Button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                ×
              </Button>
            </div>
          </div>
 
          <>
            <div className="card-body p-0">
              <div className="chatbot-messages bg-light">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`chatbot-message-container ${m.from}`}
                  >
                    <div>
                      {/* reply from bot-user - div box container */}
                      <div className="d-flex align-items-center gap-0">
                        <div className="display-bot-svg">
                          {m.from === 'bot' && (
                           <img src={botImage} alt="samBot" width={100} />
                          )}
                        </div>
                        <div
                          className={
                            m.from === 'user'
                              ? 'chatbot-bubble-user'
                              : 'chatbot-bubble-bot'
                          }
                        >
                          {renderMarkdownMessage(m.text)}
                        </div>
                      <div className="display-user-svg">
                        {m.from === 'user' && (
                          <img src={user} alt="User" width={70} />
                        )}
                      </div>
                      </div>
 
                    {/* chatbot time UI */}
                      <div
                        className={`chatbot-time ${
                          m.from === 'user' ? 'chatbot-message-time-right' : ''
                        }`}
                      >
                        {m.time.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="chatbot-message-container bot">
                    <div>
                      <div className="chatbot-bubble-bot">
                        <span className="typing" aria-label="Assistant typing">
                          <span className="typing__dot" />
                          <span className="typing__dot" />
                          <span className="typing__dot" />
                        </span>
                      </div>
                      <div className="chatbot-time">
                        {new Date().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
 
            <div className="card-footer bg-white">
              <div className="input-group d-flex gap-2">
                <textarea
                  className="form-control chatbot-textarea"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  aria-label="Message input"
                />
                <div className="input-group-append">
                  <Button
                    colorScheme="purple"
                    size="sm"
                    padding={'5'}
                    rounded="10"
                    mt="2"
                    onClick={handleSubmit}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-send-icon lucide-send"
                    >
                      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                      <path d="m21.854 2.147-10.94 10.939" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </>
        </div>
      )}
    </div>
  );
};
 
export default ChatBot;