// frontend/pages/index.jsx
import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [mode, setMode] = useState("signin"); // or signup
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const API = "http://localhost:4000";

  async function handleSignup(e) {
  e.preventDefault();
  const body = { username, email, password, role: "patient" };
  const res = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();

  if (res.status === 201) {
    // **Automatic login after signup**
    const loginRes = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.token) {
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("role", loginData.role);
      localStorage.setItem("username", username); // <--- **store username**
      router.push("/patient"); // Direct redirect
    } else {
      alert(loginData.error || "Login failed after signup");
    }
  } else {
    alert(data.error || JSON.stringify(data));
  }
}



  async function handleSignin(e) {
    e.preventDefault();
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username || "Patient"); // <--- store username from backend
      if (data.role === "patient") router.push("/patient");
      else if (data.role === "doctor") router.push("/doctor");
    } else {
      alert(data.error || "Login failed");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, border: "1px solid #eee", borderRadius: 8 }}>
      <h1>MEDPILOT</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setMode("signin")} disabled={mode === "signin"}>Sign In</button>
        <button onClick={() => setMode("signup")} disabled={mode === "signup"} style={{ marginLeft: 8 }}>Sign Up</button>
      </div>

      {mode === "signup" ? (
        <form onSubmit={handleSignup}>
          <div>
            <label>Username</label><br/>
            <input required value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label>Email</label><br/>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Password</label><br/>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {/* Role removed from frontend — always patient */}
          <button type="submit" style={{ marginTop: 12 }}>Sign Up</button>
        </form>
      ) : (
        <form onSubmit={handleSignin}>
          <div>
            <label>Email</label><br/>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Password</label><br/>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" style={{ marginTop: 12 }}>Sign In</button>
        </form>
      )}
    </div>
  );
}
