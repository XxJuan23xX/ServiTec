// ============================================================
// ReporteForm - Formulario para capturar reportes de servicio
// ============================================================

import { useState } from "react";
import { saveReporte } from "../utils/storage";
import { syncSingleReporte } from "../utils/syncService";

const TIPOS_SERVICIO = [
  "Instalación",
  "Mantenimiento preventivo",
  "Mantenimiento correctivo",
  "Reparación",
  "Inspección",
  "Diagnóstico",
];

const PRIORIDADES = [
  { value: "baja", label: "Baja", color: "text-emerald-400 bg-emerald-400/10" },
  { value: "media", label: "Media", color: "text-amber-400 bg-amber-400/10" },
  { value: "alta", label: "Alta", color: "text-red-400 bg-red-400/10" },
];

const initialForm = {
  cliente: "",
  direccion: "",
  tipoServicio: "",
  prioridad: "media",
  equipo: "",
  descripcion: "",
  observaciones: "",
  tecnico: "",
};

export default function ReporteForm({ onSaved, isOnline }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [syncedDirectly, setSyncedDirectly] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.cliente.trim())
      newErrors.cliente = "El nombre del cliente es requerido";
    if (!form.direccion.trim())
      newErrors.direccion = "La dirección es requerida";
    if (!form.tipoServicio)
      newErrors.tipoServicio = "Selecciona un tipo de servicio";
    if (!form.descripcion.trim())
      newErrors.descripcion = "La descripción es requerida";
    if (!form.tecnico.trim())
      newErrors.tecnico = "El nombre del técnico es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      // 1. Guardar primero en localStorage (garantía offline)
      const guardado = saveReporte(form);
      let sincronizado = false;

      // 2. Si hay conexión online, enviar de inmediato al backend
      if (isOnline) {
        sincronizado = await syncSingleReporte(guardado);
      }

      setSyncedDirectly(sincronizado);
      setShowSuccess(true);
      setForm(initialForm);
      setTimeout(() => {
        setShowSuccess(false);
        onSaved();
      }, 1200);
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setSaving(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-in text-center">
        <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mb-3">
          <svg
            className="w-8 h-8 text-emerald-500"
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
        </div>
        <h3 className="text-lg font-bold text-black mb-1">
          {syncedDirectly
            ? "¡Reporte guardado y sincronizado!"
            : "¡Reporte guardado localmente!"}
        </h3>
        <p className="text-xs text-gray-600 max-w-xs">
          {syncedDirectly
            ? "El reporte se envió con éxito al servidor central."
            : "Guardado como pendiente. Se enviará en cuanto te conectes a WiFi."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 animate-in"
      id="reporte-form"
    >
      {/* Indicador de modo offline */}
      {!isOnline && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-xs text-amber-500 font-medium">
            Modo offline — El reporte se guardará localmente
          </span>
        </div>
      )}

      {/* Información del técnico y cliente */}
      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-wider text-black font-semibold mb-2.5 flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Información del técnico y cliente
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            id="input-tecnico"
            label="Nombre del técnico"
            name="tecnico"
            value={form.tecnico}
            onChange={handleChange}
            error={errors.tecnico}
            placeholder="Ej: Juan Pérez García"
          />
          <InputField
            id="input-cliente"
            label="Nombre del cliente"
            name="cliente"
            value={form.cliente}
            onChange={handleChange}
            error={errors.cliente}
            placeholder="Ej: Rancho El Porvenir"
          />
          <InputField
            id="input-direccion"
            label="Dirección / Ubicación"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            error={errors.direccion}
            placeholder="Ej: Km 45 carretera a Huimanguillo"
          />
          <InputField
            id="input-equipo"
            label="Equipo / Modelo"
            name="equipo"
            value={form.equipo}
            onChange={handleChange}
            placeholder="Ej: Bomba centrífuga Modelo XR-500"
          />
        </div>
      </fieldset>

      {/* Detalles del servicio */}
      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-wider text-black font-semibold mb-2.5 flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5"
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
          Detalles del servicio
        </legend>

        <div className="grid grid-cols-2 gap-4">
          {/* Tipo de servicio */}
          <div>
            <label
              htmlFor="input-tipo-servicio"
              className="block text-sm font-medium text-black mb-1.5"
            >
              Tipo de servicio
            </label>
            <select
              id="input-tipo-servicio"
              name="tipoServicio"
              value={form.tipoServicio}
              onChange={handleChange}
              className={`w-full bg-gray-300 border ${
                errors.tipoServicio
                  ? "border-red-500/50"
                  : "border-slate-700/50"
              } rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all appearance-none`}
            >
              <option value="">Seleccionar tipo...</option>
              {TIPOS_SERVICIO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            {errors.tipoServicio && (
              <p className="mt-1 text-xs text-red-500">{errors.tipoServicio}</p>
            )}
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-black mb-1.5">
              Prioridad
            </label>
            <div className="flex gap-1.5">
              {PRIORIDADES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  id={`btn-prioridad-${p.value}`}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, prioridad: p.value }))
                  }
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 text-center
                    ${
                      form.prioridad === p.value
                        ? `${p.color} ring-1 ring-current scale-[1.02]`
                        : "bg-slate-800/30 text-slate-500 hover:bg-slate-800/50"
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción del trabajo */}
          <div>
            <label
              htmlFor="input-descripcion"
              className="block text-sm font-medium text-black mb-1.5"
            >
              Descripción del trabajo
            </label>
            <textarea
              id="input-descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={2}
              placeholder="Describe el trabajo realizado, hallazgos y acciones tomadas..."
              className={`w-full bg-gray-300 border ${
                errors.descripcion ? "border-red-500/50" : "border-slate-700/50"
              } rounded-xl px-4 py-2.5 text-sm text-black placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all resize-none`}
            />
            {errors.descripcion && (
              <p className="mt-1 text-xs text-red-500">{errors.descripcion}</p>
            )}
          </div>

          {/* Observaciones adicionales */}
          <div>
            <label
              htmlFor="input-observaciones"
              className="block text-sm font-medium text-black mb-1.5"
            >
              Observaciones adicionales
            </label>
            <textarea
              id="input-observaciones"
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              rows={2}
              placeholder="Observaciones, piezas requeridas, seguimiento..."
              className="w-full bg-gray-300 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-black placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all resize-none"
            />
          </div>
        </div>
      </fieldset>

      {/* Botón de enviar */}
      <button
        type="submit"
        id="btn-submit"
        disabled={saving}
        className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.005] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <span className="relative flex items-center justify-center gap-2">
          {saving ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
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
              Guardando...
            </>
          ) : (
            <>
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
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Guardar Reporte
            </>
          )}
        </span>
      </button>
    </form>
  );
}

// Componente auxiliar de campo de texto
function InputField({ id, label, name, value, onChange, error, placeholder }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-black mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-gray-300 border ${
          error ? "border-red-500/50" : "border-slate-700/50"
        } rounded-xl px-4 py-2.5 text-sm text-black placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
