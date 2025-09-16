# React Job Board - Subscription System

This document provides a comprehensive guide to the subscription system implemented in the React Job Board application.

## Features Implemented

### 🎯 Core Subscription Features
- **Multiple Plans**: Premium and Pro plans with monthly/yearly billing
- **Premium Features**: AI Cover Letter Generation, Advanced Filters, Priority Support
- **Pro Features**: Industry Analytics, Interview Prep, Salary Tools
- **Real-time Status**: Live subscription status in navbar
- **Feature Guards**: Automatic premium feature protection

### 🔧 Technical Components

#### Services (`src/services/subscription.js`)
- Complete API integration following the provided specification
- Public and authenticated endpoints
- Error handling with user-friendly messages
- Support for all subscription operations (create, cancel, status check)

#### Context (`src/contexts/Subscription.jsx`)
- Centralized subscription state management
- Automatic status synchronization with auth state
- Helper functions for feature access checks
- Loading states and error handling

#### Components
- **`SubscriptionPlans.jsx`**: Beautiful plan selection interface
- **`PremiumFeatureGuard.jsx`**: Flexible feature protection component
- **`Subscription.jsx`**: Complete subscription management page
- **Updated `AIModal.jsx`**: Now protected with premium guards
- **Updated `Navbar.jsx`**: Shows subscription status and quick access

#### Styling
- **`subscription.css`**: Complete styling for all subscription components
- **`premium-guard.css`**: Styling for premium feature guards
- Responsive design for all screen sizes
- Modern gradient designs and animations

## 🚀 Quick Start

### 1. Basic Setup
The subscription system is already integrated into your app. The main providers are wrapped in `App.jsx`:

```jsx
<AuthProvider>
  <SubscriptionProvider>
    {/* Your app components */}
  </SubscriptionProvider>
</AuthProvider>
```

### 2. Using Premium Feature Guards

#### Wrap Components
```jsx
import PremiumFeatureGuard from './components/PremiumFeatureGuard';

<PremiumFeatureGuard feature="AI Cover Letter Generation">
  <YourPremiumComponent />
</PremiumFeatureGuard>
```

#### Use the Hook
```jsx
import { usePremiumGuard } from './components/PremiumFeatureGuard';

const { hasAccess, requiresUpgrade } = usePremiumGuard('Advanced Job Search Filters');

if (hasAccess) {
  // Show premium features
} else {
  // Show upgrade prompt
}
```

#### Check Subscription Status
```jsx
import { useSubscription } from './contexts/Subscription';

const { hasPremium, daysRemaining, currentSubscription } = useSubscription();
```

### 3. Available Features to Guard

#### Premium Features
- `"AI Cover Letter Generation"`
- `"Advanced Job Search Filters"`
- `"Priority Customer Support"`
- `"Resume Analysis & Optimization"`

#### Pro Features (require `requiredPlan="pro"`)
- `"Industry Insights & Analytics"`
- `"AI Interview Preparation"`
- `"Salary Negotiation Tools"`

## 📱 User Experience

### Navigation
- **Navbar**: Shows premium status, expiration warnings, and upgrade prompts
- **Subscription Page**: Complete management interface at `/subscription`
- **Feature Guards**: Contextual upgrade prompts throughout the app

### Subscription Management
Users can:
- ✅ View all available plans with feature comparisons
- ✅ Subscribe to monthly or yearly plans
- ✅ See current subscription status and billing info
- ✅ Cancel subscriptions (access retained until expiration)
- ✅ View feature usage statistics
- ✅ Get upgrade prompts for premium features

### Premium Feature Access
- **AI Cover Letter**: Now requires premium subscription
- **Advanced Filters**: Protected by feature guards
- **Analytics Dashboard**: Pro-only features clearly marked
- **Graceful Degradation**: Free users see upgrade prompts instead of errors

## 🎨 Customization

### Adding New Premium Features

1. **Add to Feature Guards**:
```jsx
<PremiumFeatureGuard feature="Your New Feature">
  <NewFeatureComponent />
</PremiumFeatureGuard>
```

2. **Update Plan Features**: Ensure your backend includes the feature in plan definitions

3. **Add Custom Styling**: Extend `premium-guard.css` for custom layouts

### Customizing Plans Display

The `SubscriptionPlans` component automatically groups plans by name and billing cycle. To customize:

```jsx
<SubscriptionPlans 
  showTitle={false}  // Hide the header
  onPlanSelect={customHandler}  // Custom selection logic
/>
```

### Custom Feature Guards

Create specialized guards for specific use cases:

```jsx
const CustomFeatureGuard = ({ children }) => {
  const { hasPremium } = useSubscription();
  
  if (!hasPremium) {
    return <CustomUpgradePrompt />;
  }
  
  return children;
};
```

## 🔧 API Integration

The subscription system integrates with these API endpoints:

### Public Endpoints
- `GET /api/v1/user/subscriptions/plans/` - Get available plans

### Authenticated Endpoints
- `GET /api/v1/user/premium-status/` - Check premium status
- `POST /api/v1/user/subscriptions/` - Create subscription
- `GET /api/v1/user/subscriptions/current/` - Get current subscription
- `POST /api/v1/user/subscriptions/{id}/cancel/` - Cancel subscription
- `POST /api/v1/ai/cover-letter/generate/` - Generate cover letter (Premium)

## 🎯 Best Practices

### Feature Protection
- Always wrap premium features with `PremiumFeatureGuard`
- Use descriptive feature names that match your backend
- Provide meaningful upgrade prompts with clear benefits

### User Experience
- Show subscription status prominently in navigation
- Provide clear upgrade paths from feature guards
- Give users control over their subscriptions
- Handle expired subscriptions gracefully

### Performance
- Subscription context loads data only when needed
- Feature checks are optimized with useMemo/useCallback
- API calls are batched where possible

## 🐛 Troubleshooting

### Common Issues

1. **Feature Guard Not Working**
   - Ensure `SubscriptionProvider` wraps your components
   - Check feature name spelling matches backend exactly
   - Verify user is logged in for authenticated features

2. **Subscription Status Not Updating**
   - Call `refreshSubscriptionData()` after subscription changes
   - Check API endpoints are responding correctly
   - Verify auth tokens are valid

3. **Styling Issues**
   - Import required CSS files in components
   - Check responsive breakpoints for mobile
   - Ensure CSS custom properties are supported

### Debug Mode

Add this to see current subscription state:

```jsx
const { premiumStatus, currentSubscription, loading, error } = useSubscription();
console.log('Subscription Debug:', { premiumStatus, currentSubscription, loading, error });
```

## 📈 Future Enhancements

The subscription system is designed to be extensible. Consider adding:

- **Usage Tracking**: Monitor feature usage per user
- **Promo Codes**: Discount code system
- **Team Plans**: Multi-user subscriptions
- **Usage Limits**: Rate limiting for premium features
- **Notification System**: Subscription renewal reminders
- **A/B Testing**: Different pricing strategies

## 🔗 Related Files

- `/src/services/subscription.js` - API service layer
- `/src/contexts/Subscription.jsx` - State management
- `/src/components/PremiumFeatureGuard.jsx` - Feature protection
- `/src/pages/Subscription.jsx` - Management interface
- `/src/css/subscription.css` - Styling
- `/src/css/premium-guard.css` - Guard styling

---

The subscription system provides a solid foundation for monetizing your job board application while maintaining excellent user experience. The modular design makes it easy to extend and customize based on your specific needs.
