export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-lg">EL</span>
        </div>
        <div className="text-gray-600 font-medium">Loading Tech Innovation Club...</div>
      </div>
    </div>
  );
} 