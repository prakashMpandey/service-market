import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('price__gt') || '';
  const maxPrice = searchParams.get('price__lt') || '';
  const ordering = searchParams.get('ordering') || '';

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  }

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (minPrice) params.price__gt = minPrice;
    if (maxPrice) params.price__lt = maxPrice;
    if (ordering) params.ordering = ordering;

    client.get('/services/', { params })
      .then(({ data }) => setServices(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, minPrice, maxPrice, ordering]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Browse Services</h1>

      {/* Filters bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search</label>
          <input
            value={search}
            onChange={(e) => setParam('search', e.target.value)}
            placeholder="Title, category…"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="w-40">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Min price (₹)</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setParam('price__gt', e.target.value)}
            placeholder="0"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="w-40">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max price (₹)</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setParam('price__lt', e.target.value)}
            placeholder="Any"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="w-36">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sort by</label>
          <select
            value={ordering}
            onChange={(e) => setParam('ordering', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Default</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : services.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-16">No services found</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{services.length} services found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
