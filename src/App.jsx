import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import NetworkBanner from "./components/NetworkBanner";
import ReporteForm from "./components/ReporteForm";
import ReportesList from "./components/ReportesList";
import { getReportes } from "./utils/storage";
import { useNetworkStatus } from "./utils/networkStatus";
import { syncReportes } from "./utils/syncService";

function App() {
  const isOnline = useNetworkStatus();
  // Carga inicial sincrónica desde localStorage
  const [reportes, setReportes] = useState(() => getReportes());
  const [activeTab, setActiveTab] = useState("form"); // 'form' | 'list'
  const [syncStatus, setSyncStatus] = useState(null); // null | 'syncing' | 'success' | 'error'

  const handleSync = useCallback(async () => {
    setSyncStatus("syncing");
    try {
      const result = await syncReportes();
      setReportes(getReportes());
      if (result.synced > 0) {
        setSyncStatus("success");
      } else if (result.failed > 0) {
        setSyncStatus("error");
      } else {
        setSyncStatus(null);
      }
    } catch {
      setSyncStatus("error");
    }
    // Limpiar el status después de 3 segundos
    setTimeout(() => setSyncStatus(null), 3000);
  }, []);

  // Auto-sync cuando se recupera la conexión a internet
  useEffect(() => {
    const onOnline = () => {
      console.log("[App] Conexión recuperada, sincronizando reportes pendientes...");
      handleSync();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [handleSync]);

  // Verificar si hay reportes pendientes al detectar conexión
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        const tienePendientes = getReportes().some((r) => !r.sincronizado);
        if (tienePendientes) {
          handleSync();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, handleSync]);

  // Escuchar evento de sync del Service Worker
  useEffect(() => {
    const handler = () => handleSync();
    window.addEventListener("sync-reportes", handler);
    return () => window.removeEventListener("sync-reportes", handler);
  }, [handleSync]);

  const handleReporteSaved = () => {
    setReportes(getReportes());
    setActiveTab("list");
  };

  const pendingCount = reportes.filter((r) => !r.sincronizado).length;

  return (
    <div className="min-h-screen bg-white text-white font-['Inter',sans-serif]">
      {/* Banner de estado de red */}
      <NetworkBanner
        isOnline={isOnline}
        syncStatus={syncStatus}
        pendingCount={pendingCount}
      />

      {/* Header */}
      <Header
        pendingCount={pendingCount}
        onSync={handleSync}
        isOnline={isOnline}
        syncStatus={syncStatus}
      />

      {/* Tabs de navegación */}
      <nav className="sticky top-0 z-30 bg-gray-400 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-2xl mx-auto flex">
          <button
            id="tab-form"
            onClick={() => setActiveTab("form")}
            className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-300 relative ${
              activeTab === "form"
                ? "text-red-700"
                : "text-black hover:text-slate-500"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nuevo Reporte
            </span>
            {activeTab === "form" && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-red-500 to-red-500 rounded-full" />
            )}
          </button>
          <button
            id="tab-list"
            onClick={() => setActiveTab("list")}
            className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-300 relative ${
              activeTab === "list"
                ? "text-red-700"
                : "text-black hover:text-slate-500"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6"
                />
              </svg>
              Historial
              {reportes.length > 0 && (
                <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  {reportes.length}
                </span>
              )}
            </span>
            {activeTab === "list" && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-red-500 to-red-500 rounded-full" />
            )}
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main
        className={`max-w-2xl mx-auto px-4 ${
          activeTab === "form" ? "py-4 pb-4" : "py-6 pb-24"
        }`}
      >
        {activeTab === "form" ? (
          <ReporteForm onSaved={handleReporteSaved} isOnline={isOnline} />
        ) : (
          <ReportesList
            reportes={reportes}
            onUpdate={() => setReportes(getReportes())}
          />
        )}
      </main>
    </div>
  );
}

export default App;
