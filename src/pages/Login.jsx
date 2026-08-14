import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Login.css";
import { EyeIcon, EyeSlashIcon } from "../utils/perfilUtils";

export default function Login() {
  const navigate = useNavigate();
  const { login, register, loginWithToken } = useAuth(); // ← usa el contexto

  const [vista, setVista] = useState("auth");
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // 2FA
  const [emailPendiente, setEmailPendiente] = useState("");
  const [codigo2FA, setCodigo2FA] = useState(["", "", "", "", "", ""]);

  // Recuperación
  const [emailRecuperacion, setEmailRecuperacion] = useState("");
  const [codigoRecuperacion, setCodigoRecuperacion] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [resetToken, setResetToken] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const clearMsg = () => {
    setError("");
    setSuccess("");
  };

  // ── Input de 6 dígitos ──────────────────────────────────────────────
const handleDigit = (arr, setArr, idx, val) => {
  // Solo permitir números
  if (!/^\d*$/.test(val)) return;
  
  // Si ya hay un valor y se intenta escribir otro, reemplazarlo
  const next = [...arr];
  next[idx] = val.slice(-1);
  setArr(next);
  
  // Mover al siguiente input SOLO si se ingresó un valor
  if (val && idx < 5) {
    // Usar setTimeout para asegurar que el estado se actualizó
    setTimeout(() => {
      const nextInput = document.getElementById(`digit-${idx + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }, 10);
  }
};

const handleDigitKey = (arr, setArr, idx, e) => {
  // Manejar Backspace
  if (e.key === 'Backspace') {
    e.preventDefault(); // Prevenir comportamiento por defecto
    
    const next = [...arr];
    
    if (arr[idx]) {
      // Si el campo actual tiene valor, borrarlo
      next[idx] = '';
      setArr(next);
    } else if (idx > 0) {
      // Si está vacío, ir al anterior y borrarlo
      next[idx - 1] = '';
      setArr(next);
      
      setTimeout(() => {
        const prevInput = document.getElementById(`digit-${idx - 1}`);
        if (prevInput) {
          prevInput.focus();
        }
      }, 10);
    }
  }
  
  // Manejar flecha izquierda
  if (e.key === 'ArrowLeft' && idx > 0) {
    e.preventDefault();
    setTimeout(() => {
      const prevInput = document.getElementById(`digit-${idx - 1}`);
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }, 10);
  }
  
  // Manejar flecha derecha
  if (e.key === 'ArrowRight' && idx < 5) {
    e.preventDefault();
    setTimeout(() => {
      const nextInput = document.getElementById(`digit-${idx + 1}`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }, 10);
  }
};
  const codigoString = (arr) => arr.join("");

 
  // ── LOGIN / REGISTRO  ────────────────────────
  const handleSubmit = async () => {
    clearMsg();

    // Validaciones específicas para registro
    if (!isLogin) {
      if (!formData.name || formData.name.trim() === "") {
        return setError("El nombre completo es obligatorio");
      }
      if (formData.name.trim().length < 3) {
        return setError("El nombre debe tener al menos 3 caracteres");
      }
    }

    if (!formData.email || formData.email.trim() === "") {
      return setError("El email es obligatorio");
    }

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError("Ingresa un email válido (ejemplo@dominio.com)");
    }

    if (!formData.password) {
      return setError("La contraseña es obligatoria");
    }

    // Validación de contraseña segura (solo para registro)
    if (!isLogin) {
      if (formData.password.length < 6) {
        return setError("La contraseña debe tener al menos 6 caracteres");
      }

      // Verificar mayúsculas
      if (!/[A-Z]/.test(formData.password)) {
        return setError(
          "La contraseña debe incluir al menos una letra mayúscula",
        );
      }

      // Verificar minúsculas
      if (!/[a-z]/.test(formData.password)) {
        return setError(
          "La contraseña debe incluir al menos una letra minúscula",
        );
      }

      // Verificar números
      if (!/[0-9]/.test(formData.password)) {
        return setError("La contraseña debe incluir al menos un número");
      }

      // Verificar caracteres especiales
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        return setError(
          "La contraseña debe incluir al menos un carácter especial (!@#$%^&*)",
        );
      }

      if (!formData.confirmPassword) {
        return setError("Debes confirmar la contraseña");
      }

      if (formData.password !== formData.confirmPassword) {
        return setError("Las contraseñas no coinciden");
      }
    }

    try {
      setLoading(true);

      if (isLogin) {
        // Primero verifica si requiere 2FA antes de usar el contexto
        const res = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        if (res.data.requiere_2fa) {
          setEmailPendiente(res.data.email);
          setVista("2fa");
          return;
        }

        // Sin 2FA: usa el contexto para que se actualice isAuthenticated
        const result = await login(formData.email, formData.password);
        if (result.success) {
          navigate("/", { replace: true });
        } else {
          setError(result.error || "Error al iniciar sesión");
        }
      } else {
        const result = await register({
          nombre: formData.name,
          email: formData.email,
          password: formData.password,
        });

        if (result.success) {
          setSuccess("¡Registro completado! Bienvenido a la familia.");
          setTimeout(() => navigate("/perfil", { replace: true }), 1500);
        } else {
          // Mostrar mensaje específico del error del backend
          const errorMsg = result.error || "Error al registrar usuario";
          if (
            errorMsg.toLowerCase().includes("email") ||
            errorMsg.toLowerCase().includes("correo")
          ) {
            setError("Este email ya está registrado o no es válido");
          } else if (
            errorMsg.toLowerCase().includes("contraseña") ||
            errorMsg.toLowerCase().includes("password")
          ) {
            setError("La contraseña no cumple con los requisitos de seguridad");
          } else if (errorMsg.toLowerCase().includes("nombre")) {
            setError("El nombre ingresado no es válido");
          } else {
            setError(errorMsg);
          }
        }
      }
    } catch (err) {
      // Errores de conexión o del servidor
      const errorMsg = err.response?.data?.error || "Error de conexión";

      if (
        errorMsg.toLowerCase().includes("email") ||
        errorMsg.toLowerCase().includes("correo")
      ) {
        setError("El email ingresado no es válido o ya está registrado");
      } else if (
        errorMsg.toLowerCase().includes("contraseña") ||
        errorMsg.toLowerCase().includes("password")
      ) {
        setError("Credenciales incorrectas. Verifica tu email y contraseña");
      } else if (
        errorMsg.toLowerCase().includes("network") ||
        errorMsg.toLowerCase().includes("conexión")
      ) {
        setError("Error de conexión. Verifica tu internet e intenta de nuevo");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };
  // ── VERIFICAR 2FA — usa loginWithToken ──────────────────────────────
  const handleVerificar2FA = async () => {
    clearMsg();
    const codigo = codigoString(codigo2FA);
    if (codigo.length < 6) return setError("Ingresa el código completo");

    try {
      setLoading(true);
      const res = await api.post("/auth/2fa/verificar", {
        email: emailPendiente,
        codigo,
      });

      await loginWithToken(res.data.token); // ← actualiza el contexto
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Código incorrecto");
      setCodigo2FA(["", "", "", "", "", ""]);
      document.getElementById("digit-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── RECUPERAR: paso 1 ───────────────────────────────────────────────
  const handleSolicitarCodigo = async () => {
    clearMsg();
    if (!emailRecuperacion) return setError("Ingresa tu email");
    try {
      setLoading(true);
      await api.post("/auth/recuperar", { email: emailRecuperacion });
      setSuccess("Si el correo existe, recibirás un código en tu bandeja.");
      setVista("codigo");
    } catch (err) {
      setError(err.response?.data?.error || "Error al enviar el código");
    } finally {
      setLoading(false);
    }
  };

  // ── RECUPERAR: paso 2 ───────────────────────────────────────────────
  const handleVerificarCodigo = async () => {
    clearMsg();
    const codigo = codigoString(codigoRecuperacion);
    if (codigo.length < 6) return setError("Ingresa el código completo");
    try {
      setLoading(true);
      const res = await api.post("/auth/recuperar/verificar", {
        email: emailRecuperacion,
        codigo,
      });
      setResetToken(res.data.reset_token);
      setVista("nueva_pass");
    } catch (err) {
      setError(err.response?.data?.error || "Código incorrecto o expirado");
      setCodigoRecuperacion(["", "", "", "", "", ""]);
      document.getElementById("digit-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── RECUPERAR: paso 3 ───────────────────────────────────────────────
  const handleCambiarPassword = async () => {
    clearMsg();
    if (nuevaPassword.length < 6) return setError("Mínimo 6 caracteres");
    if (nuevaPassword !== confirmarPassword)
      return setError("Las contraseñas no coinciden");
    try {
      setLoading(true);
      await api.post("/auth/recuperar/cambiar", {
        reset_token: resetToken,
        nueva_password: nuevaPassword,
      });
      setSuccess("¡Contraseña actualizada! Inicia sesión.");
      setTimeout(() => {
        setVista("auth");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  };

  // ── Input de 6 dígitos (componente) ────────────────────────────────
 const InputCodigo = ({ arr, setArr, error = false }) => {
  // Manejar pegado de código completo
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData?.getData('text') || '';
    const digits = pastedText.replace(/\D/g, '').slice(0, 6).split('');
    
    if (digits.length > 0) {
      const next = [...arr];
      digits.forEach((digit, i) => {
        if (i < 6) next[i] = digit;
      });
      setArr(next);
      
      // Enfocar el siguiente campo vacío o el último
      setTimeout(() => {
        const nextEmptyIndex = next.findIndex(d => !d);
        if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
          document.getElementById(`digit-${nextEmptyIndex}`)?.focus();
        } else {
          document.getElementById(`digit-5`)?.focus();
        }
      }, 10);
    }
  };

  return (
    <div className="codigo-grid">
      {arr.map((d, i) => (
        <input
          key={i}
          id={`digit-${i}`}
          className={`codigo-input ${error ? 'error' : ''}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleDigit(arr, setArr, i, e.target.value)}
          onKeyDown={(e) => handleDigitKey(arr, setArr, i, e)}
          onPaste={i === 0 ? handlePaste : undefined} // Solo en el primer input
          onFocus={(e) => {
            // No hacer select automático para evitar conflictos
            // Solo posicionar el cursor al final
            const val = e.target.value;
            e.target.setSelectionRange(val.length, val.length);
          }}
          onClick={(e) => {
            // Seleccionar todo al hacer clic
            e.target.select();
          }}
          autoFocus={i === 0}
          aria-label={`Dígito ${i + 1} de 6`}
        />
      ))}
    </div>
  );
};
  return (
    <section className="mc-root">
      <div className="mc-grid">
        {/* Panel izquierdo */}
        <motion.div
          className="mc-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mc-brand">
            <div className="mc-brand-name">
              Miga<em>-Co</em>
            </div>
            <p className="mc-brand-tagline">Pastelería artesanal</p>
          </div>
          <div className="mc-left-body">
            <h2>
              Aquí, el amor
              <br />
              nunca sobra.
            </h2>
            <p>Queremos ser el invitado especial de todas tus celebraciones.</p>
          </div>
          <div className="mc-perks">
            {[
              "Pasteles a medida",
              "Envíos a domicilio",
              "Más de 200 diseños",
            ].map((p) => (
              <div className="mc-perk" key={p}>
                <div className="mc-perk-dot">✦</div>
                <span>{p}</span>
              </div>
            ))}
          </div>
          <img
            className="mc-cake-img"
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80"
            alt="Pastel Miga-Co"
          />
        </motion.div>

        {/* Panel derecho */}
        <motion.div
          className="mc-right"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <AnimatePresence mode="wait">
            {/* Vista: login / registro */}
            {vista === "auth" && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mc-tabs">
                  <button
                    className={`mc-tab ${isLogin ? "active" : ""}`}
                    onClick={() => {
                      setIsLogin(true);
                      clearMsg();
                    }}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    className={`mc-tab ${!isLogin ? "active" : ""}`}
                    onClick={() => {
                      setIsLogin(false);
                      clearMsg();
                    }}
                  >
                    Registrarse
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? "login" : "reg"}
                    className="mc-form-head"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2>
                      {isLogin ? (
                        <>
                          ¡Bienvenido <em>de nuevo</em>!
                        </>
                      ) : (
                        <>
                          Crea tu <em>cuenta</em>
                        </>
                      )}
                    </h2>
                    <p>
                      {isLogin
                        ? "Ingresa tus credenciales para continuar"
                        : "Únete a la familia Miga-Co"}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="mc-fields">
                  {!isLogin && (
                    <div className="mc-field">
                      <label>Nombre completo</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                  <div className="mc-field">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mc-field">
                    <label>Contraseña</label>
                    <div className="mc-field-pw">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        className="mc-pw-toggle"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  {!isLogin && (
                    <div className="mc-field">
                      <label>Confirmar contraseña</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>

                {error && <p className="mc-error">{error}</p>}
                {success && <p className="mc-success">{success}</p>}

                {isLogin && (
                  <div className="mc-forgot-row">
                    <button
                      className="mc-link"
                      onClick={() => {
                        setVista("recuperar");
                        clearMsg();
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                <motion.button
                  className="mc-submit"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? "Procesando..."
                    : isLogin
                      ? "Iniciar sesión"
                      : "Crear cuenta"}
                </motion.button>

                <p className="mc-footer-text">
                  {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                  <button
                    className="mc-link"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      clearMsg();
                    }}
                  >
                    {isLogin ? "Regístrate aquí" : "Inicia sesión"}
                  </button>
                </p>
              </motion.div>
            )}

            {/* Vista: verificar 2FA */}
            {vista === "2fa" && (
              <motion.div
                key="2fa"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mc-centered-view"
              >
                <div className="mc-otp-icon">🔐</div>
                <h2 className="mc-otp-title">
                  Verificación <em>en dos pasos</em>
                </h2>
                <p className="mc-otp-sub">
                  Enviamos un código de 6 dígitos a<br />
                  <strong>{emailPendiente}</strong>
                </p>
                <InputCodigo arr={codigo2FA} setArr={setCodigo2FA} />
                {error && <p className="mc-error">{error}</p>}
                <motion.button
                  className="mc-submit"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleVerificar2FA}
                  disabled={loading}
                >
                  {loading ? "Verificando..." : "Verificar código"}
                </motion.button>
                <button
                  className="mc-link mc-back"
                  onClick={() => {
                    setVista("auth");
                    setCodigo2FA(["", "", "", "", "", ""]);
                    clearMsg();
                  }}
                >
                  ← Volver al inicio de sesión
                </button>
              </motion.div>
            )}

            {/* Vista: solicitar recuperación */}
            {vista === "recuperar" && (
              <motion.div
                key="recuperar"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mc-centered-view"
              >
                <div className="mc-otp-icon">📧</div>
                <h2 className="mc-otp-title">
                  Recuperar <em>contraseña</em>
                </h2>
                <p className="mc-otp-sub">
                  Ingresa tu email y te enviaremos un código para restablecer tu
                  contraseña.
                </p>
                <div className="mc-field" style={{ marginBottom: "1rem" }}>
                  <label>Email registrado</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={emailRecuperacion}
                    onChange={(e) => setEmailRecuperacion(e.target.value)}
                  />
                </div>
                {error && <p className="mc-error">{error}</p>}
                {success && <p className="mc-success">{success}</p>}
                <motion.button
                  className="mc-submit"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSolicitarCodigo}
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar código"}
                </motion.button>
                <button
                  className="mc-link mc-back"
                  onClick={() => {
                    setVista("auth");
                    clearMsg();
                  }}
                >
                  ← Volver al inicio de sesión
                </button>
              </motion.div>
            )}

            {/* Vista: verificar código de recuperación */}
            {vista === "codigo" && (
              <motion.div
                key="codigo"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mc-centered-view"
              >
                <div className="mc-otp-icon">🔑</div>
                <h2 className="mc-otp-title">
                  Ingresa el <em>código</em>
                </h2>
                <p className="mc-otp-sub">
                  Código enviado a <strong>{emailRecuperacion}</strong>.<br />
                  Revisa también tu carpeta de spam.
                </p>
                <InputCodigo
                  arr={codigoRecuperacion}
                  setArr={setCodigoRecuperacion}
                />
                {error && <p className="mc-error">{error}</p>}
                {success && <p className="mc-success">{success}</p>}
                <motion.button
                  className="mc-submit"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleVerificarCodigo}
                  disabled={loading}
                >
                  {loading ? "Verificando..." : "Verificar código"}
                </motion.button>
                <button
                  className="mc-link mc-back"
                  onClick={() => {
                    setVista("recuperar");
                    setCodigoRecuperacion(["", "", "", "", "", ""]);
                    clearMsg();
                  }}
                >
                  ← Reenviar código
                </button>
              </motion.div>
            )}

            {/* Vista: nueva contraseña */}
            {vista === "nueva_pass" && (
              <motion.div
                key="nueva_pass"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="mc-centered-view"
              >
                <div className="mc-otp-icon">🔒</div>
                <h2 className="mc-otp-title">
                  Nueva <em>contraseña</em>
                </h2>
                <p className="mc-otp-sub">
                  Elige una contraseña segura de al menos 6 caracteres.
                </p>
                <div className="mc-fields">
                  <div className="mc-field">
                    <label>Nueva contraseña</label>
                    <div className="mc-field-pw">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={nuevaPassword}
                        onChange={(e) => setNuevaPassword(e.target.value)}
                      />
                      <button
                        className="mc-pw-toggle"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  <div className="mc-field">
                    <label>Confirmar contraseña</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                    />
                  </div>
                </div>
                {error && <p className="mc-error">{error}</p>}
                {success && <p className="mc-success">{success}</p>}
                <motion.button
                  className="mc-submit"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCambiarPassword}
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar nueva contraseña"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
