import { useState, useEffect } from 'react';
import { getPaymentHistory } from '../services/subscription';
import { 
  getPaymentStatusText, 
  getPaymentStatusColor, 
  formatPaymentAmount, 
  getPaymentMethodIcon,
  getPaymentTimeRemaining,
  canPaymentBeCompleted
} from '../services/payment';
import '../css/payment-history.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const history = await getPaymentHistory();
      setPayments(history);
    } catch (err) {
      console.error('Failed to load payment history:', err);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = (paymentUrl) => {
    window.open(paymentUrl, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className='payment-history-loading'>
        <div className='loading-spinner'></div>
        <p>Loading payment history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='payment-history-error'>
        <p>{error}</p>
        <button onClick={loadPaymentHistory} className='retry-button'>
          Try Again
        </button>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className='payment-history-empty'>
        <div className='empty-icon'>💳</div>
        <h3>No Payment History</h3>
        <p>You haven't made any payments yet.</p>
      </div>
    );
  }

  return (
    <div className='payment-history'>
      <div className='payment-history-header'>
        <h3>Payment History</h3>
        <button onClick={loadPaymentHistory} className='refresh-button'>
          🔄 Refresh
        </button>
      </div>

      <div className='payment-list'>
        {payments.map((payment) => {
          const statusColor = getPaymentStatusColor(payment.status);
          const timeRemaining = payment.expires_at ? getPaymentTimeRemaining(payment.expires_at) : null;
          const canComplete = canPaymentBeCompleted(payment);

          return (
            <div key={payment.id} className={`payment-item ${payment.status}`}>
              <div className='payment-main-info'>
                <div className='payment-header'>
                  <div className='payment-plan'>
                    <h4>{payment.subscription_plan_name || 'Premium Plan'}</h4>
                    <span className='payment-order'>Order: {payment.order_id}</span>
                  </div>
                  <div className='payment-status-badge' style={{ backgroundColor: statusColor }}>
                    {getPaymentStatusText(payment.status)}
                  </div>
                </div>

                <div className='payment-details'>
                  <div className='payment-amounts'>
                    <div className='amount-row'>
                      <span className='amount-label'>Price:</span>
                      <span className='amount-value'>
                        {formatPaymentAmount(payment.price_amount, payment.price_currency)}
                      </span>
                    </div>
                    {payment.pay_amount && payment.pay_currency && (
                      <div className='amount-row crypto'>
                        <span className='amount-label'>
                          {getPaymentMethodIcon(payment.pay_currency)} Pay:
                        </span>
                        <span className='amount-value'>
                          {formatPaymentAmount(payment.pay_amount, payment.pay_currency)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='payment-dates'>
                    <div className='date-row'>
                      <span className='date-label'>Created:</span>
                      <span className='date-value'>{formatDate(payment.created_at)}</span>
                    </div>
                    {timeRemaining && (
                      <div className='date-row'>
                        <span className='date-label'>
                          {timeRemaining.expired ? 'Status:' : 'Expires:'}
                        </span>
                        <span className={`date-value ${timeRemaining.expired ? 'expired' : timeRemaining.minutes <= 60 ? 'expiring-soon' : ''}`}>
                          {timeRemaining.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {canComplete && (
                  <div className='payment-actions'>
                    <button
                      onClick={() => handleCompletePayment(payment.payment_url)}
                      className='complete-payment-button'
                    >
                      Complete Payment
                    </button>
                    {timeRemaining && timeRemaining.minutes <= 60 && !timeRemaining.expired && (
                      <span className='urgency-notice'>
                        ⚠️ Payment expires soon!
                      </span>
                    )}
                  </div>
                )}

                {payment.status === 'finished' && (
                  <div className='payment-success'>
                    <span className='success-icon'>✅</span>
                    <span>Payment completed successfully</span>
                  </div>
                )}

                {payment.status === 'failed' && (
                  <div className='payment-failed'>
                    <span className='failed-icon'>❌</span>
                    <span>Payment failed - please try again</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentHistory;
