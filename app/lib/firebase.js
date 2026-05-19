"use client";
import { useState } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../lib/firebase";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function LoginPage() {
  const [msg, setMsg] = useState("");

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setMsg(`أهلاً ${user.displayName}`);
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>تسجيل الدخول</h2>
      <button 
        onClick={handleGoogleLogin}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        تسجيل الدخول بجوجل
      </button>
      <p>{msg}</p>
    </div>
  );
}
