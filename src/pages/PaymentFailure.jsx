import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { checkPaymentStatus } from '../services/subscription';
import '../css/payment-result.css';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState('');

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const reason = searchParams.get('reason') || 'Payment failed';

  useEffect(() => {
    const getPaymentDetails = async () => {
      if (!paymentId) {
        setLoading(false);
        return;
      }

      try {
        const payment = await checkPaymentStatus(paymentId);
        setPaymentDetails(payment);
      } catch (err) {
        console.error('Failed to get payment details:', err);
        
        // Handle 404 - payment invoice not found
        if (err.paymentNotFound) {
          setError('Payment invoice not found. This payment may have been cancelled or expired.');
        } else {
          setError('Unable to retrieve payment details');
        }
      } finally {
        setLoading(false);
      }
    };

    getPaymentDetails();
  }, [paymentId]);

  const handleTryAgain = () => {
    navigate('/subscription');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const getFailureReason = () => {
    if (paymentDetails) {
      switch (paymentDetails.status) {
        case 'expired':
          return 'Payment expired. The payment window has closed.';
        case 'failed':
          return 'Payment failed to process. Please try again.';
        case 'refunded':
          return 'Payment was refunded.';
        default:
          return reason;
      }
    }
    return reason;
  };

  if (loading) {
    return (
      <div className='payment-result-container'>
        <div className='payment-result-card'>
          <div className='payment-loading'>
            <div className='spinner large'></div>
            <h2>Loading Payment Details...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='payment-result-container'>
      <div className='payment-result-card'>
        <div className='payment-failure-icon'>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <circle cx='12' cy='12' r='10' />
            <path d='M15 9l-6 6' />
            <path d='M9 9l6 6' />
          </svg>
        </div>
        
        <h1 className='payment-result-title failure'>Payment Failed</h1>
        
        <p className='payment-result-message'>
          {getFailureReason()}
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
                <span className='status-badge failure'>{paymentDetails.status}</span>
              </div>
            </div>
          </div>
        )}

        <div className='payment-help-section'>
          <h3>What can you do?</h3>
          <ul>
            <li>Try creating a new subscription with a different payment method</li>
            <li>Check your wallet balance and ensure sufficient funds</li>
            <li>Verify your network connection and try again</li>
            <li>Contact our support team if the issue persists</li>
          </ul>
        </div>
        
        <div className='payment-result-actions'>
          <button 
            className='btn-primary'
            onClick={handleTryAgain}
          >
            Try Again
          </button>
          <button 
            className='btn-secondary'
            onClick={handleGoHome}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
