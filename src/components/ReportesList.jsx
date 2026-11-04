// ============================================================
// ReportesList - Lista de reportes guardados con sus estados
// ============================================================

import { deleteReporte } from "../utils/storage";

export default function ReportesList({ reportes, onUpdate }) {
  if (reportes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in">
        <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6m-6 4h6m-6 4h6"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-400 mb-1">
          Sin reportes aún
        </h3>
        <p className="text-sm text-slate-600">
          Los reportes que captures aparecerán aquí
        </p>
      </div>
    );
  }

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este reporte?")) {
      deleteReporte(id);
      onUpdate();
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPrioridadBadge = (prioridad) => {
    const styles = {
      baja: "bg-emerald-400/10 text-emerald-400",
      media: "bg-amber-400/10 text-amber-400",
      alta: "bg-red-400/10 text-red-400",
    };
    return styles[prioridad] || styles.media;
  };

  const pendientes = reportes.filter((r) => !r.sincronizado);
  const sincronizados = reportes.filter((r) => r.sincronizado);

  return (
    <div className="space-y-6 animate-in">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Total"
          value={reportes.length}
          color="text-indigo-400 bg-indigo-400/10"
        />
        <StatCard
          label="Pendientes"
          value={pendientes.length}
          color="text-amber-400 bg-amber-400/10"
        />
        <StatCard
          label="Sincronizados"
          value={sincronizados.length}
          color="text-emerald-400 bg-emerald-400/10"
        />
      </div>

      {/* Lista de reportes */}
      <div className="space-y-3">
        {[...reportes].reverse().map((reporte) => (
          <div
            key={reporte.id}
            className="bg-gray-300 border border-slate-800/50 rounded-xl p-4 hover:bg-slate-800/30 transition-all duration-200 group"
          >
            {/* Header del reporte */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-black truncate">
                    {reporte.cliente}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getPrioridadBadge(reporte.prioridad)}`}
                  >
                    {reporte.prioridad}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {reporte.direccion}
                </p>
              </div>

              {/* Estado de sync */}
              <div className="flex items-center gap-1.5 ml-3">
                {reporte.sincronizado ? (
                  <span
                    className="flex items-center gap-1 text-emerald-400"
                    title="Sincronizado"
                  >
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-1 text-amber-400"
                    title="Pendiente de sincronizar"
                  >
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                )}
                <button
                  onClick={() => handleDelete(reporte.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                  title="Eliminar reporte"
                >
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Detalles */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
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
                  </svg>
                  {reporte.tipoServicio}
                </span>
                {reporte.equipo && (
                  <span className="flex items-center gap-1 truncate">
                    <svg
                      className="w-3 h-3 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {reporte.equipo}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">
                {reporte.descripcion}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                <span className="text-[10px] text-slate-600 font-medium">
                  👤 {reporte.tecnico}
                </span>
                <span className="text-[10px] text-slate-600">
                  {formatDate(reporte.fechaCreacion)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`${color} rounded-xl p-3 text-center`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
        {label}
      </p>
    </div>
  );
}
