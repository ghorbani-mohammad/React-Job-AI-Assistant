import { useState, useEffect } from 'react';
import { useSubscription } from '../contexts/Subscription';
import { getPendingSubscription, clearPendingSubscription } from '../services/payment';
import '../css/payment-notification.css';

const PaymentStatusNotification = () => {
  const { handlePaymentReturnCallback, loading } = useSubscription();
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkPendingPayment = async () => {
      const pending = getPendingSubscription();
      if (pending) {
        setNotification({
          type: 'pending',
          message: 'Checking payment status...',
          orderId: pending.orderId
        });
        setIsVisible(true);

        try {
          const result = await handlePaymentReturnCallback();
          
          if (result.handled) {
            if (result.success) {
              setNotification({
                type: 'success',
                message: 'Payment completed successfully! Your premium features are now active.',
                orderId: pending.orderId
              });
              
              // Auto-hide success notification after 5 seconds
              setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => setNotification(null), 300);
              }, 5000);
              
            } else {
              // Handle payment not found (404) - clear notification after showing message
              if (result.paymentNotFound) {
                setNotification({
                  type: 'error',
                  message: 'Payment invoice not found. Please try creating a new subscription.',
                  orderId: pending.orderId
                });
                
                // Auto-hide and clear after 5 seconds
                setTimeout(() => {
                  setIsVisible(false);
                  setTimeout(() => setNotification(null), 300);
                }, 5000);
              } else {
                setNotification({
                  type: 'error',
                  message: result.reason || 'Payment failed. Please try again.',
                  orderId: pending.orderId
                });
              }
            }
          }
        } catch (error) {
          setNotification({
            type: 'error',
            message: 'Unable to verify payment status. Please contact support.',
            orderId: pending.orderId
          });
        }
      }
    };

    // Only check on mount, not on every render
    checkPendingPayment();
  }, []); // Empty dependency array

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setNotification(null);
      // Clear pending subscription data if it's an error
      if (notification?.type === 'error') {
        clearPendingSubscription();
      }
    }, 300);
  };

  const handleRetryPayment = () => {
    // Redirect to subscription page to retry
    window.location.href = '/subscription';
  };

  if (!notification || !isVisible) {
    return null;
  }

  return (
    <div className={`payment-notification ${notification.type} ${isVisible ? 'visible' : ''}`}>
      <div className='notification-content'>
        <div className='notification-icon'>
          {notification.type === 'success' && '✅'}
          {notification.type === 'error' && '❌'}
          {notification.type === 'pending' && (
            <div className='loading-spinner'></div>
          )}
        </div>
        
        <div className='notification-text'>
          <div className='notification-message'>{notification.message}</div>
          {notification.orderId && (
            <div className='notification-order'>Order: {notification.orderId}</div>
          )}
        </div>

        <div className='notification-actions'>
          {notification.type === 'error' && (
            <button onClick={handleRetryPayment} className='retry-button'>
              Retry Payment
            </button>
          )}
          <button onClick={handleDismiss} className='dismiss-button'>
            {notification.type === 'pending' ? 'Hide' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusNotification;
