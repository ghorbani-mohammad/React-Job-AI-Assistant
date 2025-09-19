import { useState, useEffect } from 'react';
import { getPaymentHistory, cancelPayment } from '../services/subscription';
import { 
  getPaymentStatusText, 
  getPaymentStatusColor, 
  formatPaymentAmount, 
  getPaymentMethodIcon,
  getPaymentTimeRemaining,
  canPaymentBeCompleted
} from '../services/payment';
import notificationSoundService from '../services/notificationSound';
import '../css/payment-history.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [cancellingPayment, setCancellingPayment] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadPaymentHistory();
  }, [currentPage]);

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

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaymentHistory(currentPage, pageSize);
      
      // Handle paginated response
      if (response.results) {
        setPayments(response.results);
        setTotalCount(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / pageSize));
      } else {
        // Fallback for non-paginated response
        setPayments(response);
        setTotalCount(response.length);
        setTotalPages(1);
      }
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

  const handleCancelPayment = async (paymentId) => {
    if (!confirm('Are you sure you want to cancel this payment? This action cannot be undone.')) {
      return;
    }

    try {
      setCancellingPayment(paymentId);
      const result = await cancelPayment(paymentId);
      
      if (result.message) {
        showNotification(result.message, 'success');
      } else {
        showNotification('Payment cancelled successfully.', 'success');
      }
      
      // Refresh payment history after successful cancellation
      await loadPaymentHistory();
    } catch (error) {
      console.error('Payment cancellation error:', error);
      showNotification(`Failed to cancel payment: ${error.message}`, 'error');
    } finally {
      setCancellingPayment(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRefresh = () => {
    loadPaymentHistory();
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
        <button type="button" onClick={handleRefresh} className='retry-button'>
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
        <div className='header-info'>
          <h3>Payment History</h3>
          {totalCount > 0 && (
            <span className='pagination-info'>
              Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} payments
            </span>
          )}
        </div>
        <button type="button" onClick={handleRefresh} className='refresh-button'>
          🔄 Refresh
        </button>
      </div>

      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          <span className='notification-icon'>
            {notification.type === 'success' ? '✅' : '❌'}
          </span>
          <p>{notification.message}</p>
          <button 
            type="button"
            className='notification-close'
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

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

                {(canComplete || payment.status === 'waiting' || payment.status === 'pending') && (
                  <div className='payment-actions'>
                    {canComplete && (
                      <button
                        type="button"
                        onClick={() => handleCompletePayment(payment.payment_url)}
                        className='complete-payment-button'
                      >
                        Complete Payment
                      </button>
                    )}
                    
                    {(payment.status === 'waiting' || payment.status === 'pending') && (
                      <button
                        type="button"
                        onClick={() => handleCancelPayment(payment.id)}
                        disabled={cancellingPayment === payment.id}
                        className='cancel-payment-button'
                      >
                        {cancellingPayment === payment.id ? 'Cancelling...' : 'Cancel Payment'}
                      </button>
                    )}
                    
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

                {payment.status === 'cancelled' && (
                  <div className='payment-cancelled'>
                    <span className='cancelled-icon'>🚫</span>
                    <span>Payment was cancelled</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className='pagination-controls'>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className='pagination-button prev'
          >
            ← Previous
          </button>
          
          <div className='pagination-numbers'>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`pagination-button number ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='pagination-button next'
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
