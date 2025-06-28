import React from 'react';
import ChatBox from './components/ChatBox';

const App = () => {
  return (
    <div style={styles.app}>
      <div style={styles.container}>
        {/* AI Assistant Label */}
        <h1 style={styles.title}>AI Assistant</h1>
        
        {/* Chat Box */}
        <div style={styles.chatContainer}>
          <ChatBox />
        </div>
        
        {/* Action Buttons */}
        <div style={styles.buttonContainer}>
          <button style={styles.button}>Contacts</button>
          <button style={styles.button}>Listings</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f8f6f1', // Soft creamy off-white
    fontFamily: 'Georgia, serif', // Soft, elegant font
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '300', // Light weight for soft appearance
    color: '#2c2c2c',
    marginBottom: '30px',
    textAlign: 'center',
    letterSpacing: '1px',
  },
  chatContainer: {
    width: '100%',
    marginBottom: '30px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '400px', // Match chat box width
  },
  button: {
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    padding: '15px 30px',
    fontSize: '1.1rem',
    fontWeight: '400',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    fontFamily: 'Georgia, serif',
    letterSpacing: '0.5px',
    minWidth: '120px',
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  button:hover {
    background-color: #333333 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  button:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(styleSheet);

export default App; 