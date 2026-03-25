import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

function StarRating({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>★</span>
      ))}
    </span>
  );
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const { user, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ comment: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    client.get(`/services/${id}/`)
      .then(({ data }) => setService(data))
      .catch(() => navigate('/services'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function submitReview(e) {
    e.preventDefault();
    setReviewError('');
    setSubmitting(true);
    try {
      await client.post('/reviews/', { ...reviewForm, service: id });
      const { data } = await client.get(`/services/${id}/`);
      setService(data);
      setReviewForm({ comment: '', rating: 5 });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setReviewError(Object.values(data).flat().join(' '));
      } else {
        setReviewError('Could not submit review.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!service) return null;

  const imageUrl = service.image ? service.image : null;
  const reviews = service.reviews ?? [];
  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-8">
      {/* Modern Card Container */}
      <div className="bg-white/80 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 shadow-xl rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 backdrop-blur-md">
        {/* Image with overlay */}
        <div className="relative">
          {imageUrl ? (
            <img src={imageUrl} alt={service.title} className="w-full h-64 object-cover" />
          ) : (
            <div className="w-full h-64 bg-gradient-to-tr from-primary-100 to-primary-300 dark:from-primary-900 dark:to-primary-700 flex items-center justify-center text-7xl text-primary-600 dark:text-primary-400">🔧</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Header Section */}
        <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-700 dark:text-primary-400 mb-1">
              {service.category?.name ?? 'General'}
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-1">{service.title}</h1>
            <p className="text-base text-gray-500 dark:text-gray-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400" />
              {service.location}
            </p>
            {avgRating && (
              <p className="text-sm text-yellow-500 dark:text-yellow-400 mt-2 flex items-center gap-1">
                <span className="text-lg">★</span> {avgRating} <span className="text-gray-400 dark:text-gray-500">({reviews.length} reviews)</span>
              </p>
            )}
          </div>
          <div className="text-right min-w-[140px]">
            <p className="text-3xl font-extrabold text-primary-700 dark:text-primary-400 mb-2">₹{service.price}</p>
            {isCustomer && (
              <Link
                to={`/services/${id}/book`}
                className="w-full block bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 text-white px-6 py-2 rounded-xl text-base font-bold shadow-md hover:scale-105 hover:from-primary-700 hover:to-primary-600 transition-transform"
              >
                Book Now
              </Link>
            )}
            {!user && (
              <Link
                to="/login"
                className="w-full block bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 text-white px-6 py-2 rounded-xl text-base font-bold shadow-md hover:scale-105 hover:from-primary-700 hover:to-primary-600 transition-transform"
              >
                Login to Book
              </Link>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-5 mt-2 bg-white/70 dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-inner">
          <h2 className="font-bold text-lg text-primary-700 dark:text-primary-400 mb-2 tracking-tight">About this service</h2>
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{service.description}</p>
        </div>

        {/* Reviews */}
        <div className="px-6 py-5 mt-6 bg-white/70 dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-inner">
          <h2 className="font-bold text-lg text-primary-700 dark:text-primary-400 mb-4 tracking-tight">Reviews <span className="text-gray-400 dark:text-gray-500 font-normal">({reviews.length})</span></h2>
          {reviews.length === 0 ? (
            <p className="text-base text-gray-500 dark:text-gray-400">No reviews yet</p>
          ) : (
            <div className="space-y-5">
              {reviews.map((r, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  {/* Avatar or Initials */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg shadow-sm">
                    {r.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-base text-gray-900 dark:text-white">{r.username}</span>
                      <StarRating rating={r.rating} />
                    </div>
                    <p className="text-base text-gray-700 dark:text-gray-300">{r.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Review form */}
          {isCustomer && (
            <form onSubmit={submitReview} className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <h3 className="font-bold text-base text-primary-700 dark:text-primary-400">Write a review</h3>
              {reviewError && (
                <div className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-base rounded px-3 py-2 font-medium shadow-sm">{reviewError}</div>
              )}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">Rating</label>
                <div className="star-rating flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                      className={`text-2xl cursor-pointer transition-colors ${n <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} hover:scale-125`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  rows={3}
                  required
                  maxLength={200}
                  placeholder="Share your experience…"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-base bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 text-white px-6 py-2 rounded-xl text-base font-bold shadow-md hover:scale-105 hover:from-primary-700 hover:to-primary-600 transition-transform disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
