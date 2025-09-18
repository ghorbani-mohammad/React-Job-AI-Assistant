import { 
  checkPaymentStatus, 
  pollPaymentStatus, 
  getPaymentHistory, 
  checkPaymentServiceStatus 
} from './subscription';

/**
 * Payment status constants
 */
export const PAYMENT_STATUSES = {
  WAITING: 'waiting',
  CONFIRMING: 'confirming',
  CONFIRMED: 'confirmed',
  SENDING: 'sending',
  PARTIALLY_PAID: 'partially_paid',
  FINISHED: 'finished',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

/**
 * Get user-friendly payment status text
 */
export const getPaymentStatusText = (status) => {
  const statusTexts = {
    [PAYMENT_STATUSES.WAITING]: 'Waiting for Payment',
    [PAYMENT_STATUSES.CONFIRMING]: 'Confirming Payment',
    [PAYMENT_STATUSES.CONFIRMED]: 'Payment Confirmed',
    [PAYMENT_STATUSES.SENDING]: 'Processing Payment',
    [PAYMENT_STATUSES.PARTIALLY_PAID]: 'Partially Paid',
    [PAYMENT_STATUSES.FINISHED]: 'Payment Completed',
    [PAYMENT_STATUSES.FAILED]: 'Payment Failed',
    [PAYMENT_STATUSES.REFUNDED]: 'Payment Refunded',
    [PAYMENT_STATUSES.EXPIRED]: 'Payment Expired',
    [PAYMENT_STATUSES.CANCELLED]: 'Payment Cancelled'
  };
  
  return statusTexts[status] || 'Unknown Status';
};

/**
 * Get payment status color for UI
 */
export const getPaymentStatusColor = (status) => {
  const statusColors = {
    [PAYMENT_STATUSES.WAITING]: '#f59e0b',
    [PAYMENT_STATUSES.CONFIRMING]: '#3b82f6',
    [PAYMENT_STATUSES.CONFIRMED]: '#10b981',
    [PAYMENT_STATUSES.SENDING]: '#6366f1',
    [PAYMENT_STATUSES.PARTIALLY_PAID]: '#f59e0b',
    [PAYMENT_STATUSES.FINISHED]: '#10b981',
    [PAYMENT_STATUSES.FAILED]: '#ef4444',
    [PAYMENT_STATUSES.REFUNDED]: '#6b7280',
    [PAYMENT_STATUSES.EXPIRED]: '#ef4444',
    [PAYMENT_STATUSES.CANCELLED]: '#f97316'
  };
  
  return statusColors[status] || '#6b7280';
};

/**
 * Check if payment status indicates completion
 */
export const isPaymentCompleted = (status) => {
  return status === PAYMENT_STATUSES.FINISHED;
};

/**
 * Check if payment status indicates failure
 */
export const isPaymentFailed = (status) => {
  return [
    PAYMENT_STATUSES.FAILED,
    PAYMENT_STATUSES.EXPIRED,
    PAYMENT_STATUSES.REFUNDED,
    PAYMENT_STATUSES.CANCELLED
  ].includes(status);
};

/**
 * Check if payment can still be completed
 */
export const canPaymentBeCompleted = (payment) => {
  return payment.can_be_paid && !isPaymentFailed(payment.status) && !isPaymentCompleted(payment.status);
};

/**
 * Store pending subscription info in localStorage
 */
export const storePendingSubscription = (subscriptionData) => {
  try {
    const pendingData = {
      subscriptionId: subscriptionData.subscription?.id,
      paymentId: subscriptionData.payment?.id,
      orderId: subscriptionData.payment?.order_id,
      timestamp: Date.now()
    };
    
    localStorage.setItem('pendingSubscription', JSON.stringify(pendingData));
    return pendingData;
  } catch (error) {
    console.error('Failed to store pending subscription:', error);
    return null;
  }
};

/**
 * Get pending subscription info from localStorage
 */
export const getPendingSubscription = () => {
  try {
    const pendingData = localStorage.getItem('pendingSubscription');
    if (!pendingData) return null;
    
    const data = JSON.parse(pendingData);
    
    // Check if data is older than 24 hours
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - data.timestamp > maxAge) {
      clearPendingSubscription();
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to get pending subscription:', error);
    clearPendingSubscription();
    return null;
  }
};

/**
 * Clear pending subscription info from localStorage
 */
export const clearPendingSubscription = () => {
  try {
    localStorage.removeItem('pendingSubscription');
  } catch (error) {
    console.error('Failed to clear pending subscription:', error);
  }
};

/**
 * Handle subscription creation and payment redirect
 */
export const handleSubscriptionWithPayment = async (planId) => {
  try {
    // This will be implemented in the subscription context
    throw new Error('Use SubscriptionContext.subscribe() method instead');
  } catch (error) {
    console.error('Subscription creation error:', error);
    throw error;
  }
};

/**
 * Handle return from payment page
 */
export const handlePaymentReturn = async (onSuccess, onFailure, onLoading) => {
  const pendingSubscription = getPendingSubscription();
  
  if (!pendingSubscription?.paymentId) {
    return { handled: false };
  }
  
  try {
    if (onLoading) onLoading('Confirming your payment...');
    
    const result = await pollPaymentStatus(pendingSubscription.paymentId);
    
    if (result.success) {
      clearPendingSubscription();
      if (onSuccess) onSuccess(result.payment);
      return { handled: true, success: true, payment: result.payment };
    } else {
      // If payment not found, clear the pending subscription
      if (result.paymentNotFound) {
        clearPendingSubscription();
        if (onFailure) onFailure('Payment invoice not found. Please try creating a new subscription.', null);
        return { handled: true, success: false, reason: 'Payment invoice not found', paymentNotFound: true };
      }
      
      if (onFailure) onFailure(result.reason, result.payment);
      return { handled: true, success: false, reason: result.reason };
    }
    
  } catch (error) {
    console.error('Payment return handling error:', error);
    
    // If payment not found (404), clear the pending subscription
    if (error.paymentNotFound) {
      clearPendingSubscription();
      if (onFailure) onFailure('Payment invoice not found. Please try creating a new subscription.', null);
      return { handled: true, success: false, reason: 'Payment invoice not found', paymentNotFound: true };
    }
    
    if (onFailure) onFailure('Unable to confirm payment status. Please contact support.');
    return { handled: true, success: false, error: error.message };
  }
};

/**
 * Format payment amount for display
 */
export const formatPaymentAmount = (amount, currency) => {
  try {
    const numAmount = parseFloat(amount);
    
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(numAmount);
    }
    
    // For cryptocurrencies, show more decimal places
    if (['BTC', 'ETH', 'LTC'].includes(currency)) {
      return `${numAmount.toFixed(8)} ${currency}`;
    }
    
    return `${numAmount.toFixed(2)} ${currency}`;
  } catch (error) {
    return `${amount} ${currency}`;
  }
};

