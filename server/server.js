// ============================================================
// Backend API - ServiTec
// Servidor Express básico para recibir y almacenar reportes
// ============================================================

import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Almacenamiento en archivo JSON (simula una BD) ─────────
const DATA_DIR = join(__dirname, 'data');
const DB_FILE = join(DATA_DIR, 'reportes.json');

// Crear directorio de datos si no existe
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

function readDB() {
  try {
    if (existsSync(DB_FILE)) {
      return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('[DB] Error al leer base de datos:', error);
  }
  return [];
}

function writeDB(data) {
  try {
    writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('[DB] Error al escribir base de datos:', error);
  }
}

// ── Rutas de la API ────────────────────────────────────────

// GET /api/reportes - Obtener todos los reportes
app.get('/api/reportes', (req, res) => {
  const reportes = readDB();
  console.log(`[API] GET /api/reportes → ${reportes.length} reportes`);
  res.json({
    success: true,
    data: reportes,
    total: reportes.length,
  });
});

// GET /api/reportes/:id - Obtener un reporte por ID
app.get('/api/reportes/:id', (req, res) => {
  const reportes = readDB();
  const reporte = reportes.find((r) => r.id === req.params.id);

  if (!reporte) {
    return res.status(404).json({
      success: false,
      error: 'Reporte no encontrado',
    });
  }

  console.log(`[API] GET /api/reportes/${req.params.id} → encontrado`);
  res.json({ success: true, data: reporte });
});

// POST /api/reportes - Crear un nuevo reporte o sincronizar en lote
app.post('/api/reportes', (req, res) => {
  const reportes = readDB();
  const now = new Date().toISOString();

  // Caso 1: Sincronización en lote (array de reportes)
  if (Array.isArray(req.body)) {
    const lote = req.body;
    const procesados = [];

    for (const item of lote) {
      const idx = reportes.findIndex((r) => r.id === item.id);
      const reporteAGuardar = {
        ...item,
        sincronizado: true,
        serverReceivedAt: now,
        serverId: item.serverId || randomUUID(),
      };

      if (idx !== -1) {
        reportes[idx] = reporteAGuardar; // Actualiza si ya existía
      } else {
        reportes.push(reporteAGuardar);
      }
      procesados.push(reporteAGuardar);
    }

    writeDB(reportes);
    console.log(`[API] POST /api/reportes (LOTE) → ${procesados.length} reportes sincronizados exitosamente`);

    return res.status(201).json({
      success: true,
      data: procesados,
      total: procesados.length,
      message: `${procesados.length} reportes sincronizados correctamente`,
    });
  }

  // Caso 2: Reporte individual
  const item = req.body;
  const idx = reportes.findIndex((r) => r.id === item.id);
  const nuevoReporte = {
    ...item,
    sincronizado: true,
    serverReceivedAt: now,
    serverId: item.serverId || randomUUID(),
  };

  if (idx !== -1) {
    reportes[idx] = nuevoReporte;
  } else {
    reportes.push(nuevoReporte);
  }

  writeDB(reportes);

  console.log(`[API] POST /api/reportes → Reporte sincronizado individual: ${nuevoReporte.id}`);
  console.log(`       Cliente: ${nuevoReporte.cliente}`);
  console.log(`       Técnico: ${nuevoReporte.tecnico}`);
  console.log(`       Tipo:    ${nuevoReporte.tipoServicio}`);

  res.status(201).json({
    success: true,
    data: nuevoReporte,
    message: 'Reporte almacenado correctamente',
  });
});

// DELETE /api/reportes/:id - Eliminar un reporte
app.delete('/api/reportes/:id', (req, res) => {
  let reportes = readDB();
  const index = reportes.findIndex((r) => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Reporte no encontrado',
    });
  }

  reportes.splice(index, 1);
  writeDB(reportes);

  console.log(`[API] DELETE /api/reportes/${req.params.id} → eliminado`);
  res.json({ success: true, message: 'Reporte eliminado' });
});

// GET /api/health - Endpoint de salud para verificar conectividad
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Iniciar servidor ───────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔════════════════════════════════════════════╗');
  console.log('  ║        🔧 ServiTec API - Backend          ║');
  console.log('  ╠════════════════════════════════════════════╣');
  console.log(`  ║  🚀 Servidor en: http://localhost:${PORT}     ║`);
  console.log('  ║  📡 API base:    /api/reportes            ║');
  console.log('  ║  💚 Health:      /api/health              ║');
  console.log('  ╚════════════════════════════════════════════╝');
  console.log('');
});
