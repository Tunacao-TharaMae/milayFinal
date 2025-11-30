import { useState } from "react";
// import "./App.css";
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");

  // === Regular login ===
  const handleLogin = async () => {
    const api = axios.create({
      baseURL: "http://localhost:4000",
      headers: { "Content-Type": "application/json" },
    });

    try {
      const { data } = await api.post("/login", { username, password });

      if (data.success) {
        localStorage.setItem("fullname", data.fullname);
        setMessage("Login successful!");
        window.location.href = "/dashboard";
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Server error");
    }
  };

  // === Google login ===
  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        setMessage("No Google credentials found");
        return;
      }

      const res = await axios.post("http://localhost:4000/google-login", {
        token: credentialResponse.credential,
      });

      if (res.data.success) {
        localStorage.setItem("fullname", res.data.fullname);
        setMessage("Google login successful!");
        window.location.href = "/dashboard";
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error("Google login error:", err);
      setMessage("Google login failed");
    }
  };

  return (
    <GoogleOAuthProvider clientId="1013393160395-hmro5hd2a8mfv9lri1n0ks2kthtr9jca.apps.googleusercontent.com">
      <div className="login">
        <h2>Register Account</h2>

        {/* Regular login */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select>
            <option value="" disabled selected>Select role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
        </select>
        <br />
        <button onClick={handleLogin}>Login</button>

        <hr />
        {/* Google login option */}
        <h3>Or login with Google</h3>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setMessage("Google login failed")}
        />

        <p>{message}</p>
      </div>
    </GoogleOAuthProvider>
  );
}