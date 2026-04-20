"use client";
import { useEffect, useState } from "react";

export default function PWAInstaller() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [offline, setOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(reg => {
        console.log("SW registered:", reg.scope);
        // Check for background sync support
        if ("sync" in reg) {
          window.addEventListener("online", () => {
            reg.sync.register("sync-milk-logs");
          });
        }
      });
    }

    // Install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setPrompt(e);
    });

    window.addEventListener("appinstalled", () => setInstalled(true));

    // Online/offline detection
    setOffline(!navigator.onLine);
    window.addEventListener("online", () => setOffline(false));
    window.addEventListener("offline", () => setOffline(true));

    // Check pending logs
    checkPending();
  }, []);

  const checkPending = async () => {
    try {
      const req = indexedDB.open("unnayan-offline", 1);
      req.onsuccess = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("pending")) return;
        const tx = db.transaction("pending", "readonly");
        const store = tx.objectStore("pending");
        const count = store.count();
        count.onsuccess = () => setPendingCount(count.result);
      };
    } catch(e) {}
  };

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  };

  if (installed) return null;

  return (
    <>
      {offline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-xs text-center py-1.5 flex items-center justify-center gap-2">
          <span>📵</span>
          <span>অফলাইন মোড — দুধ লগ সংরক্ষিত হবে, অনলাইন হলে সিঙ্ক হবে</span>
          {pendingCount > 0 && <span className="bg-white text-amber-600 px-2 py-0.5 rounded-full font-bold">{pendingCount} pending</span>}
        </div>
      )}
      {prompt && !offline && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl">🌾</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800 text-sm">অ্যাপ ইনস্টল করুন</p>
            <p className="text-gray-500 text-xs">Install UnnayanAI on your phone</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPrompt(null)} className="text-xs text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-50">Later</button>
            <button onClick={install} className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-600">Install</button>
          </div>
        </div>
      )}
    </>
  );
}
