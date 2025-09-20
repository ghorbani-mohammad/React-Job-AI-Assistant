import { useState } from 'react';
import { useSubscription } from '../contexts/Subscription';
import { useAuth } from '../contexts/Auth';
import '../css/subscription.css';

const SubscriptionPlans = ({ onPlanSelect, showTitle = true }) => {
  const { 
    subscriptionPlans, 
    loading, 
    subscribe, 
    hasPremium, 
    premiumStatus, 
    paymentServiceStatus
  } = useSubscription();
  const { isLoggedIn } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  const handlePlanSelect = async (plan) => {
    if (!isLoggedIn) {
      alert('Please log in to subscribe to a plan');
      return;
    }

    if (subscribing) return;

    // Check if payment service is available
    if (paymentServiceStatus && !paymentServiceStatus.service_available) {
      alert('Payment service is temporarily unavailable. Please try again later.');
      return;
    }

    try {
      setSelectedPlan(plan.id);
      setSubscribing(true);
      
      if (onPlanSelect) {
        onPlanSelect(plan);
      } else {
        const result = await subscribe(plan.id);
        
        // If payment is required, user will be redirected
        // If no payment needed, show success message
        if (!result.payment || !result.payment.payment_url) {
          alert('Successfully subscribed to ' + plan.name + ' plan!');
        }
        // Note: If payment is required, user gets redirected and won't see this
      }
    } catch (error) {
      alert('Failed to subscribe: ' + error.message);
    } finally {
      setSubscribing(false);
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case 'premium':
        return '✨';
      case 'pro':
        return '🚀';
      default:
        return '📦';
    }
  };

  const getBillingLabel = (planType) => {
    return planType === 'monthly' ? 'per month' : 'per year';
  };

  const getDiscountLabel = (plan) => {
    if (plan.plan_type === 'yearly') {
      const monthlyEquivalent = subscriptionPlans.find(p => 
        p.name === plan.name && p.plan_type === 'monthly'
      );
      if (monthlyEquivalent) {
        const yearlyTotal = parseFloat(plan.price);
        const monthlyTotal = parseFloat(monthlyEquivalent.price) * 12;
        const discount = Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
        return discount > 0 ? `Save ${discount}%` : null;
      }
    }
    return null;
  };

  const isCurrentPlan = (plan) => {
    return premiumStatus?.subscription?.plan?.id === plan.id;
  };

  if (loading) {
    return (
      <div className='subscription-loading'>
        <div className='loading-spinner'></div>
        <p>Loading subscription plans...</p>
      </div>
    );
  }

  // Group plans by name and billing cycle
  const groupedPlans = subscriptionPlans.reduce((acc, plan) => {
    if (!acc[plan.name]) {
      acc[plan.name] = {};
    }
    acc[plan.name][plan.plan_type] = plan;
    return acc;
  }, {});

  return (
    <div className='subscription-plans'>
      {showTitle && (
        <div className='plans-header'>
          <h2>Choose Your Plan</h2>
          <p>Unlock premium features and take your job search to the next level</p>
        </div>
      )}

      {hasPremium && (
        <div className='current-plan-notice'>
          <span className='premium-badge'>✨ Premium Active</span>
          <p>You currently have an active premium subscription</p>
        </div>
      )}

      {paymentServiceStatus && !paymentServiceStatus.service_available && (
        <div className='payment-service-warning'>
          <span className='warning-icon'>⚠️</span>
          <div>
            <h4>Payment Service Unavailable</h4>
            <p>Our payment service is temporarily unavailable. Please try again later.</p>
          </div>
        </div>
      )}


      <div className='plans-grid'>
        {Object.entries(groupedPlans).map(([planName, planTypes]) => (
          <div key={planName} className='plan-group'>
            <div className='plan-group-header'>
              <span className='plan-icon'>{getPlanIcon(planName)}</span>
              <h3>{planName}</h3>
            </div>

            <div className='billing-options'>
              {['monthly', 'yearly'].map(billingType => {
                const plan = planTypes[billingType];
                if (!plan) return null;

                const discount = getDiscountLabel(plan);
                const isCurrent = isCurrentPlan(plan);
                const isSelected = selectedPlan === plan.id;

                return (
                  <div 
                    key={plan.id} 
                    className={`plan-card ${isCurrent ? 'current-plan' : ''} ${isSelected ? 'selected' : ''}`}
                  >
                    {discount && <div className='discount-badge'>{discount}</div>}
                    
                    <div className='plan-header'>
                      <div className='plan-price'>
                        <span className='currency'>$</span>
                        <span className='amount'>{formatPrice(plan.price)}</span>
                        <span className='period'>/{getBillingLabel(plan.plan_type)}</span>
                      </div>
                      <p className='plan-billing'>{plan.plan_type.charAt(0).toUpperCase() + plan.plan_type.slice(1)} billing</p>
                    </div>

                    <div className='plan-features'>
                      <h4>Features included:</h4>
                      <ul>
                        {plan.features?.map((feature, index) => (
                          <li key={index}>
                            <span className='feature-check'>✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className='plan-description'>
                      <p>{plan.description}</p>
                    </div>

                    <button
                      className={`plan-button ${isCurrent ? 'current' : subscribing && isSelected ? 'loading' : ''}`}
                      onClick={() => handlePlanSelect(plan)}
                      disabled={subscribing || isCurrent || !plan.is_active || (paymentServiceStatus && !paymentServiceStatus.service_available)}
                    >
                      {isCurrent ? 'Current Plan' : 
                       subscribing && isSelected ? 'Subscribing...' : 
                       !plan.is_active ? 'Unavailable' :
                       paymentServiceStatus && !paymentServiceStatus.service_available ? 'Payment Service Unavailable' :
                       `Choose ${planName} ${plan.plan_type.charAt(0).toUpperCase() + plan.plan_type.slice(1)}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!isLoggedIn && (
        <div className='login-notice'>
          <p>Please log in to subscribe to a plan</p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
