import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatBox = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await axios.post('http://localhost:3001/chat', {
        message: message
      });
      
      // Better response handling to prevent crashes
      let responseText = '';
      if (result.data) {
        if (typeof result.data === 'string') {
          responseText = result.data;
        } else if (result.data.response) {
          responseText = result.data.response;
        } else if (result.data.message) {
          responseText = result.data.message;
        } else if (result.data.text) {
          responseText = result.data.text;
        } else {
          // Fallback: stringify the entire response for debugging
          responseText = JSON.stringify(result.data, null, 2);
        }
      }
      
      setResponse(responseText);
      setMessage('');
    } catch (err) {
      console.error('Chat error:', err);
      let errorMessage = 'An error occurred while sending the message';
      
      if (err.response) {
        // Server responded with error status
        if (err.response.data && typeof err.response.data === 'object') {
          errorMessage = err.response.data.error || err.response.data.message || errorMessage;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else {
          errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Network error: Unable to connect to the server';
      } else {
        // Other error
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div style={styles.container}>
      {/* Response Display Area */}
      <div style={styles.responseArea}>
        {loading && (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <span>Loading response...</span>
          </div>
        )}
        
        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
            <button 
              onClick={() => setError('')} 
              style={styles.clearButton}
            >
              Clear Error
            </button>
          </div>
        )}
        
        {response && !loading && (
          <div style={styles.response}>
            <strong>Response:</strong>
            <pre style={styles.responseText}>{response}</pre>
          </div>
        )}
        
        {!response && !loading && !error && (
          <div style={styles.placeholder}>
            Your conversation will appear here...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputContainer}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            style={styles.textarea}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !message.trim()}
            style={styles.button}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    fontFamily: 'Georgia, serif',
  },
  responseArea: {
    minHeight: '200px',
    border: '1px solid #e0d8c8',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #000000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '10px',
  },
  error: {
    color: '#d32f2f',
    backgroundColor: '#ffebee',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ffcdd2',
    fontSize: '14px',
  },
  response: {
    color: '#2c2c2c',
    lineHeight: '1.6',
  },
  placeholder: {
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: '16px',
  },
  form: {
    marginTop: '20px',
  },
  inputContainer: {
    display: 'flex',
    gap: '12px',
  },
  textarea: {
    flex: 1,
    padding: '15px',
    border: '1px solid #e0d8c8',
    borderRadius: '6px',
    resize: 'vertical',
    minHeight: '60px',
    fontFamily: 'Georgia, serif',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.3s ease',
  },
  button: {
    padding: '15px 25px',
    backgroundColor: '#000000',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '400',
    fontFamily: 'Georgia, serif',
    alignSelf: 'flex-end',
    transition: 'all 0.3s ease',
    minWidth: '80px',
  },
  clearButton: {
    marginLeft: '10px',
    padding: '4px 8px',
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'Georgia, serif',
  },
  responseText: {
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    fontFamily: 'Georgia, serif',
    margin: '10px 0 0 0',
    fontSize: '14px',
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  button:disabled {
    background-color: #cccccc !important;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  textarea:disabled {
    background-color: #f8f6f1;
    cursor: not-allowed;
  }
  
  textarea:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
  }
  
  .chat-button:hover {
    background-color: #333333 !important;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0,0,0,0.2);
  }
  
  .chat-button:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(styleSheet);

export default ChatBox; 