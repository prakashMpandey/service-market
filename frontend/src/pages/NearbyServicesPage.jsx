import { useEffect, useState, useRef, useCallback } from 'react';
import client from '../api/client';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function NearbyServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [radius, setRadius] = useState(10);
  const [coords, setCoords] = useState(null);
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [search]);

  function getLocation() {
    setLocError('');
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocError('Could not determine your location. Please allow location access.')
    );
  }

  const nearbyServices = useCallback(async () => {
    if (!coords) return;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    const params = { lat: coords.lat, lng: coords.lng, radius };
    if (debouncedSearch) params.search = debouncedSearch;

    try {
      const { data } = await client.get('/services/nearby/', {
        params,
        signal: abortControllerRef.current.signal,
      });
      setServices(data.results ?? data);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        // Only handle non-cancellation errors
      }
    } finally {
      setLoading(false);
    }
  }, [coords, radius, debouncedSearch]);

  useEffect(() => {
    nearbyServices();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [nearbyServices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Nearby Services</h1>
          <p className="text-gray-500 dark:text-gray-400">Find trusted service providers close to you</p>
        </div>
        {coords && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Location enabled
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-32">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Radius
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={50}
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">km</span>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Search
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            onClick={getLocation}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary-500/30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Use my location
          </button>
        </div>
      </div>

      {/* Error */}
      {locError && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{locError}</span>
        </div>
      )}

      {/* No Location State */}
      {!coords && !loading && (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enable Location</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Click the button above to find services near your current location
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSpinner text="Finding nearby services..." />}

      {/* No Results */}
      {!loading && coords && services.length === 0 && (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No services found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            No services found within {radius} km. Try increasing the radius.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && services.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Found <span className="font-semibold text-gray-900 dark:text-white">{services.length}</span> services near you
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
