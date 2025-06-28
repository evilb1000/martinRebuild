import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import app from '../firebase';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('Contacts component loaded');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        console.log('Fetching contacts from Firestore...');
        console.log('Firebase app:', app);
        console.log('Firestore db:', db);
        
        const contactsRef = collection(db, 'contacts');
        console.log('Contacts reference created:', contactsRef);
        
        // Get all contacts without ordering since we'll combine firstName + lastName
        const querySnapshot = await getDocs(contactsRef);
        console.log('Query snapshot received:', querySnapshot);
        console.log('Number of documents:', querySnapshot.docs.length);
        
        const contactsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Document data:', doc.id, data);
          
          // Combine firstName and lastName into a full name
          const fullName = data.firstName && data.lastName 
            ? `${data.firstName} ${data.lastName}`
            : data.firstName || data.lastName || 'Unnamed Contact';
            
          return {
            id: doc.id,
            ...data,
            name: fullName // Add a name field for display
          };
        });
        
        // Sort by the combined name
        contactsData.sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('Processed contacts data:', contactsData);
        setContacts(contactsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        console.error('Error details:', {
          code: err.code,
          message: err.message,
          stack: err.stack
        });
        
        // Provide more specific error messages
        if (err.message.includes('Firebase not properly configured')) {
          setError('Firebase configuration is missing. Please update src/firebase.js with your actual Firebase config values.');
        } else if (err.code === 'permission-denied') {
          setError('Access denied. Please check your Firestore security rules.');
        } else if (err.code === 'not-found') {
          setError('Contacts collection not found. Please create a "contacts" collection in your Firestore database.');
        } else if (err.message.includes('access control checks') || err.message.includes('CORS')) {
          setError('CORS error: Please check your Firestore security rules and ensure they are published.');
        } else {
          setError(`Failed to load contacts: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    // Basic phone formatting - you can enhance this
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Contacts</h1>
            <p style={styles.subtitle}>Loading your contacts...</p>
          </div>
          <div style={styles.loadingCard}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Fetching contacts from database...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Contacts</h1>
            <p style={styles.subtitle}>Something went wrong</p>
          </div>
          <div style={styles.errorCard}>
            <p style={styles.errorText}>{error}</p>
            <p style={styles.errorSubtext}>
              Please check your Firebase configuration in src/firebase.js
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Contacts</h1>
          <p style={styles.subtitle}>
            {contacts.length === 0 
              ? 'No contacts found' 
              : `${contacts.length} contact${contacts.length === 1 ? '' : 's'} found`
            }
          </p>
        </div>

        {/* Contacts List */}
        <div style={styles.content}>
          {contacts.length === 0 ? (
            <div style={styles.emptyCard}>
              <h2 style={styles.cardTitle}>No Contacts Yet</h2>
              <p style={styles.cardText}>
                Your contacts will appear here once they're added to the database.
              </p>
              <button style={styles.button}>Add Your First Contact</button>
            </div>
          ) : (
            <div style={styles.contactsGrid}>
              {contacts.map((contact) => (
                <div key={contact.id} style={styles.contactCard}>
                  <div style={styles.contactHeader}>
                    <h3 style={styles.contactName}>
                      {contact.name || 'Unnamed Contact'}
                    </h3>
                    {contact.company && (
                      <span style={styles.contactCompany}>{contact.company}</span>
                    )}
                  </div>
                  
                  <div style={styles.contactDetails}>
                    {contact.email && (
                      <div style={styles.contactItem}>
                        <span style={styles.contactLabel}>Email:</span>
                        <a 
                          href={`mailto:${contact.email}`} 
                          style={styles.contactLink}
                        >
                          {contact.email}
                        </a>
                      </div>
                    )}
                    
                    {contact.phone && (
                      <div style={styles.contactItem}>
                        <span style={styles.contactLabel}>Phone:</span>
                        <a 
                          href={`tel:${contact.phone}`} 
                          style={styles.contactLink}
                        >
                          {formatPhone(contact.phone)}
                        </a>
                      </div>
                    )}
                    
                    {contact.businessSector && (
                      <div style={styles.contactItem}>
                        <span style={styles.contactLabel}>Sector:</span>
                        <span style={styles.contactText}>{contact.businessSector}</span>
                      </div>
                    )}
                    
                    {contact.createdAt && (
                      <div style={styles.contactItem}>
                        <span style={styles.contactLabel}>Added:</span>
                        <span style={styles.contactText}>
                          {formatDate(contact.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.contactActions}>
                    <button style={styles.actionButton}>Edit</button>
                    <button style={styles.actionButton}>Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    maxWidth: '1200px',
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
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    padding: '60px 30px',
    textAlign: 'center',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(0, 0, 0, 0.1)',
    borderTop: '3px solid #2c2c2c',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  loadingText: {
    color: '#666',
    fontSize: '1.1rem',
    margin: 0,
  },
  errorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    padding: '30px',
    textAlign: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '1.1rem',
    margin: '0 0 10px 0',
    fontWeight: '500',
  },
  errorSubtext: {
    color: '#666',
    fontSize: '0.9rem',
    margin: 0,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    padding: '60px 30px',
    textAlign: 'center',
  },
  contactsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  contactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    padding: '25px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  contactHeader: {
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  },
  contactName: {
    fontSize: '1.4rem',
    fontWeight: '500',
    color: '#2c2c2c',
    margin: '0 0 5px 0',
  },
  contactCompany: {
    fontSize: '0.9rem',
    color: '#666',
    fontStyle: 'italic',
  },
  contactDetails: {
    marginBottom: '20px',
  },
  contactItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '10px',
  },
  contactLabel: {
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
    minWidth: '60px',
  },
  contactText: {
    fontSize: '0.9rem',
    color: '#2c2c2c',
    flex: 1,
    textAlign: 'right',
  },
  contactLink: {
    fontSize: '0.9rem',
    color: '#2c2c2c',
    textDecoration: 'none',
    flex: 1,
    textAlign: 'right',
    transition: 'color 0.3s ease',
  },
  contactActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '400',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    fontFamily: 'Georgia, serif',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
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

// Add hover effects and animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .contact-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
  
  .contact-link:hover {
    color: #000 !important;
    text-decoration: underline;
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

export default Contacts; 