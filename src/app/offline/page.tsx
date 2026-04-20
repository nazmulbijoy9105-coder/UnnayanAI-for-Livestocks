export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50">
      <div className="text-center p-8 max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656M9.172 16.172a4 4 0 010-5.656m-3.536 3.536a9 9 0 010-12.728" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">আপনি অফলাইনে আছেন</h1>
        <p className="text-gray-500 mb-2">You are offline</p>
        <p className="text-emerald-600 text-sm mb-6">দুধ লগ করা যাবে — অনলাইন হলে সিঙ্ক হবে</p>
        <p className="text-gray-400 text-sm mb-6">Milk logs saved offline will sync automatically when connected</p>
        <button onClick={() => window.location.href = "/dashboard/farmer"} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold">
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}
