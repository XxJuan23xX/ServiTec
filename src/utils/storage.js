// ============================================================
// Módulo de almacenamiento local para reportes offline
// Usa localStorage como mecanismo de persistencia
// ============================================================

const STORAGE_KEY = 'servitec_reportes';

/**
 * Obtiene todos los reportes almacenados localmente.
 * @returns {Array} Lista de reportes
 */
export function getReportes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[Storage] Error al leer reportes:', error);
    return [];
  }
}

/**
 * Guarda un nuevo reporte en localStorage.
 * @param {Object} reporte - Datos del reporte
 * @returns {Object} El reporte guardado con id y timestamp
 */
export function saveReporte(reporte) {
  try {
    const reportes = getReportes();
    const nuevoReporte = {
      ...reporte,
      id: crypto.randomUUID(),
      fechaCreacion: new Date().toISOString(),
      sincronizado: false,
    };
    reportes.push(nuevoReporte);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reportes));
    console.log('[Storage] Reporte guardado localmente:', nuevoReporte.id);
    return nuevoReporte;
  } catch (error) {
    console.error('[Storage] Error al guardar reporte:', error);
    throw error;
  }
}

/**
 * Marca un reporte como sincronizado.
 * @param {string} id - ID del reporte
 */
export function markAsSynced(id) {
  try {
    const reportes = getReportes();
    const index = reportes.findIndex((r) => r.id === id);
    if (index !== -1) {
      reportes[index].sincronizado = true;
      reportes[index].fechaSincronizacion = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reportes));
    }
  } catch (error) {
    console.error('[Storage] Error al marcar como sincronizado:', error);
  }
}

/**
 * Marca múltiples reportes como sincronizados en una sola operación de escritura.
 * @param {Array<string>} ids - Array de IDs de los reportes
 */
export function markManyAsSynced(ids) {
  if (!ids || ids.length === 0) return;
  try {
    const reportes = getReportes();
    const idSet = new Set(ids);
    const now = new Date().toISOString();
    let modified = false;

    for (let i = 0; i < reportes.length; i++) {
      if (idSet.has(reportes[i].id)) {
        reportes[i].sincronizado = true;
        reportes[i].fechaSincronizacion = now;
        modified = true;
      }
    }

    if (modified) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reportes));
    }
  } catch (error) {
    console.error('[Storage] Error al marcar múltiples como sincronizados:', error);
  }
}

/**
 * Obtiene los reportes que aún no se han sincronizado.
 * @returns {Array} Lista de reportes pendientes
 */
export function getPendingReportes() {
  return getReportes().filter((r) => !r.sincronizado);
}

/**
 * Elimina un reporte por su ID.
 * @param {string} id - ID del reporte a eliminar
 */
export function deleteReporte(id) {
  try {
    const reportes = getReportes().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reportes));
  } catch (error) {
    console.error('[Storage] Error al eliminar reporte:', error);
  }
}

/**
 * Limpia todos los reportes sincronizados.
 */
export function clearSyncedReportes() {
  try {
    const pendientes = getPendingReportes();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendientes));
  } catch (error) {
    console.error('[Storage] Error al limpiar reportes sincronizados:', error);
  }
}

/**
 * Fusiona reportes remotos con los locales.
 * - Si el ID ya existe localmente y está pendiente → se actualiza a sincronizado.
 * - Si el ID no existe localmente → se agrega como sincronizado.
 * - Reportes locales pendientes sin ID remoto → se conservan intactos.
 * @param {Array} remoteList - Reportes recibidos del backend
 */
export function mergeRemoteReportes(remoteList) {
  if (!Array.isArray(remoteList) || remoteList.length === 0) return;
  try {
    const local = getReportes();
    const localMap = new Map(local.map((r) => [r.id, r]));

    for (const remote of remoteList) {
      if (!remote.id) continue;
      if (localMap.has(remote.id)) {
        // Si existe localmente y aún está pendiente, marcarlo como sincronizado
        const existing = localMap.get(remote.id);
        if (!existing.sincronizado) {
          localMap.set(remote.id, {
            ...existing,
            sincronizado: true,
            fechaSincronizacion: remote.fechaSincronizacion || new Date().toISOString(),
          });
        }
      } else {
        // No existe localmente → agregar con flag sincronizado
        localMap.set(remote.id, { ...remote, sincronizado: true });
      }
    }

    const merged = Array.from(localMap.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    console.log(`[Storage] Merge remoto: ${merged.length} reportes en total`);
  } catch (error) {
    console.error('[Storage] Error al fusionar reportes remotos:', error);
  }
}
