// ============================================================
// Servicio de sincronización con el backend
// Envía reportes pendientes cuando hay conexión
// ============================================================

import { getPendingReportes, markAsSynced, markManyAsSynced } from './storage';

const API_URL = import.meta.env.VITE_API_URL || 'https://servitec-yfwn.onrender.com/api';

let isSyncInProgress = false;

/**
 * Envía un único reporte de inmediato al backend (usado al guardar estando online).
 * @param {Object} reporte - Reporte recién guardado
 * @returns {Promise<boolean>} true si se sincronizó con éxito, false si falló
 */
export async function syncSingleReporte(reporte) {
  try {
    const response = await fetch(`${API_URL}/reportes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reporte),
    });

    if (response.ok) {
      markAsSynced(reporte.id);
      console.log(`[Sync] ✓ Reporte ${reporte.id} sincronizado directamente al guardar`);
      return true;
    }
    console.warn(`[Sync] Servidor devolvió status ${response.status} para reporte ${reporte.id}`);
    return false;
  } catch (error) {
    console.warn(`[Sync] Servidor inaccesible, se mantiene pendiente:`, error.message);
    return false;
  }
}

/**
 * Sincroniza todos los reportes pendientes de forma ultra eficiente (Bulk/Lote).
 * No traba el hilo de ejecución sin importar cuántos reportes haya.
 * @returns {Promise<{synced: number, failed: number}>}
 */
export async function syncReportes() {
  if (isSyncInProgress) {
    console.log('[Sync] Sincronización ya en progreso, llamada ignorada');
    return { synced: 0, failed: 0, alreadyRunning: true };
  }

  const pendientes = getPendingReportes();

  if (pendientes.length === 0) {
    console.log('[Sync] No hay reportes pendientes por sincronizar');
    return { synced: 0, failed: 0 };
  }

  isSyncInProgress = true;
  console.log(`[Sync] Iniciando sincronización de ${pendientes.length} reportes pendientes...`);

  let synced = 0;
  let failed = 0;

  try {
    // ── Estrategia 1: Envío en LOTE (1 sola petición HTTP para todos) ──
    const response = await fetch(`${API_URL}/reportes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pendientes),
    });

    if (response.ok) {
      const ids = pendientes.map((r) => r.id);
      // Escritura única a localStorage para no trabar el navegador
      markManyAsSynced(ids);
      synced = ids.length;
      console.log(`[Sync] ✓ Éxito: ${synced} reportes sincronizados en lote`);
    } else {
      // ── Estrategia 2 (Fallback): Lotes pequeños concurrentes ──
      console.warn('[Sync] Falló envío en lote masivo, procesando por micro-lotes...');
      const batchSize = 10;
      const syncedIds = [];

      for (let i = 0; i < pendientes.length; i += batchSize) {
        const chunk = pendientes.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          chunk.map((item) =>
            fetch(`${API_URL}/reportes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            }).then((res) => {
              if (res.ok) {
                syncedIds.push(item.id);
                return true;
              }
              throw new Error(`HTTP ${res.status}`);
            })
          )
        );

        results.forEach((r) => {
          if (r.status === 'fulfilled') synced++;
          else failed++;
        });
      }

      if (syncedIds.length > 0) {
        markManyAsSynced(syncedIds);
      }
    }
  } catch (error) {
    console.error('[Sync] Error de conexión durante sincronización masiva:', error.message);
    failed = pendientes.length;
  } finally {
    isSyncInProgress = false;
  }

  console.log(`[Sync] Resumen: ${synced} sincronizados, ${failed} pendientes`);
  return { synced, failed };
}
