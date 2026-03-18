import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const STATUS_CONFIG = {
  pending:   { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: '⏳', label: 'Pending' },
  confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: '✓', label: 'Confirmed' },
  started:   { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: '🔧', label: 'In Progress' },
  completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: '✅', label: 'Completed' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: '✕', label: 'Cancelled' },
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const { isProvider } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  async function refresh() {
    const { data } = await client.get(`/bookings/${id}/`);
    setBooking(data);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [id]);

  async function doAction(url, body = {}) {
    setError('');
    setActionLoading(true);
    try {
      await client.post(url, body);
      await refresh();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setError(Object.values(data).flat().join(' '));
      } else {
        setError('Action failed. Please try again.');
      }
    } finally {
      setActionLoading(false);
      setOtpInput('');
    }
  }

  async function initiatePayment() {
    setPaymentLoading(true);
    setError('');
    try {
      const { data } = await client.post(`/bookings/payment/${id}/`, {
        payment_method: booking.payment_method,
      });

      if (!data.order_id) {
        await refresh();
        return;
      }

      const options = {
        key: data.key_id,
        amount: Math.round(data.amount * 100),
        currency: data.currency ?? 'INR',
        order_id: data.order_id,
        name: 'ServiceMarket',
        description: `Booking #${id}`,
        handler: async (response) => {
          try {
            await client.post(`/bookings/${id}/verify/`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch {
            setError('Payment verification failed. Please contact support.');
          } finally {
            await refresh();
          }
        },
        modal: {
          ondismiss: () => refresh(),
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setError('Razorpay SDK not loaded. Please refresh the page.');
      }
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : 'Could not initiate payment.');
    } finally {
      setPaymentLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!booking) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-gray-500 dark:text-gray-400">Booking not found</p>
      </div>
    );
  }

  const isPaidAndDone = booking.status === 'completed' && booking.is_paid;
  const status = STATUS_CONFIG[booking.status] ?? { bg: 'bg-gray-100', text: 'text-gray-700', icon: '•', label: booking.status };
  const date = new Date(booking.booking_date).toLocaleString();
  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const paymentLabel = booking.payment_method === 'cash' ? 'Cash' : 'Online (Razorpay)';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to={isProvider ? '/provider-bookings' : '/my-bookings'}
        className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Bookings
      </Link>

      {/* Completed Banner */}
      {isPaidAndDone && (
        <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-8 text-center shadow-lg shadow-green-500/30">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full"></div>
          </div>
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-2xl font-bold mb-1">Booking Complete</p>
            <p className="text-green-100">Payment received - All done!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Booking #{id}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{booking.service_title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold ${status.bg} ${status.text}`}>
            <span>{status.icon}</span>
            {!isProvider && booking?.status === 'pending' ? 'Awaiting Confirmation' : status.label}
          </span>
          {booking.is_paid && (
            <span className="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-full text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Paid
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Details Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Booking Details</h2>
        </div>
        <div className="p-6 space-y-4">
          <DetailRow
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
            label="Date & Time"
            value={date}
          />
          <DetailRow
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />}
            label="Address"
            value={booking.address}
          />
          <DetailRow
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />}
            label="Amount"
            value={`₹${booking.amount}`}
            highlight
          />
          <DetailRow
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />}
            label="Payment Method"
            value={paymentLabel}
          />

          {booking.status === 'completed' && (
            <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Payment Status</span>
              <span className={`font-semibold ${booking.is_paid ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                {booking.is_paid ? 'Paid' : 'Pending'}
              </span>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
            {isProvider ? (
              <>
                <DetailRow
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                  label="Customer"
                  value={booking.customer_name}
                />
                <DetailRow
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />}
                  label="Customer Phone"
                  value={booking.customer_phone}
                />
              </>
            ) : (
              <>
                <DetailRow
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                  label="Provider"
                  value={booking.service_provider}
                />
                <DetailRow
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />}
                  label="Provider Phone"
                  value={booking.service_provider_tel}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* OTPs - Customer Side */}
      {!isProvider && booking.status === 'confirmed' && booking.arrival_otp && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">Arrival OTP</p>
          <p className="text-4xl font-bold text-blue-800 dark:text-blue-200 tracking-[0.3em] mb-2">{booking.arrival_otp}</p>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Share this OTP with the provider when they arrive</p>
        </div>
      )}

      {!isProvider && booking.status === 'started' && booking.completion_otp && (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">Completion OTP</p>
          <p className="text-4xl font-bold text-purple-800 dark:text-purple-200 tracking-[0.3em] mb-2">{booking.completion_otp}</p>
          <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Share this OTP when the work is completed</p>
        </div>
      )}

      {/* Provider Actions */}
      {isProvider && !isPaidAndDone && (
        <div className="space-y-4">
          {booking.status === 'pending' && (
            <button
              onClick={() => doAction(`/bookings/confirm/${id}/`)}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-60"
            >
              {actionLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm Booking
                </>
              )}
            </button>
          )}

          {booking.status === 'confirmed' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">Enter Arrival OTP</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get this code from the customer</p>
              </div>
              <input
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                placeholder="• • • •"
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={() => doAction(`/bookings/start/${id}/`, { arrival_otp: otpInput })}
                disabled={actionLoading || otpInput.length !== 4}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-60"
              >
                {actionLoading ? 'Processing...' : 'Start Work'}
              </button>
            </div>
          )}

          {booking.status === 'started' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">Enter Completion OTP</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get this code from the customer</p>
              </div>
              <input
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                placeholder="• • • •"
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={() => doAction(`/bookings/complete/${id}/`, { completion_otp: otpInput })}
                disabled={actionLoading || otpInput.length !== 4}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-60"
              >
                {actionLoading ? 'Processing...' : 'Mark Complete'}
              </button>
            </div>
          )}

          {booking.status === 'completed' && !booking.is_paid && (
            <button
              onClick={initiatePayment}
              disabled={paymentLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-60"
            >
              {paymentLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Initiate Payment · ₹{booking.amount}
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Cancel Button */}
      {canCancel && (
        <button
          onClick={() => doAction(`/bookings/cancel/${id}/`)}
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 py-3 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-60"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {actionLoading ? 'Processing...' : 'Cancel Booking'}
        </button>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value, highlight = false }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`font-semibold ${highlight ? 'text-xl text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'} truncate`}>
          {value}
        </p>
      </div>
    </div>
  );
}