/**
 * Get payment method icon
 */
export const getPaymentMethodIcon = (currency) => {
  const icons = {
    'BTC': '₿',
    'ETH': 'Ξ',
    'LTC': 'Ł',
    'USD': '$',
    'USDT': '₮',
    'USDC': '$'
  };
  
  return icons[currency] || '💰';
};

/**
 * Calculate time remaining for payment
 */
export const getPaymentTimeRemaining = (expiresAt) => {
  try {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { expired: true, text: 'Expired' };
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return { 
        expired: false, 
        text: `${hours}h ${minutes % 60}m remaining`,
        minutes: minutes
      };
    }
    
    return { 
      expired: false, 
      text: `${minutes}m remaining`,
      minutes: minutes
    };
  } catch (error) {
    return { expired: false, text: 'Unknown' };
  }
};

/**
 * Show user-friendly error messages
 */
export const getPaymentErrorMessage = (error, context) => {
  const errorMessages = {
    'creation': 'Failed to create subscription. Please try again.',
    'status_check': 'Unable to check payment status. Please refresh the page.',
    'service_unavailable': 'Payment service is temporarily unavailable.',
    'network_error': 'Network error. Please check your connection.',
    'timeout': 'Request timed out. Please try again.',
    'payment_failed': 'Payment failed. Please try again or contact support.',
    'payment_expired': 'Payment expired. Please create a new subscription.'
  };
  
  // Check for specific error patterns
  if (error.message?.includes('timeout')) {
    return errorMessages.timeout;
  }
  
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return errorMessages.network_error;
  }
  
  return errorMessages[context] || 'An unexpected error occurred. Please try again.';
};
