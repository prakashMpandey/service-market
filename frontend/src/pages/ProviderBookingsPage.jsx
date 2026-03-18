import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = ['all', 'pending', 'confirmed', 'started', 'completed', 'cancelled'];

const STATUS_CONFIG = {
  pending:   { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: '⏳', label: 'Pending' },
  confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: '✓', label: 'Confirmed' },
  started:   { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: '🔧', label: 'In Progress' },
  completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: '✅', label: 'Completed' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: '✕', label: 'Cancelled' },
};

const NEXT_ACTION = {
  confirmed: { label: 'Start Work', color: 'from-purple-500 to-purple-600', hoverColor: 'hover:from-purple-600 hover:to-purple-700' },
  started:   { label: 'Complete', color: 'from-green-500 to-green-600', hoverColor: 'hover:from-green-600 hover:to-green-700' },
};

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/bookings/');
      setBookings(data.results ?? data);
    } catch {
      setError('Could not load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function confirmBooking(e, bookingId) {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setActionLoading(bookingId);
    try {
      await client.post(`/bookings/confirm/${bookingId}/`);
      await load();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message ?? 'Could not confirm booking.');
    } finally {
      setActionLoading(null);
    }
  }

  const visible = activeTab === 'all'
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Manage Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400">
            You have <span className="font-semibold text-gray-900 dark:text-white">{bookings.length}</span> total bookings
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          View Dashboard
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => {
          const count = tab === 'all' ? bookings.length : (counts[tab] ?? 0);
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab}
              <span className={`ml-2 px-2 py-0.5 rounded-lg text-xs ${
                isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      {visible.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl">
            📭
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No {activeTab === 'all' ? '' : activeTab} bookings
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'pending' ? 'New booking requests will appear here' : 'Check other tabs for more bookings'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((booking) => {
            const isPaidAndDone = booking.status === 'completed' && booking.is_paid;
            const status = STATUS_CONFIG[booking.status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', icon: '•', label: booking.status };
            const next = NEXT_ACTION[booking.status];
            const date = new Date(booking.booking_date).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div
                key={booking.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl border-2 p-5 transition-all hover:shadow-lg ${
                  isPaidAndDone
                    ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                    : 'border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="font-bold text-gray-900 dark:text-white">
                        Booking #{booking.id}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ${status.bg} ${status.text}`}>
                        <span>{status.icon}</span>
                        {status.label}
                      </span>
                      {isPaidAndDone && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-500 text-white px-2.5 py-1 rounded-full font-semibold">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Paid
                        </span>
                      )}
                      {booking.status === 'completed' && !booking.is_paid && (
                        <span className="inline-flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full font-semibold">
                          Payment Due
                        </span>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{booking.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{date}</span>
                      </div>
                    </div>

                    {booking.amount != null && (
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-3">
                        ₹{booking.amount}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
                    {booking.status === 'pending' && (
                      <button
                        onClick={(e) => confirmBooking(e, booking.id)}
                        disabled={actionLoading === booking.id}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-60"
                      >
                        {actionLoading === booking.id ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Confirm
                      </button>
                    )}

                    {next && (
                      <Link
                        to={`/bookings/${booking.id}`}
                        className={`flex items-center gap-2 bg-gradient-to-r ${next.color} ${next.hoverColor} text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-lg`}
                      >
                        {next.label}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}

                    {booking.status === 'completed' && !booking.is_paid && (
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Payment
                      </Link>
                    )}

                    <Link
                      to={`/bookings/${booking.id}`}
                      className="flex items-center gap-2 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
                    >
                      Details
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
