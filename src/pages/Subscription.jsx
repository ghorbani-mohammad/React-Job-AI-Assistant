import { useState, useEffect } from 'react';
import { useSubscription } from '../contexts/Subscription';
import { useAuth } from '../contexts/Auth';
import SubscriptionPlans from '../components/SubscriptionPlans';
import PaymentHistory from '../components/PaymentHistory';
import notificationSoundService from '../services/notificationSound';
import '../css/subscription.css';

const Subscription = () => {
  const { 
    premiumStatus, 
    currentSubscription, 
    featureUsage, 
    loading, 
    error,
    cancelCurrentSubscription,
    refreshSubscriptionData,
    hasPremium,
    hasActivePlan,
    isExpired,
    daysRemaining 
  } = useSubscription();
  const { isLoggedIn, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [cancelling, setCancelling] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      refreshSubscriptionData();
    }
  }, [isLoggedIn, refreshSubscriptionData]);

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    if (type === 'success') {
      notificationSoundService.playNotificationSound();
    }
  };

  const handleCancelSubscription = async () => {
    // Check if subscription has pending status (waiting for payment)
    const hasPendingPayments = currentSubscription?.status === 'pending';
    
    const confirmMessage = hasPendingPayments 
      ? 'This subscription has pending payments. Cancelling will also cancel those payments. Are you sure you want to proceed?'
      : 'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setCancelling(true);
      const result = await cancelCurrentSubscription();
      
      // Show success message with details about cancelled payments
      if (result.message) {
        showNotification(result.message, 'success');
      } else if (hasPendingPayments) {
        showNotification('Subscription cancelled successfully and any pending payments have been cancelled.', 'success');
      } else {
        showNotification('Subscription cancelled successfully. You will retain access until the end of your billing period.', 'success');
      }
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      showNotification(`Failed to cancel subscription: ${error.message}`, 'error');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Active', class: 'status-active' },
      cancelled: { text: 'Cancelled', class: 'status-cancelled' },
      expired: { text: 'Expired', class: 'status-expired' },
      pending: { text: 'Pending', class: 'status-pending' }
    };
    
    const badge = badges[status] || { text: status, class: 'status-default' };
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  if (!isLoggedIn) {
    return (
      <div className='subscription-page'>
        <div className='subscription-container'>
          <div className='login-required'>
            <h2>Login Required</h2>
            <p>Please log in to view and manage your subscription.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='subscription-page'>
        <div className='subscription-container'>
          <div className='loading-state'>
            <div className='loading-spinner'></div>
            <p>Loading subscription information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='subscription-page'>
      <div className='subscription-container'>
        <div className='subscription-header'>
          <h1>Subscription Management</h1>
          <p>Manage your premium subscription and billing</p>
        </div>

        {error && (
          <div className='error-banner'>
            <span className='error-icon'>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {notification && (
          <div className={`notification-banner ${notification.type}`}>
            <span className='notification-icon'>
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <p>{notification.message}</p>
            <button 
              className='notification-close'
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        )}

        <div className='subscription-tabs'>
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            Plans
          </button>
          {hasPremium && (
            <button 
              className={`tab-button ${activeTab === 'usage' ? 'active' : ''}`}
              onClick={() => setActiveTab('usage')}
            >
              Usage
            </button>
          )}
          <button 
            className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
        </div>

        <div className='tab-content'>
          {activeTab === 'overview' && (
            <div className='overview-tab'>
              {hasPremium ? (
                <div className='premium-status'>
                  <div className='status-card'>
                    <div className='status-header'>
                      <h3>✨ Premium Subscription</h3>
                      {getStatusBadge(currentSubscription?.status)}
                    </div>
                    
                    <div className='subscription-details'>
                      <div className='detail-row'>
                        <span className='label'>Plan:</span>
                        <span className='value'>
                          {currentSubscription?.plan?.name} ({currentSubscription?.plan?.plan_type})
                        </span>
                      </div>
                      
                      <div className='detail-row'>
                        <span className='label'>Price:</span>
                        <span className='value'>
                          ${parseFloat(currentSubscription?.plan?.price || 0).toFixed(2)}/
                          {currentSubscription?.plan?.plan_type === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                      
                      {currentSubscription?.expires_at && (
                        <div className='detail-row'>
                          <span className='label'>
                            {currentSubscription?.status === 'cancelled' ? 'Access until:' : 'Next billing:'}
                          </span>
                          <span className='value'>
                            {formatDate(currentSubscription.expires_at)}
                          </span>
                        </div>
                      )}
                      
                      {daysRemaining > 0 && (
                        <div className='detail-row'>
                          <span className='label'>Days remaining:</span>
                          <span className='value'>{daysRemaining} days</span>
                        </div>
                      )}
                    </div>

                    {currentSubscription?.status === 'pending' && (
                      <div className='pending-payment-warning'>
                        <div className='warning-header'>
                          <span className='warning-icon'>⚠️</span>
                          <h4>Pending Payment</h4>
                        </div>
                        <p>This subscription is waiting for payment completion. If you cancel now, any pending payments will also be cancelled.</p>
                      </div>
                    )}

                    {currentSubscription?.plan?.features && (
                      <div className='features-included'>
                        <h4>Features included:</h4>
                        <ul>
                          {currentSubscription.plan.features.map((feature, index) => (
                            <li key={index}>
                              <span className='feature-check'>✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hasActivePlan && currentSubscription?.status !== 'cancelled' && (
                      <div className='subscription-actions'>
                        <button 
                          className='cancel-button'
                          onClick={handleCancelSubscription}
                          disabled={cancelling}
                        >
                          {cancelling ? 'Cancelling...' : 
                           currentSubscription?.status === 'pending' ? 'Cancel Subscription & Payments' : 
                           'Cancel Subscription'}
                        </button>
                      </div>
                    )}

                    {isExpired && (
                      <div className='renewal-notice'>
                        <h4>⚠️ Subscription Expired</h4>
                        <p>Your subscription has expired. Renew now to continue using premium features.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className='no-subscription'>
                  <div className='no-sub-card'>
                    <h3>No Active Subscription</h3>
                    <p>You don't have an active premium subscription. Upgrade now to access premium features!</p>
                    
                    <div className='premium-benefits'>
                      <h4>Premium benefits include:</h4>
                      <ul>
                        <li>✨ AI Cover Letter Generation</li>
                        <li>🔍 Advanced Job Search Filters</li>
                        <li>🎯 Priority Customer Support</li>
                        <li>📄 Resume Analysis & Optimization</li>
                        <li>And much more...</li>
                      </ul>
                    </div>

                    <button 
                      className='upgrade-button'
                      onClick={() => setActiveTab('plans')}
                    >
                      View Plans & Upgrade
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'plans' && (
            <div className='plans-tab'>
              <SubscriptionPlans />
            </div>
          )}

          {activeTab === 'usage' && hasPremium && (
            <div className='usage-tab'>
              <div className='usage-card'>
                <h3>Feature Usage</h3>
                {featureUsage ? (
                  <div className='usage-stats'>
                    {Object.entries(featureUsage).map(([feature, usage]) => (
                      <div key={feature} className='usage-item'>
                        <span className='usage-label'>{feature}:</span>
                        <span className='usage-value'>{usage}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No usage data available</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className='payments-tab'>
              <PaymentHistory />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
