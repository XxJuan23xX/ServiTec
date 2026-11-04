// ============================================================
// Header - Barra superior con logo y botón de sync
// ============================================================

export default function Header({ pendingCount, onSync, isOnline, syncStatus }) {
  return (
    <header className="relative overflow-hidden bg-gray-300 border-b border-slate-800/50">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full px-4 py-5">
        <div className="flex items-center justify-between">
          {/* Logo y nombre */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-black">
                ServiTec
              </h1>
              <p className="text-xs text-black font-medium">
                Reportes de Campo
              </p>
            </div>
          </div>

          {/* Botón de sincronización */}
          <button
            id="btn-sync"
            onClick={onSync}
            disabled={!isOnline || syncStatus === "syncing"}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
              ${
                isOnline
                  ? "bg-red-600 text-black hover:bg-red-500/25 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95"
                  : "bg-red-800/50 text-slate-600 cursor-not-allowed"
              }`}
          >
            <svg
              className={`w-4 h-4 ${syncStatus === "syncing" ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">Sincronizar</span>
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-slate-900 text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
