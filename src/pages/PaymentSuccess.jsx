import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/Subscription';
import { checkPaymentStatus } from '../services/subscription';
import '../css/payment-result.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSubscriptionStatus } = useSubscription();
  
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState('');

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId && !orderId) {
        setError('Missing payment information');
        setVerificationStatus('error');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setVerificationStatus('verifying');

        // Check payment status to confirm it's actually successful
        let payment = null;
        if (paymentId) {
          payment = await checkPaymentStatus(paymentId);
        }

        if (payment && (payment.is_paid || payment.status === 'finished')) {
          setPaymentDetails(payment);
          setVerificationStatus('confirmed');
          
          // Refresh user's subscription status
          await refreshSubscriptionStatus();
        } else {
          // Payment might still be processing
          setVerificationStatus('processing');
          setPaymentDetails(payment);
        }

      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Unable to verify payment status. Please contact support if you completed the payment.');
        setVerificationStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [paymentId, orderId, refreshSubscriptionStatus]);

  const handleContinue = () => {
    navigate('/subscription');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className='payment-result-container'>
        <div className='payment-result-card'>
          <div className='payment-loading'>
            <div className='spinner large'></div>
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your payment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='payment-result-container'>
      <div className='payment-result-card'>
        {verificationStatus === 'confirmed' && (
          <>
            <div className='payment-success-icon'>
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='M9 12l2 2 4-4' />
                <circle cx='12' cy='12' r='9' />
              </svg>
            </div>
            <h1 className='payment-result-title success'>Payment Successful!</h1>
            <p className='payment-result-message'>
              Your subscription has been activated successfully. You now have access to all premium features.
            </p>
            
            {paymentDetails && (
              <div className='payment-details'>
                <h3>Payment Details</h3>
                <div className='payment-info'>
                  <div className='payment-info-row'>
                    <span>Order ID:</span>
                    <span>{paymentDetails.order_id || orderId}</span>
                  </div>
                  <div className='payment-info-row'>
                    <span>Amount:</span>
                    <span>{paymentDetails.price_amount} {paymentDetails.price_currency}</span>
                  </div>
                  <div className='payment-info-row'>
                    <span>Status:</span>
                    <span className='status-badge success'>{paymentDetails.status}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className='payment-result-actions'>
              <button 
                className='btn-primary'
                onClick={handleContinue}
              >
                View My Subscription
              </button>
              <button 
                className='btn-secondary'
                onClick={handleGoHome}
              >
                Continue to Home
              </button>
            </div>
          </>
        )}

        {verificationStatus === 'processing' && (
          <>
            <div className='payment-processing-icon'>
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <circle cx='12' cy='12' r='10' />
                <path d='M12 6v6l4 2' />
              </svg>
            </div>
            <h1 className='payment-result-title processing'>Payment Processing</h1>
            <p className='payment-result-message'>
              Your payment is being processed. This may take a few minutes to complete.
            </p>
            <div className='payment-result-actions'>
              <button 
                className='btn-primary'
                onClick={handleContinue}
              >
                Check Subscription Status
              </button>
              <button 
                className='btn-secondary'
                onClick={handleGoHome}
              >
                Go to Home
              </button>
            </div>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <div className='payment-error-icon'>
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <circle cx='12' cy='12' r='10' />
                <path d='M15 9l-6 6' />
                <path d='M9 9l6 6' />
              </svg>
            </div>
            <h1 className='payment-result-title error'>Verification Error</h1>
            <p className='payment-result-message'>
              {error || 'Unable to verify your payment. Please contact support if you completed the payment.'}
            </p>
            <div className='payment-result-actions'>
              <button 
                className='btn-primary'
                onClick={handleContinue}
              >
                Check Subscription Status
              </button>
              <button 
                className='btn-secondary'
                onClick={handleGoHome}
              >
                Go to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
