import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({});

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const listingsRef = collection(db, 'listings');
        const querySnapshot = await getDocs(listingsRef);
        const listingsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          };
        });
        setListings(listingsData);
        setError(null);
      } catch (err) {
        setError('Failed to load listings: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const openModal = (listing) => {
    setSelectedListing(listing);
    setEditMode(false);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedListing(null);
    setEditMode(false);
    setEditFields({});
  };

  const handleEdit = (listing, e) => {
    e.stopPropagation();
    setSelectedListing(listing);
    setEditFields({
      streetAddress: listing.streetAddress || '',
      city: listing.city || '',
      state: listing.state || '',
      zip: listing.zip || '',
      'SF available': listing['SF available'] || '',
      leaseorsale: listing.leaseorsale || '',
      'price per sf': listing['price per sf'] || '',
    });
    setEditMode(true);
    setModalOpen(true);
  };

  const handleFieldChange = (field, value) => {
    setEditFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedListing) return;
    try {
      const docRef = collection(db, 'listings');
      // Use updateDoc for existing doc
      const { id } = selectedListing;
      const { streetAddress, city, state, zip, 'SF available': sfAvailable, leaseorsale, 'price per sf': pricePerSf } = editFields;
      await import('firebase/firestore').then(({ doc, updateDoc }) =>
        updateDoc(doc(db, 'listings', id), {
          streetAddress,
          city,
          state,
          zip,
          'SF available': sfAvailable,
          leaseorsale,
          'price per sf': pricePerSf,
        })
      );
      setListings(prev => prev.map(l => l.id === id ? { ...l, ...editFields } : l));
      closeModal();
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  };

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.homeButton}>Home</Link>
      <div style={styles.header}>
        <h1 style={styles.title}>Listings</h1>
        <p style={styles.subtitle}>
          {loading ? 'Loading listings...' : `${listings.length} listing${listings.length === 1 ? '' : 's'} shown`}
        </p>
        {error && <div style={styles.error}>{error}</div>}
      </div>
      <div style={styles.listingsGrid}>
        {listings.map(listing => (
          <div
            key={listing.id}
            style={styles.listingCard}
            onClick={() => openModal(listing)}
            tabIndex={0}
            role="button"
            aria-pressed={false}
            onMouseEnter={e => e.currentTarget.style.boxShadow = styles.listingCardHover.boxShadow}
            onMouseLeave={e => e.currentTarget.style.boxShadow = styles.listingCard.boxShadow}
          >
            <button
              style={styles.editButton}
              onClick={e => handleEdit(listing, e)}
              tabIndex={-1}
              aria-label="Edit listing"
            >
              ✎
            </button>
            <div style={styles.listingField}><span style={styles.label}>Address:</span> {listing.streetAddress || 'N/A'}</div>
            <div style={styles.listingField}><span style={styles.label}>City:</span> {listing.city || 'N/A'}</div>
            <div style={styles.listingField}><span style={styles.label}>State:</span> {listing.state || 'N/A'}</div>
            <div style={styles.listingField}><span style={styles.label}>Zip:</span> {listing.zip || 'N/A'}</div>
            <div style={styles.listingField}><span style={styles.label}>SF Available:</span> {listing['SF available'] || 'N/A'}</div>
            <div style={styles.listingField}><span style={styles.label}>Lease or Sale:</span> {listing.leaseorsale || 'N/A'}</div>
            <div style={styles.listingField}><span style={styles.label}>Price per SF:</span> {listing['price per sf'] || 'N/A'}</div>
          </div>
        ))}
      </div>
      {modalOpen && selectedListing && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={closeModal}>×</button>
            <h2 style={styles.modalTitle}>{editMode ? 'Edit Listing' : 'Listing Details'}</h2>
            {editMode ? (
              <>
                <div style={styles.modalField}>
                  <span style={styles.label}>Address:</span>
                  <input style={styles.input} value={editFields.streetAddress} onChange={e => handleFieldChange('streetAddress', e.target.value)} />
                </div>
                <div style={styles.modalField}>
                  <span style={styles.label}>City:</span>
                  <input style={styles.input} value={editFields.city} onChange={e => handleFieldChange('city', e.target.value)} />
                </div>
                <div style={styles.modalField}>
                  <span style={styles.label}>State:</span>
                  <input style={styles.input} value={editFields.state} onChange={e => handleFieldChange('state', e.target.value)} />
                </div>
                <div style={styles.modalField}>
                  <span style={styles.label}>Zip:</span>
                  <input style={styles.input} value={editFields.zip} onChange={e => handleFieldChange('zip', e.target.value)} />
                </div>
                <div style={styles.modalField}>
                  <span style={styles.label}>SF Available:</span>
                  <input style={styles.input} value={editFields['SF available']} onChange={e => handleFieldChange('SF available', e.target.value)} />
                </div>
                <div style={styles.modalField}>
                  <span style={styles.label}>Lease or Sale:</span>
                  <input style={styles.input} value={editFields.leaseorsale} onChange={e => handleFieldChange('leaseorsale', e.target.value)} />
                </div>
                <div style={styles.modalField}>
                  <span style={styles.label}>Price per SF:</span>
                  <input style={styles.input} value={editFields['price per sf']} onChange={e => handleFieldChange('price per sf', e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '18px' }}>
                  <button style={styles.saveButton} onClick={handleSave}>Save</button>
                  <button style={styles.cancelButton} onClick={closeModal}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div style={styles.modalField}><span style={styles.label}>Address:</span> {selectedListing.streetAddress || 'N/A'}</div>
                <div style={styles.modalField}><span style={styles.label}>City:</span> {selectedListing.city || 'N/A'}</div>
                <div style={styles.modalField}><span style={styles.label}>State:</span> {selectedListing.state || 'N/A'}</div>
                <div style={styles.modalField}><span style={styles.label}>Zip:</span> {selectedListing.zip || 'N/A'}</div>
                <div style={styles.modalField}><span style={styles.label}>SF Available:</span> {selectedListing['SF available'] || 'N/A'}</div>
                <div style={styles.modalField}><span style={styles.label}>Lease or Sale:</span> {selectedListing.leaseorsale || 'N/A'}</div>
                <div style={styles.modalField}><span style={styles.label}>Price per SF:</span> {selectedListing['price per sf'] || 'N/A'}</div>
              </>
            )}
          </div>
        </div>
      )}
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
    alignItems: 'center',
    padding: '40px 0',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '400',
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
  error: {
    color: '#d32f2f',
    background: '#ffebee',
    borderRadius: '8px',
    padding: '12px',
    margin: '20px 0',
    fontSize: '1rem',
  },
  listingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
    width: '100%',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  listingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    padding: '25px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    position: 'relative',
    transition: 'box-shadow 0.3s cubic-bezier(.4,2,.3,1)',
    cursor: 'pointer',
  },
  listingCardHover: {
    boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
  },
  editButton: {
    position: 'absolute',
    top: '12px',
    right: '16px',
    background: 'rgba(0,0,0,0.08)',
    border: 'none',
    borderRadius: '6px',
    color: '#333',
    fontSize: '1.1rem',
    padding: '4px 10px',
    cursor: 'pointer',
    zIndex: 2,
    transition: 'background 0.2s',
  },
  listingField: {
    fontSize: '1rem',
    color: '#2c2c2c',
    marginBottom: '4px',
  },
  label: {
    fontWeight: '600',
    color: '#222',
    marginRight: '8px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.25)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: 'rgba(255,255,255,0.97)',
    borderRadius: '16px',
    padding: '36px 32px 28px 32px',
    minWidth: '350px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    fontFamily: 'Georgia, serif',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '18px',
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    color: '#222',
    cursor: 'pointer',
    zIndex: 10,
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    margin: '0 0 18px 0',
    color: '#222',
  },
  modalField: {
    fontSize: '1.1rem',
    color: '#2c2c2c',
    marginBottom: '6px',
  },
  input: {
    fontSize: '1rem',
    padding: '7px 10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginLeft: '8px',
    minWidth: '160px',
    outline: 'none',
    fontFamily: 'Georgia, serif',
    background: '#fff',
    color: '#222',
    marginBottom: '2px',
  },
  saveButton: {
    background: '#222',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 22px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  cancelButton: {
    background: 'rgba(0,0,0,0.08)',
    color: '#222',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '10px 22px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  homeButton: {
    position: 'fixed',
    top: '32px',
    left: '32px',
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
    zIndex: 1000,
  },
};

export default Listings; 