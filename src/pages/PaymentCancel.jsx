import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { checkPaymentStatus } from '../services/subscription';
import '../css/payment-result.css';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

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
        
        // Handle 404 - payment invoice not found (this is expected for cancelled payments)
        if (err.paymentNotFound) {
          console.log('Payment invoice not found - likely cancelled or expired');
          // Don't show error for cancelled payments, this is expected
        } else {
          console.error('Unexpected error getting payment details:', err);
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

  if (loading) {
    return (
      <div className='payment-result-container'>
        <div className='payment-result-card'>
          <div className='payment-loading'>
            <div className='spinner large'></div>
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='payment-result-container'>
      <div className='payment-result-card'>
        <div className='payment-cancel-icon'>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <circle cx='12' cy='12' r='10' />
            <path d='M8 12h8' />
          </svg>
        </div>
        
        <h1 className='payment-result-title cancel'>Payment Cancelled</h1>
        
        <p className='payment-result-message'>
          You cancelled the payment process. No charges have been made to your account.
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
                <span className='status-badge cancel'>Cancelled</span>
              </div>
            </div>
          </div>
        )}

        <div className='payment-help-section'>
          <h3>Ready to subscribe?</h3>
          <p>
            You can create a new subscription at any time. Our premium features include:
          </p>
          <ul>
            <li>AI-powered cover letter generation</li>
            <li>Advanced job filtering and search</li>
            <li>Priority customer support</li>
            <li>Access to premium job listings</li>
          </ul>
        </div>
        
        <div className='payment-result-actions'>
          <button 
            className='btn-primary'
            onClick={handleTryAgain}
          >
            Subscribe Now
          </button>
          <button 
            className='btn-secondary'
            onClick={handleGoHome}
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
