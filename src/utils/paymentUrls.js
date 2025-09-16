/**
 * Payment URL utilities for cryptocurrency payment system
 */

/**
 * Generate payment redirect URLs with order information
 * @param {string} orderId - The order ID for the payment
 * @param {string} paymentId - The payment ID (optional)
 * @param {object} options - Additional options
 * @returns {object} Object containing success, failure, and cancel URLs
 */
export const generatePaymentUrls = (orderId, paymentId = null, options = {}) => {
  const { 
    baseUrl = window.location.origin,
    customPaths = {},
    additionalParams = {}
  } = options;
  
  const defaultPaths = {
    success: '/payment/success',
    failure: '/payment/failed',
    cancel: '/payment/cancelled'
  };
  
  const paths = { ...defaultPaths, ...customPaths };
  
  // Build query parameters
  const buildUrl = (path, extraParams = {}) => {
    const params = new URLSearchParams({
      orderId,
      ...(paymentId && { paymentId }),
      ...additionalParams,
      ...extraParams
    });
    
    return `${baseUrl}${path}?${params.toString()}`;
  };
  
  return {
    successUrl: buildUrl(paths.success),
    failureUrl: buildUrl(paths.failure),
    cancelUrl: buildUrl(paths.cancel)
  };
};

/**
 * Generate payment URLs for subscription creation
 * @param {string} planId - The subscription plan ID
 * @param {object} options - Additional options
 * @returns {object} Object containing payment redirect URLs
 */
export const generateSubscriptionPaymentUrls = (planId, options = {}) => {
  const orderId = `subscription_${planId}_${Date.now()}`;
  
  return generatePaymentUrls(orderId, null, {
    ...options,
    additionalParams: {
      planId,
      type: 'subscription',
      ...options.additionalParams
    }
  });
};

/**
 * Parse payment result from URL parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {object} Parsed payment result information
 */
export const parsePaymentResult = (searchParams) => {
  return {
    orderId: searchParams.get('orderId'),
    paymentId: searchParams.get('paymentId'),
    planId: searchParams.get('planId'),
    type: searchParams.get('type'),
    reason: searchParams.get('reason'),
    // Add any additional parameters that might be present
    additionalData: Object.fromEntries(
      [...searchParams.entries()].filter(([key]) => 
        !['orderId', 'paymentId', 'planId', 'type', 'reason'].includes(key)
      )
    )
  };
};

/**
 * Example cryptocurrency payment invoice structure
 * This shows the format expected by your cryptocurrency payment system
 */
export const createPaymentInvoiceExample = (orderData) => {
  const { orderId, amount, currency = 'USD', customerEmail, description } = orderData;
  const paymentUrls = generatePaymentUrls(orderId);
  
  return {
    priceAmount: amount,
    priceCurrency: currency,
    orderId: orderId,
    orderDescription: description || 'Digital subscription purchase',
    customerEmail: customerEmail,
    successUrl: paymentUrls.successUrl,
    failureUrl: paymentUrls.failureUrl,
    cancelUrl: paymentUrls.cancelUrl
  };
};

/**
 * Validate payment URLs
 * @param {object} urls - Object containing payment URLs
 * @returns {boolean} Whether URLs are valid
 */
export const validatePaymentUrls = (urls) => {
  const requiredUrls = ['successUrl', 'failureUrl', 'cancelUrl'];
  
  return requiredUrls.every(urlKey => {
    const url = urls[urlKey];
    if (!url) return false;
    
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
};

/**
 * Default payment configuration
 */
export const DEFAULT_PAYMENT_CONFIG = {
  timeout: 30 * 60 * 1000, // 30 minutes
  pollInterval: 10 * 1000,  // 10 seconds
  maxRetries: 3,
  supportedCurrencies: ['USD', 'BTC', 'ETH', 'LTC', 'USDT', 'USDC'],
  defaultCurrency: 'USD'
};
