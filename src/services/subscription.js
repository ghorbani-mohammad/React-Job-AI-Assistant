import { apiRequest } from './apiInterceptor';

const BASE_URL = 'https://social.m-gh.com/api/v1/';

// Public endpoints

/**
 * Get all available subscription plans
 */
export const getSubscriptionPlans = async () => {
  const response = await fetch(`${BASE_URL}user/subscriptions/plans/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subscription plans: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

// Authenticated endpoints

/**
 * Check user's premium status
 */
export const getPremiumStatus = async () => {
  const response = await apiRequest(`${BASE_URL}user/premium-status/`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch premium status: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

/**
 * Create a new subscription with payment information
 */
export const createSubscription = async (planId, options = {}) => {
  const currentOrigin = window.location.origin;
  
  // Default payment redirect URLs
  const defaultUrls = {
    successUrl: `${currentOrigin}/payment/success`,
    failureUrl: `${currentOrigin}/payment/failed`,
    cancelUrl: `${currentOrigin}/payment/cancelled`
  };
  
  // Merge with any custom URLs provided
  const redirectUrls = { ...defaultUrls, ...options.redirectUrls };
  
  const requestBody = {
    plan_id: planId,
    success_url: redirectUrls.successUrl,
    failure_url: redirectUrls.failureUrl,
    cancel_url: redirectUrls.cancelUrl,
    ...options.additionalData
  };
  
  const response = await apiRequest(`${BASE_URL}user/subscriptions/`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create subscription: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

/**
 * Get all user subscriptions
 */
export const getUserSubscriptions = async () => {
  const response = await apiRequest(`${BASE_URL}user/subscriptions/`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user subscriptions: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};


/**
 * Cancel a subscription (automatically cancels any pending payments)
 */
export const cancelSubscription = async (subscriptionId) => {
  if (!subscriptionId) {
    throw new Error('Subscription ID is required for cancellation');
  }

  try {
    const response = await apiRequest(`${BASE_URL}user/subscriptions/${subscriptionId}/cancel/`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 404) {
        throw new Error('Subscription not found');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to cancel this subscription');
      } else if (response.status === 409) {
        throw new Error('Subscription cannot be cancelled at this time');
      } else if (response.status >= 500) {
        throw new Error('Server error occurred. Please try again later.');
      }
      
      throw new Error(errorData.error || errorData.detail || `Failed to cancel subscription: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
};

/**
 * Get feature usage statistics
 */
export const getFeatureUsage = async () => {
  const response = await apiRequest(`${BASE_URL}user/feature-usage/`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch feature usage: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

// Payment-related endpoints

/**
 * Check payment status by payment ID
 */
export const checkPaymentStatus = async (paymentId) => {
  const response = await apiRequest(`${BASE_URL}user/payments/invoices/${paymentId}/`);
  
  if (!response.ok) {
    // Handle 404 specifically - payment doesn't exist
    if (response.status === 404) {
      const error = new Error(`Payment invoice not found: ${paymentId}`);
      error.status = 404;
      error.paymentNotFound = true;
      throw error;
    }
    throw new Error(`Failed to check payment status: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

/**
 * Get user's payment history
 */
export const getPaymentHistory = async (page = 1, pageSize = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString()
  });
  
  const response = await apiRequest(`${BASE_URL}user/payments/invoices/?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch payment history: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};


/**
 * Cancel a specific payment
 */
export const cancelPayment = async (paymentId) => {
  if (!paymentId) {
    throw new Error('Payment ID is required for cancellation');
  }

  try {
    const response = await apiRequest(`${BASE_URL}user/payments/invoices/${paymentId}/cancel/`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 404) {
        throw new Error('Payment not found');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to cancel this payment');
      } else if (response.status === 409) {
        throw new Error('Payment cannot be cancelled at this time');
      } else if (response.status >= 500) {
        throw new Error('Server error occurred. Please try again later.');
      }
      
      throw new Error(errorData.error || errorData.detail || `Failed to cancel payment: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
};



// AI Premium endpoints

/**
 * Generate cover letter (Premium only)
 */
export const generateCoverLetter = async (jobDescription) => {
  const response = await apiRequest(`${BASE_URL}ai/cover-letter/generate/`, {
    method: 'POST',
    body: JSON.stringify({ job_description: jobDescription }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 403) {
      throw new Error(errorData.message || 'Premium subscription required for this feature');
    }
    throw new Error(errorData.detail || `Failed to generate cover letter: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

/**
 * Get user cover letters
 */
export const getUserCoverLetters = async () => {
  const response = await apiRequest(`${BASE_URL}ai/cover-letters/`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch cover letters: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

/**
 * Get specific cover letter
 */
export const getCoverLetter = async (coverLetterId) => {
  const response = await apiRequest(`${BASE_URL}ai/cover-letters/${coverLetterId}/`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch cover letter: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

/**
 * Delete cover letter
 */
export const deleteCoverLetter = async (coverLetterId) => {
  const response = await apiRequest(`${BASE_URL}ai/cover-letters/${coverLetterId}/delete/`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to delete cover letter: ${response.status}`);
  }
  
  // DELETE requests typically return 204 No Content
  if (response.status === 204) {
    return { message: 'Cover letter deleted successfully' };
  }
  
  const data = await response.json();
  return data;
};