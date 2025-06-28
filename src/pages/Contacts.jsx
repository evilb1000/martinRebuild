import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import app from '../firebase';
import ContactModal from '../components/ContactModal';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    businessSector: '',
    company: '',
    linkedin: '',
    notes: ''
  });
  const [filteredContacts, setFilteredContacts] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContact, setModalContact] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'

  console.log('Contacts component loaded');

  // Filter logic
  useEffect(() => {
    if (contacts.length > 0) {
      let filtered = [...contacts];
      
      // Filter by businessSector
      if (filters.businessSector) {
        filtered = filtered.filter(contact => 
          contact.businessSector && 
          contact.businessSector.toLowerCase().includes(filters.businessSector.toLowerCase())
        );
      }
      
      // Filter by company
      if (filters.company) {
        filtered = filtered.filter(contact => 
          contact.company && 
          contact.company.toLowerCase().includes(filters.company.toLowerCase())
        );
      }
      
      // Filter by linkedin
      if (filters.linkedin) {
        if (filters.linkedin === 'known') {
          filtered = filtered.filter(contact => 
            contact.linkedin && contact.linkedin.trim() !== ''
          );
        } else if (filters.linkedin === 'blank') {
          filtered = filtered.filter(contact => 
            !contact.linkedin || contact.linkedin.trim() === ''
          );
        }
      }
      
      // Filter by notes
      if (filters.notes) {
        filtered = filtered.filter(contact => 
          contact.notes && 
          contact.notes.toLowerCase().includes(filters.notes.toLowerCase())
        );
      }
      
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts([]);
    }
  }, [contacts, filters]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      businessSector: '',
      company: '',
      linkedin: '',
      notes: ''
    });
  };

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

  // Modal handlers
  const handleOpenModal = (contact, mode = 'view') => {
    setModalContact(contact);
    setModalMode(mode);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setModalContact(null);
  };
  const handleSaveModal = async (updatedContact) => {
    if (!updatedContact.id) return;
    try {
      const contactRef = doc(db, 'contacts', updatedContact.id);
      // Remove the name field before saving (it's derived)
      const { name, ...contactData } = updatedContact;
      await updateDoc(contactRef, contactData);
      setContacts(prevContacts =>
        prevContacts.map(c => {
          if (c.id === updatedContact.id) {
            const fullName = (updatedContact.firstName && updatedContact.lastName)
              ? `${updatedContact.firstName} ${updatedContact.lastName}`
              : updatedContact.firstName || updatedContact.lastName || 'Unnamed Contact';
            return { ...c, ...updatedContact, name: fullName };
          }
          return c;
        })
      );
    } catch (err) {
      alert('Failed to save contact: ' + err.message);
    }
    setModalOpen(false);
    setModalContact(null);
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
      <div style={styles.layoutRow}>
        {/* Filter Panel on the far left */}
        <div style={styles.filterPanel}>
          <div style={styles.filterHeader}>
            <h3 style={styles.filterTitle}>Filters</h3>
            <button 
              onClick={clearFilters}
              style={styles.clearFiltersButton}
              disabled={!Object.values(filters).some(filter => filter !== '')}
            >
              Clear All
            </button>
          </div>
          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Business Sector</label>
            <input
              type="text"
              value={filters.businessSector}
              onChange={(e) => handleFilterChange('businessSector', e.target.value)}
              placeholder="Filter by sector..."
              style={styles.filterInput}
            />
          </div>
          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Company</label>
            <input
              type="text"
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              placeholder="Filter by company..."
              style={styles.filterInput}
            />
          </div>
          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>LinkedIn</label>
            <select
              value={filters.linkedin}
              onChange={(e) => handleFilterChange('linkedin', e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Contacts</option>
              <option value="known">Known</option>
              <option value="blank">Blank</option>
            </select>
          </div>
          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Notes</label>
            <input
              type="text"
              value={filters.notes}
              onChange={(e) => handleFilterChange('notes', e.target.value)}
              placeholder="Filter by notes..."
              style={styles.filterInput}
            />
          </div>
        </div>
        {/* Main Content (header + grid) */}
        <div style={styles.mainContentOuter}>
          <div style={styles.header}>
            <h1 style={styles.title}>Contacts</h1>
            <p style={styles.subtitle}>
              {filteredContacts.length === 0 
                ? 'No contacts found' 
                : `${filteredContacts.length} of ${contacts.length} contact${filteredContacts.length === 1 ? '' : 's'} shown`
              }
            </p>
          </div>
          <div style={styles.contactsContainer}>
            {filteredContacts.length === 0 ? (
              <div style={styles.emptyCard}>
                <h2 style={styles.cardTitle}>
                  {contacts.length === 0 ? 'No Contacts Yet' : 'No Matching Contacts'}
                </h2>
                <p style={styles.cardText}>
                  {contacts.length === 0 
                    ? 'Your contacts will appear here once they\'re added to the database.'
                    : 'Try adjusting your filters to see more results.'
                  }
                </p>
                {contacts.length === 0 && (
                  <button style={styles.button}>Add Your First Contact</button>
                )}
              </div>
            ) : (
              <div style={styles.contactsGrid}>
                {filteredContacts.map((contact) => (
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
                      <button style={styles.actionButton} onClick={() => handleOpenModal(contact, 'edit')}>Edit</button>
                      <button style={styles.actionButton} onClick={() => handleOpenModal(contact, 'view')}>Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Contact Modal */}
      <ContactModal
        open={modalOpen}
        onClose={handleCloseModal}
        contact={modalContact}
        mode={modalMode}
        onSave={handleSaveModal}
      />
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#faf8f3',
    fontFamily: 'Georgia, serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '40px 0',
    gap: '40px',
    boxSizing: 'border-box',
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
    marginTop: '30px',
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
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
    width: '100%',
    maxWidth: '1100px',
    margin: '0 auto',
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
  mainContentOuter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    minWidth: 0,
  },
  filterPanel: {
    width: '280px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    padding: '25px',
    height: 'fit-content',
    position: 'sticky',
    top: '50%',
    transform: 'translateY(-50%)',
    marginLeft: '0',
    marginRight: '0',
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  },
  filterTitle: {
    fontSize: '1.3rem',
    fontWeight: '400',
    color: '#2c2c2c',
    margin: '0',
    fontFamily: 'Georgia, serif',
  },
  clearFiltersButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '400',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    fontFamily: 'Georgia, serif',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    ':hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      transform: 'translateY(-1px)',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  filterSection: {
    marginBottom: '15px',
  },
  filterLabel: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
    marginBottom: '5px',
    fontFamily: 'Georgia, serif',
  },
  filterInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#2c2c2c',
    fontSize: '0.9rem',
    fontFamily: 'Georgia, serif',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    outline: 'none',
    ':focus': {
      border: '1px solid rgba(0, 0, 0, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.1)',
    },
  },
  filterSelect: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#2c2c2c',
    fontSize: '0.9rem',
    fontFamily: 'Georgia, serif',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    outline: 'none',
    ':focus': {
      border: '1px solid rgba(0, 0, 0, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.1)',
    },
  },
  contactsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 0,
  },
  layoutRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 'none',
    margin: '0',
    padding: '40px 0 40px 0',
    gap: '40px',
    boxSizing: 'border-box',
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