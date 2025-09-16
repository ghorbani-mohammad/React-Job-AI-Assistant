import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getPremiumStatus, 
  getSubscriptionPlans, 
  getCurrentSubscription, 
  createSubscription, 
  cancelSubscription,
  getFeatureUsage
} from '../services/subscription';
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

  // Subscribe to a plan
  const subscribe = useCallback(async (planId) => {
    try {
      setLoading(true);
      setError(null);
      
      const subscription = await createSubscription(planId);
      
      // Refresh status after successful subscription
      await loadPremiumStatus();
      
      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      setError(error.message || 'Failed to create subscription');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadPremiumStatus]);

  // Cancel subscription
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

  // Refresh all subscription data
  const refreshSubscriptionData = useCallback(async () => {
    await Promise.all([
      loadSubscriptionPlans(),
      loadPremiumStatus()
    ]);
  }, [loadSubscriptionPlans, loadPremiumStatus]);

  // Load plans on mount
  useEffect(() => {
    loadSubscriptionPlans();
  }, [loadSubscriptionPlans]);

  // Load premium status when auth state changes
  useEffect(() => {
    loadPremiumStatus();
  }, [loadPremiumStatus]);

  // Helper functions
  const hasPremium = premiumStatus?.has_premium || false;
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
    
    // Computed values
    hasPremium,
    hasActivePlan,
    isExpired,
    daysRemaining,
    
    // Actions
    subscribe,
    cancelCurrentSubscription,
    refreshSubscriptionData,
    hasFeatureAccess,
    getPlanByType,
    
    // Loaders
    loadPremiumStatus,
    loadSubscriptionPlans,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
