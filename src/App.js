import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { jwtDecode } from "jwt-decode";
import { login, logout, register, isAuthenticated, getToken } from "./services/authService";

const API_URL = "http://localhost:3001/cars"; // Оставил порт 3001

function App() {
  const [cars, setCars] = useState([]);
  const [newCar, setNewCar] = useState({ brand: "", model: "", year: "", price: "" });
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "" });
  const [searchBrand, setSearchBrand] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    fetchCars();
    checkAuth();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setCars(data);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    }
  };

  const checkAuth = () => {
    if (isAuthenticated()) {
      const token = getToken();
      const decoded = jwtDecode(token);
      setUser({ username: decoded.username, role: decoded.role });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(loginData.username, loginData.password);
      setUser({ username: data.username, role: data.role });
      setShowLoginModal(false); // Закрываем модальное окно после успешного входа
      checkAuth();
    } catch (error) {
      alert("Ошибка авторизации");
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(registerData.username, registerData.password);
      alert("Регистрация успешна! Теперь войдите.");
      setShowRegisterModal(false); // Закрываем модальное окно после успешной регистрации
      setRegisterData({ username: "", password: "" });
    } catch (error) {
      alert("Ошибка регистрации");
    }
  };

  const addCar = async (e) => {
    e.preventDefault();
    if (!newCar.brand || !newCar.model || !newCar.year || !newCar.price) {
      alert("Заполните все поля!");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(newCar),
      });
      const data = await res.json();
      setCars([...cars, data]);
      setNewCar({ brand: "", model: "", year: "", price: "" });
    } catch (error) {
      console.error("Ошибка добавления:", error);
    }
  };

  const deleteCar = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить?")) return;
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCars(cars.filter((car) => car._id !== id));
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
  };

  const editCar = async (id) => {
    const newBrand = prompt("Введите новую марку:");
    const newModel = prompt("Введите новую модель:");
    const newYear = prompt("Введите новый год:");
    const newPrice = prompt("Введите новую цену:");
    if (!newBrand || !newModel || !newYear || !newPrice) {
      alert("Заполните все поля!");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ brand: newBrand, model: newModel, year: newYear, price: newPrice }),
      });
      const updatedCar = await res.json();
      setCars(cars.map((car) => (car._id === id ? updatedCar : car)));
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:3001/users/profile", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Ошибка при получении профиля:", error);
      alert("Ошибка при получении профиля");
    }
  };

  const updateProfile = async (username) => {
    try {
      const res = await fetch("http://localhost:3001/users/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      alert("Ошибка при обновлении профиля");
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const res = await fetch("http://localhost:3001/users/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Ошибка при обновлении пароля:", error);
      alert("Ошибка при обновлении пароля");
    }
  };

  const searchCarsByBrand = async () => {
    try {
      const res = await fetch(`http://localhost:3001/cars/brand/${searchBrand}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Ошибка при поиске машин по марке:", error);
      alert("Ошибка при поиске машин по марке");
    }
  };

  return (
    <div className="container mt-5" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "20px" }}>
      {/* Навигационная панель */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">Автомобильный салон</a>
          <div className="d-flex">
            {user ? (
              <>
                <span className="navbar-text me-3">Вы вошли как: {user.username} ({user.role})</span>
                <button className="btn btn-danger me-2" onClick={handleLogout}>Выйти</button>
                <button 
                  className="btn btn-info me-2" 
                  onClick={async () => {
                    const profile = await fetchProfile();
                    alert(`Профиль: ${JSON.stringify(profile, null, 2)}`);
                  }}
                >
                  Профиль
                </button>
                <button 
                  className="btn btn-warning me-2" 
                  onClick={async () => {
                    const newUsername = prompt("Введите новое имя пользователя:");
                    if (newUsername) {
                      await updateProfile(newUsername);
                      alert("Имя пользователя обновлено!");
                    } else {
                      alert("Необходимо указать имя пользователя");
                    }
                  }}
                >
                  Изменить имя
                </button>
                <button 
                  className="btn btn-warning" 
                  onClick={async () => {
                    const newPassword = prompt("Введите новый пароль:");
                    if (newPassword) {
                      await updatePassword(newPassword);
                      alert("Пароль успешно обновлен!");
                    } else {
                      alert("Необходимо указать новый пароль");
                    }
                  }}
                >
                  Изменить пароль
                </button>
                {user?.role === "admin" && (
                <button 
                  className="btn btn-success me-2" 
                  onClick={() => {
                    const username = prompt("Введите логин:");
                    const password = prompt("Введите пароль:");
                    const role = prompt("Введите роль (admin/user):");

                    if (!username || !password || !role) {
                      alert("Заполните все поля!");
                      return;
                    }

                    fetch("http://localhost:3001/admin/create-user", {
                      method: "POST",
                      headers: { 
                        "Content-Type": "application/json", 
                        Authorization: `Bearer ${getToken()}` 
                      },
                      body: JSON.stringify({ username, password, role }),
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        alert(data.message);
                      })
                      .catch((error) => {
                        console.error("Ошибка создания пользователя:", error);
                        alert("Ошибка создания пользователя");
                      });
                  }}
                >
                  Создать Аккаунт
                </button>
              )}
              </>
            ) : (
              <>
                <button className="btn btn-primary me-2" onClick={() => setShowLoginModal(true)}>Войти</button>
                <button className="btn btn-success" onClick={() => setShowRegisterModal(true)}>Зарегистрироваться</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Модальное окно для входа */}
      <div className={`modal ${showLoginModal ? "show d-block" : "d-none"}`} tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Вход</h5>
              <button type="button" className="btn-close" onClick={() => setShowLoginModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <input type="text" className="form-control" placeholder="Логин" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <input type="password" className="form-control" placeholder="Пароль" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary">Войти</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для регистрации */}
      <div className={`modal ${showRegisterModal ? "show d-block" : "d-none"}`} tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Регистрация</h5>
              <button type="button" className="btn-close" onClick={() => setShowRegisterModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <input type="text" className="form-control" placeholder="Логин" value={registerData.username} onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <input type="password" className="form-control" placeholder="Пароль" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-success">Зарегистрироваться</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Поиск машин по марке */}
      <div className="card mb-4">
        <div className="card-body">
          <h4 className="card-title">Поиск машин по марке</h4>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Введите марку машины"
              value={searchBrand}
              onChange={(e) => setSearchBrand(e.target.value)}
            />
            <button className="btn btn-primary" onClick={searchCarsByBrand}>
              Найти
            </button>
          </div>
        </div>
      </div>

      {/* Результаты поиска */}
      {searchResults.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <h4 className="card-title">Результаты поиска:</h4>
            <div className="row">
              {searchResults.map((car) => (
                <div key={car._id} className="col-md-4 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">{car.brand} {car.model}</h5>
                      <p className="card-text">Год: {car.year}</p>
                      <p className="card-text">Цена: ${car.price}</p>
                      {user?.role === "admin" && (
                        <div>
                          <button className="btn btn-warning btn-sm me-2" onClick={() => editCar(car._id)}>Редактировать</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteCar(car._id)}>Удалить</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Форма добавления машины (для админа) */}
      {user?.role === "admin" && (
        <div className="card mb-4">
          <div className="card-body">
            <h4 className="card-title">Добавить новую машину</h4>
            <form onSubmit={addCar}>
              <div className="mb-3">
                <input type="text" className="form-control" placeholder="Марка" value={newCar.brand} onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })} required />
              </div>
              <div className="mb-3">
                <input type="text" className="form-control" placeholder="Модель" value={newCar.model} onChange={(e) => setNewCar({ ...newCar, model: e.target.value })} required />
              </div>
              <div className="mb-3">
                <input type="number" className="form-control" placeholder="Год" value={newCar.year} onChange={(e) => setNewCar({ ...newCar, year: e.target.value })} required />
              </div>
              <div className="mb-3">
                <input type="number" className="form-control" placeholder="Цена" value={newCar.price} onChange={(e) => setNewCar({ ...newCar, price: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary">Добавить</button>
            </form>
          </div>
        </div>
      )}

      {/* Список всех машин */}
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Список машин</h4>
          <div className="row">
            {cars.map((car) => (
              <div key={car._id} className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{car.brand} {car.model}</h5>
                    <p className="card-text">Год: {car.year}</p>
                    <p className="card-text">Цена: ${car.price}</p>
                    {user?.role === "admin" && (
                      <div>
                        <button className="btn btn-warning btn-sm me-2" onClick={() => editCar(car._id)}>Редактировать</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteCar(car._id)}>Удалить</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;