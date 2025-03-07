import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "../styles/auth.css";

const Auth = () => {
  const clientID =
    "993116266161-4qmie3t78gqii4hl3fvl6iu23tc9psks.apps.googleusercontent.com";
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleMode = () => {
    setError("");
    setForm({ email: "", password: "", username: "" });
    setIsLogin(!isLogin);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/login" : "/register";
    try {
      const response = await fetch(
        `https://dfec-177-53-215-61.ngrok-free.app${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || "Error en la autenticación");
        return;
      }
      console.log("Nombre recibido:", data.name);
      localStorage.setItem("username", data.name || "Usuario");
      navigate("/app/dashboard");
    } catch (err) {
      setError("Error de conexión");
    }
  };

  const onGoogleSuccess = (response) => {
    const userInfo = jwtDecode(response.credential); // Decodificamos el token JWT
    console.log("Login Exitoso:", userInfo);
    const username = userInfo.name; // El nombre completo del usuario
    localStorage.setItem("username", username); // Guardamos el nombre en localStorage
    navigate("/app/dashboard");
  };

  const onGoogleFailure = (response) => {
    console.log("Error en Google Login:", response);
    setError("Error al iniciar sesión con Google");
  };

  return (
    <GoogleOAuthProvider clientId={clientID}>
      <div className="Cuerpo">
        <div className="auth-container">
          <div className="auth-box">
            <div className="auth-header">
              <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
              <button className="toggle-btn" onClick={toggleMode}>
                {isLogin
                  ? "¿No tienes cuenta? Regístrate"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="input-group">
                  <label htmlFor="username">Nombre de Usuario</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              <div className="input-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="submit-btn">
                {isLogin ? "Iniciar Sesión" : "Registrarse"}
              </button>
            </form>

            <div className="google-login">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onFailure={onGoogleFailure}
              />
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Auth;
