import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  pending:   { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: '⏳', label: 'Awaiting Confirmation' },
  confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: '✓', label: 'Confirmed' },
  started:   { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: '🔧', label: 'In Progress' },
  completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: '✅', label: 'Completed' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: '✕', label: 'Cancelled' },
};

export default function BookingCard({ booking }) {
  const isPaidAndDone = booking.status === 'completed' && booking.is_paid;
  const status = STATUS_CONFIG[booking.status] ?? { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: '•', label: booking.status };

  const date = new Date(booking.booking_date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Link
      to={`/bookings/${booking.id}`}
      className={`group block bg-white dark:bg-gray-800 rounded-2xl border-2 p-5 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all hover:-translate-y-0.5 ${
        isPaidAndDone
          ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
          : 'border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left side */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {booking.service_title ?? `Booking #${booking.id}`}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{date}</span>
          </div>

          {booking.address && (
            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{booking.address}</span>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold ${status.bg} ${status.text}`}>
            <span>{status.icon}</span>
            {status.label}
          </span>

          {/* Amount */}
          {booking.amount != null && (
            <span className="text-xl font-bold text-gray-900 dark:text-white">₹{booking.amount}</span>
          )}

          {/* Payment status */}
          {booking.is_paid ? (
            <span className="inline-flex items-center gap-1 text-xs bg-green-500 text-white px-2.5 py-1 rounded-full font-semibold">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Paid
            </span>
          ) : booking.status === 'completed' ? (
            <span className="inline-flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full font-semibold">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payment Due
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
