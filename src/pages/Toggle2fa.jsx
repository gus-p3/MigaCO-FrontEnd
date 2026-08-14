import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

/**
 * Toggle2FA — componente para el tab "Mis datos" del perfil
 * Props:
 *   activo   {boolean} — si el usuario ya tiene 2FA encendido
 *   onUpdate {fn}      — callback cuando cambia el estado
 */
export default function Toggle2FA({ activo = false, onUpdate }) {
  const [habilitado, setHabilitado] = useState(activo);
  const [loading, setLoading]       = useState(false);
  const [msg, setMsg]               = useState('');

  const handleToggle = async () => {
    try {
      setLoading(true);
      setMsg('');
      const res = await api.put('/auth/2fa/toggle', { activar: !habilitado });
      setHabilitado(res.data.dos_factor_activo);
      setMsg(res.data.dos_factor_activo
        ? '✦ Verificación en dos pasos activada'
        : '✦ Verificación en dos pasos desactivada');
      onUpdate?.(res.data.dos_factor_activo);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error al cambiar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="t2fa-wrap">
      <div className="t2fa-info">
        <div className="t2fa-icon">{habilitado ? '🔐' : '🔓'}</div>
        <div>
          <p className="t2fa-label">Verificación en dos pasos</p>
          <p className="t2fa-desc">
            {habilitado
              ? 'Activa — recibirás un código por email al iniciar sesión.'
              : 'Inactiva — solo necesitas tu contraseña para entrar.'}
          </p>
        </div>
        <motion.button
          className={`t2fa-toggle ${habilitado ? 'on' : 'off'}`}
          whileTap={{ scale: 0.93 }}
          onClick={handleToggle}
          disabled={loading}
        >
          <span className="t2fa-knob" />
        </motion.button>
      </div>
      {msg && (
        <p className={`t2fa-msg ${msg.startsWith('✦') ? 'ok' : 'err'}`}>{msg}</p>
      )}

      <style>{`
        .t2fa-wrap {
          padding: 1.1rem 1.2rem;
          background: var(--neutral-bg);
          border-radius: 0.85rem;
          border: 1.5px solid var(--accent);
          display: flex; flex-direction: column; gap: 0.6rem;
        }
        .t2fa-info {
          display: flex; align-items: center; gap: 0.9rem;
        }
        .t2fa-icon { font-size: 1.4rem; flex-shrink: 0; }
        .t2fa-label {
          font-size: 0.7rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--primary);
          font-weight: 700; margin-bottom: 0.2rem;
        }
        .t2fa-desc { font-size: 0.85rem; color: var(--secondary); line-height: 1.4; }
        .t2fa-toggle {
          margin-left: auto; flex-shrink: 0;
          width: 48px; height: 26px; border-radius: 999px;
          border: none; cursor: pointer;
          position: relative;
          transition: background 0.25s;
        }
        .t2fa-toggle.on  { background: var(--primary); }
        .t2fa-toggle.off { background: var(--accent); }
        .t2fa-toggle:disabled { opacity: 0.5; cursor: not-allowed; }
        .t2fa-knob {
          position: absolute; top: 3px;
          width: 20px; height: 20px; border-radius: 50%;
          background: white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.18);
          transition: left 0.25s;
        }
        .t2fa-toggle.on  .t2fa-knob { left: 25px; }
        .t2fa-toggle.off .t2fa-knob { left: 3px;  }
        .t2fa-msg {
          font-size: 0.78rem; border-radius: 6px;
          padding: 0.4rem 0.7rem;
        }
        .t2fa-msg.ok  { background: var(--neutral-light);  color: var(--primary); }
        .t2fa-msg.err { background: #fff0f0;      color: #b94040; }
      `}</style>
    </div>
  );
}