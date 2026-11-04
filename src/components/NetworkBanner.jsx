// ============================================================
// NetworkBanner - Banner de estado de red fijo en la parte superior
// ============================================================

export default function NetworkBanner({ isOnline, syncStatus, pendingCount }) {
  if (isOnline && !syncStatus) return null;

  const getConfig = () => {
    if (syncStatus === 'syncing') {
      return {
        bg: 'bg-indigo-500/10 border-indigo-500/30',
        icon: (
          <svg className="w-4 h-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        text: 'Sincronizando reportes...',
        textColor: 'text-indigo-300',
      };
    }

    if (syncStatus === 'success') {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        icon: (
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ),
        text: '¡Reportes sincronizados correctamente!',
        textColor: 'text-emerald-300',
      };
    }

    if (syncStatus === 'error') {
      return {
        bg: 'bg-red-500/10 border-red-500/30',
        icon: (
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        text: 'Error al sincronizar. Se reintentará automáticamente.',
        textColor: 'text-red-300',
      };
    }

    // Offline
    return {
      bg: 'bg-amber-500/10 border-amber-500/30',
      icon: (
        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 00-12.728 0M15.536 8.464a5 5 0 00-7.072 0M12 12v.01" />
        </svg>
      ),
      text: `Sin conexión — ${pendingCount} reporte${pendingCount !== 1 ? 's' : ''} guardado${pendingCount !== 1 ? 's' : ''} localmente`,
      textColor: 'text-amber-300',
    };
  };

  const config = getConfig();

  return (
    <div
      id="network-banner"
      className={`${config.bg} border-b px-4 py-2.5 transition-all duration-500 animate-in`}
    >
      <div className="max-w-lg mx-auto flex items-center gap-2.5">
        {config.icon}
        <span className={`text-xs font-medium ${config.textColor}`}>{config.text}</span>
      </div>
    </div>
  );
}
