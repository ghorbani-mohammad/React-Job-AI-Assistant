import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getPremiumStatus, 
  getSubscriptionPlans, 
  getCurrentSubscription, 
  createSubscription, 
  cancelSubscription,
  cancelPayment,
  getFeatureUsage,
  checkPaymentServiceStatus
} from '../services/subscription';
import { 
  storePendingSubscription, 
  getPendingSubscription, 
  clearPendingSubscription, 
  handlePaymentReturn 
} from '../services/payment';
import { useAuth } from './Auth';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [featureUsage, setFeatureUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentServiceStatus, setPaymentServiceStatus] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);

  // Load subscription plans (public endpoint)
  const loadSubscriptionPlans = useCallback(async () => {
    try {
      setError(null);
      const plans = await getSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (error) {
      console.error('Failed to load subscription plans:', error);
      setError('Failed to load subscription plans');
    }
  }, []);

  // Load premium status for logged-in users
  const loadPremiumStatus = useCallback(async () => {
    if (!isLoggedIn) {
      setPremiumStatus(null);
      setCurrentSubscription(null);
      setFeatureUsage(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [status, subscription, usage] = await Promise.all([
        getPremiumStatus(),
        getCurrentSubscription().catch(() => null), // Don't fail if no current subscription
        getFeatureUsage().catch(() => null) // Don't fail if no usage data
      ]);
      
      setPremiumStatus(status);
      setCurrentSubscription(subscription);
      setFeatureUsage(usage);
    } catch (error) {
      console.error('Failed to load premium status:', error);
      setError('Failed to load subscription status');
      setPremiumStatus({ has_premium: false });
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Subscribe to a plan with payment handling
  const subscribe = useCallback(async (planId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await createSubscription(planId);
      
      // Check if payment is required
      if (result.payment && result.payment.payment_url) {
        // Store pending subscription info
        const pendingData = storePendingSubscription(result);
        setPendingPayment(pendingData);
        
        // Redirect to payment page
        window.location.href = result.payment.payment_url;
        return result;
      } else {
        // No payment required or already paid - refresh status
        await loadPremiumStatus();
        return result;
      }
    } catch (error) {
      console.error('Failed to create subscription:', error);
      setError(error.message || 'Failed to create subscription');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadPremiumStatus]);

  // Cancel subscription (automatically cancels any pending payments)
  const cancelCurrentSubscription = useCallback(async () => {
    if (!currentSubscription?.id) {
      throw new Error('No active subscription to cancel');
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await cancelSubscription(currentSubscription.id);
      
      // Refresh status after successful cancellation
      await loadPremiumStatus();
      
      return result;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      setError(error.message || 'Failed to cancel subscription');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentSubscription?.id, loadPremiumStatus]);

  // Load payment service status
  const loadPaymentServiceStatus = useCallback(async () => {
    if (!isLoggedIn) {
      setPaymentServiceStatus(null);
      return;
    }

    try {
      const status = await checkPaymentServiceStatus();
      setPaymentServiceStatus(status);
    } catch (error) {
      console.error('Failed to load payment service status:', error);
      setPaymentServiceStatus({ service_available: false });
    }
  }, [isLoggedIn]);


  // Cancel a specific payment
  const cancelSpecificPayment = useCallback(async (paymentId) => {
    if (!paymentId) {
      throw new Error('Payment ID is required for cancellation');
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await cancelPayment(paymentId);
      
      
      return result;
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      setError(error.message || 'Failed to cancel payment');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle payment return from payment page
  const handlePaymentReturnCallback = useCallback(async () => {
    const result = await handlePaymentReturn(
      // onSuccess
      (payment) => {
        console.log('Payment successful:', payment);
        loadPremiumStatus(); // Refresh subscription status
        setPendingPayment(null);
      },
      // onFailure
      (reason, payment) => {
        console.error('Payment failed:', reason, payment);
        setError(`Payment failed: ${reason}`);
        setPendingPayment(null);
      },
      // onLoading
      (message) => {
        setLoading(true);
        console.log('Payment status:', message);
      }
    );

    if (result.handled) {
      setLoading(false);
    }

    return result;
  }, [loadPremiumStatus]);

  // Refresh all subscription data
  const refreshSubscriptionData = useCallback(async () => {
    await Promise.all([
      loadSubscriptionPlans(),
      loadPremiumStatus(),
      loadPaymentServiceStatus()
    ]);
  }, [loadSubscriptionPlans, loadPremiumStatus, loadPaymentServiceStatus]);

  // Refresh subscription status only (for payment result pages)
  const refreshSubscriptionStatus = useCallback(async () => {
    await loadPremiumStatus();
  }, [loadPremiumStatus]);

  // Load plans on mount
  useEffect(() => {
    loadSubscriptionPlans();
  }, [loadSubscriptionPlans]);

  // Load premium status and payment service status when auth state changes
  useEffect(() => {
    loadPremiumStatus();
    loadPaymentServiceStatus();
  }, [loadPremiumStatus, loadPaymentServiceStatus]);

  // Check for pending payments on mount and when returning from payment
  useEffect(() => {
    const checkPendingPayment = async () => {
      const pending = getPendingSubscription();
      if (pending) {
        setPendingPayment(pending);
        // Automatically handle payment return
        await handlePaymentReturnCallback();
      }
    };

    if (isLoggedIn) {
      checkPendingPayment();
    }
  }, [isLoggedIn, handlePaymentReturnCallback]);

  // Helper functions
  // has_premium now returns: "active" | "pending" | false
  const hasPremium = premiumStatus?.has_premium === 'active';
  const isPaymentPending = premiumStatus?.has_premium === 'pending';
  const hasActivePlan = currentSubscription?.status === 'active';
  const isExpired = premiumStatus?.subscription?.is_expired || false;
  const daysRemaining = premiumStatus?.subscription?.days_remaining || 0;

  // Check if user has access to a specific feature
  const hasFeatureAccess = useCallback((feature) => {
    if (!hasPremium || !currentSubscription?.plan?.features) {
      return false;
    }
    
    return currentSubscription.plan.features.includes(feature);
  }, [hasPremium, currentSubscription?.plan?.features]);

  // Get plan by type and billing cycle
  const getPlanByType = useCallback((planType, billingCycle) => {
    return subscriptionPlans.find(plan => 
      plan.name.toLowerCase() === planType.toLowerCase() && 
      plan.plan_type === billingCycle
    );
  }, [subscriptionPlans]);

  const value = {
    // State
    premiumStatus,
    subscriptionPlans,
    currentSubscription,
    featureUsage,
    loading,
    error,
    paymentServiceStatus,
    pendingPayment,
    
    // Computed values
    hasPremium,
    isPaymentPending,
    hasActivePlan,
    isExpired,
    daysRemaining,
    
    // Actions
    subscribe,
    cancelCurrentSubscription,
    cancelSpecificPayment,
    refreshSubscriptionData,
    refreshSubscriptionStatus,
    hasFeatureAccess,
    getPlanByType,
    handlePaymentReturnCallback,
    
    // Loaders
    loadPremiumStatus,
    loadSubscriptionPlans,
    loadPaymentServiceStatus,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
