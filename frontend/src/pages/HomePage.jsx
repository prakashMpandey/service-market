import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { name: 'Plumbing', icon: '🔧', color: 'from-blue-500 to-blue-600' },
  { name: 'Electrical', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  { name: 'Cleaning', icon: '🧹', color: 'from-green-500 to-emerald-500' },
  { name: 'Painting', icon: '🎨', color: 'from-purple-500 to-pink-500' },
  { name: 'Carpentry', icon: '🪚', color: 'from-amber-600 to-amber-700' },
  { name: 'AC Repair', icon: '❄️', color: 'from-cyan-500 to-blue-500' },
];

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data } = await client.get('/services/');
        setServices(data.results ?? data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-700 dark:via-primary-800 dark:to-primary-900 px-6 py-16 sm:px-12 sm:py-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Find Trusted Local
            <span className="block text-primary-200">Service Providers</span>
          </h1>
          <p className="text-primary-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Book verified professionals for all your home service needs. From plumbing to painting, we&apos;ve got you covered.
          </p>

          {/* Decorative Search Bar - Non-functional */}
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl shadow-black/20">
              <div className="flex-1 flex items-center gap-3 px-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="What service do you need?"
                  className="flex-1 py-3 text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder:text-gray-400"
                  readOnly
                />
              </div>
              <Link
                to="/services/nearby"
                className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary-500/30"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Popular Categories</h2>
          <p className="text-gray-500 dark:text-gray-400">Browse services by category</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to="/services/nearby"
              className="group relative overflow-hidden rounded-2xl p-6 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{cat.name}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Services */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Featured Services</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Top-rated services in your area</p>
          </div>
          {/* <Link
            to="/services/nearby"
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            View all
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link> */}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : services.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">No services available yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Check back soon for new listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {services.slice(0, 8).map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">How It Works</h2>
          <p className="text-gray-500 dark:text-gray-400">Get your service done in 3 easy steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Find a Service', desc: 'Browse through our verified service providers near you', icon: '🔍' },
            { step: '02', title: 'Book Online', desc: 'Choose a time slot that works best for your schedule', icon: '📅' },
            { step: '03', title: 'Get It Done', desc: 'Sit back and relax while our professionals handle the job', icon: '✅' },
          ].map((item, i) => (
            <div key={i} className="text-center group">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white text-sm font-bold rounded-lg flex items-center justify-center shadow-lg">
                  {item.step}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-8 sm:p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Are you a service provider?</h2>
            <p className="text-gray-400 text-lg">Join our platform and grow your business with thousands of customers</p>
          </div>
          <Link
            to="/signup"
            className="flex-shrink-0 bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-xl hover:shadow-white/10 hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
