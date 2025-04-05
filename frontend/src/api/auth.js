// import axios from 'axios';

export const signup = async (userData) => {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      credentials: "include",
    });
  
    if (!res.ok) throw new Error("Signup failed");
    return res.json();
  };
  
  export const login = async (userData) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      credentials: "include",
    });
  
    if (!res.ok) throw new Error("Invalid credentials");
    return res.json();
  };
  
  export const getProfile = async () => {
    const res = await fetch("http://localhost:5000/api/auth/profile", {
      method: "GET",
      credentials: "include",
    });
  
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  };
  
  export const logout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  };
  
  export const isAuthenticated = () => {
    return document.cookie.includes("authToken");
  };
  