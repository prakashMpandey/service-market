export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-900 rounded-full" />
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{text}</p>
    </div>
  );
}
