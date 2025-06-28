import React from 'react';
import { Link } from 'react-router-dom';

const Listings = () => {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Listings</h1>
          <p style={styles.subtitle}>Manage your property listings</p>
        </div>

        {/* Main Content */}
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Active Listings</h2>
            <p style={styles.cardText}>
              View and manage all your current property listings.
            </p>
            <div style={styles.buttonGroup}>
              <button style={styles.button}>Add New Listing</button>
              <button style={styles.button}>Import Listings</button>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Recent Activity</h2>
            <p style={styles.cardText}>
              Track your latest listing updates and inquiries.
            </p>
            <div style={styles.activityList}>
              <div style={styles.activityItem}>
                <span style={styles.activityDate}>Today</span>
                <span style={styles.activityText}>New inquiry: 123 Main St</span>
              </div>
              <div style={styles.activityItem}>
                <span style={styles.activityDate}>Yesterday</span>
                <span style={styles.activityText}>Listing updated: 456 Oak Ave</span>
              </div>
              <div style={styles.activityItem}>
                <span style={styles.activityDate}>2 days ago</span>
                <span style={styles.activityText}>New listing: 789 Pine Rd</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          <Link to="/" style={styles.navButton}>
            ← Back to Chat
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8f6f1',
    fontFamily: 'Georgia, serif',
    padding: '20px',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '300',
    color: '#2c2c2c',
    margin: '0 0 10px 0',
    letterSpacing: '1px',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    margin: 0,
    fontStyle: 'italic',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    padding: '30px',
    transition: 'transform 0.3s ease',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '400',
    color: '#2c2c2c',
    margin: '0 0 15px 0',
  },
  cardText: {
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '400',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    fontFamily: 'Georgia, serif',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  activityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  },
  activityDate: {
    fontSize: '12px',
    color: '#999',
    fontWeight: 'bold',
    minWidth: '80px',
  },
  activityText: {
    fontSize: '14px',
    color: '#2c2c2c',
    flex: 1,
    marginLeft: '15px',
  },
  navigation: {
    textAlign: 'center',
    marginTop: '20px',
  },
  navButton: {
    display: 'inline-block',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#ffffff',
    textDecoration: 'none',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '12px 25px',
    fontSize: '16px',
    fontWeight: '400',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    fontFamily: 'Georgia, serif',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .card:hover {
    transform: translateY(-2px);
  }
  
  button:hover, .nav-button:hover {
    background-color: rgba(0, 0, 0, 0.9) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  
  button:active, .nav-button:active {
    transform: translateY(0);
  }
`;
document.head.appendChild(styleSheet);

export default Listings; 