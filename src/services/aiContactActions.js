import axios from 'axios';

/**
 * Handle AI Contact Actions
 * Sends user messages to the AI contact action endpoint for intelligent contact management
 * 
 * @param {string} message - User's natural language command
 * @returns {Promise<Object>} Response from the AI endpoint
 */
export async function handleAIContactAction(message) {
  const endpoint = 'http://localhost:3001/ai-contact-action';
  
  try {
    const response = await axios.post(endpoint, { 
      command: message 
    });
    
    return response.data;
  } catch (error) {
    console.error('AI Contact Action Error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      if (errorData && errorData.error) {
        throw new Error(errorData.error);
      } else if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error(`Server error: ${error.response.status} ${error.response.statusText}`);
      }
    } else if (error.request) {
      // Network error - server not running
      throw new Error('Unable to connect to AI Contact Actions server. Please ensure the backend is running on localhost:3001');
    } else {
      // Other error
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

/**
 * Check if a message is likely a contact action command
 * @param {string} message - User message
 * @returns {boolean} True if message contains contact action keywords
 */
export function isContactActionCommand(message) {
  const contactKeywords = [
    'update', 'change', 'set', 'modify', 'edit',
    'delete', 'remove', 'add', 'create', 'new contact',
    'phone', 'email', 'address', 'company', 'name',
    'contact', 'details', 'information'
  ];
  
  const lowerMessage = message.toLowerCase();
  return contactKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Enhanced contact action handler with intent detection
 * @param {string} message - User message
 * @returns {Promise<Object>} Response with success/error information
 */
export async function processContactAction(message) {
  try {
    const result = await handleAIContactAction(message);
    
    // Standardize response format
    return {
      success: true,
      data: result,
      message: result.response || result.message || result.text || 'Action completed successfully',
      type: result.type || 'contact_action'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      type: 'contact_action_error'
    };
  }
} 