import { useSubscription } from '../contexts/Subscription';
import { useAuth } from '../contexts/Auth';
import { Link } from 'react-router-dom';
import '../css/premium-guard.css';

const PremiumFeatureGuard = ({ 
  children, 
  feature, 
  fallback, 
  showUpgrade = true,
  requiredPlan = 'premium' 
}) => {
  const { hasPremium, hasFeatureAccess, currentSubscription } = useSubscription();
  const { isLoggedIn } = useAuth();

  // If user is not logged in
  if (!isLoggedIn) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className='premium-guard login-required'>
        <div className='guard-content'>
          <div className='guard-icon'>🔐</div>
          <h3>Login Required</h3>
          <p>Please log in to access this feature</p>
        </div>
      </div>
    );
  }

  // If user doesn't have premium or doesn't have access to specific feature
  const hasAccess = feature ? hasFeatureAccess(feature) : hasPremium;
  
  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }

    if (!showUpgrade) {
      return null;
    }

    const getPlanDisplayName = (plan) => {
      switch (plan.toLowerCase()) {
        case 'premium':
          return 'Premium';
        case 'pro':
          return 'Pro';
        default:
          return 'Premium';
      }
    };

    const getFeatureIcon = (featureName) => {
      const icons = {
        'AI Cover Letter Generation': '✨',
        'Advanced Job Search Filters': '🔍',
        'Priority Customer Support': '🎯',
        'Resume Analysis & Optimization': '📄',
        'Industry Insights & Analytics': '📊',
        'AI Interview Preparation': '🤖',
        'Salary Negotiation Tools': '💰'
      };
      return icons[featureName] || '⭐';
    };

    return (
      <div className='premium-guard upgrade-required'>
        <div className='guard-content'>
          <div className='guard-icon'>
            {feature ? getFeatureIcon(feature) : '✨'}
          </div>
          <h3>
            {getPlanDisplayName(requiredPlan)} Feature
          </h3>
          <p>
            {feature 
              ? `${feature} requires a ${getPlanDisplayName(requiredPlan)} subscription`
              : `This feature requires a ${getPlanDisplayName(requiredPlan)} subscription`
            }
          </p>
          
          {currentSubscription?.status === 'expired' ? (
            <div className='expired-notice'>
              <p>Your subscription has expired. Renew to continue using premium features.</p>
            </div>
          ) : (
            <div className='upgrade-benefits'>
              <p>Upgrade to unlock:</p>
              <ul>
                <li>✨ AI Cover Letter Generation</li>
                <li>🔍 Advanced Job Search Filters</li>
                <li>🎯 Priority Customer Support</li>
                <li>📄 Resume Analysis & Optimization</li>
                {requiredPlan === 'pro' && (
                  <>
                    <li>📊 Industry Insights & Analytics</li>
                    <li>🤖 AI Interview Preparation</li>
                    <li>💰 Salary Negotiation Tools</li>
                  </>
                )}
              </ul>
            </div>
          )}
          
          <div className='guard-actions'>
            <Link to='/subscription' className='upgrade-button'>
              {currentSubscription?.status === 'expired' ? 'Renew Subscription' : 'Upgrade Now'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render the children
  return children;
};

// Higher-order component version for wrapping entire components
export const withPremiumGuard = (WrappedComponent, options = {}) => {
  return function PremiumGuardedComponent(props) {
    return (
      <PremiumFeatureGuard {...options}>
        <WrappedComponent {...props} />
      </PremiumFeatureGuard>
    );
  };
};

// Hook for checking premium access in components
export const usePremiumGuard = (feature) => {
  const { hasPremium, hasFeatureAccess } = useSubscription();
  const { isLoggedIn } = useAuth();
  
  return {
    isLoggedIn,
    hasPremium,
    hasAccess: feature ? hasFeatureAccess(feature) : hasPremium,
    requiresUpgrade: !isLoggedIn || (feature ? !hasFeatureAccess(feature) : !hasPremium)
  };
};

export default PremiumFeatureGuard;
