const API_URL = "http://localhost:3001/auth";

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Ошибка входа");
  }

  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data;
};

export const register = async (username, password, role = "user") => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role }),
  });

  if (!res.ok) {
    throw new Error("Ошибка регистрации");
  }

  return await res.json();
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const isAuthenticated = () => {
  return !!getToken();
};
