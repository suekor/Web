const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { authenticate, authorizeAdmin } = require('./middleware/auth');
const authRoutes = require("./routes/authRoutes");
const User = require("./models/User");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3001;
const SECRET_KEY = "Kazakh";

app.use(express.json());
app.use(cors());

// Подключение к MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/car_dealership')
    .then(() => {
        console.log('✅ Успешное подключение к MongoDB');
        createAdminIfNotExists(); // Создаём админа при запуске сервера
    })
    .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

// Создаём админа при первом запуске
async function createAdminIfNotExists() {
    const adminExists = await User.findOne({ username: "admin" });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await new User({ username: "admin", password: hashedPassword, role: "admin" }).save();
        console.log("✅ Админ создан: логин admin, пароль admin123");
    }
}

// Подключение маршрутов авторизации
app.use("/auth", authRoutes);

// Определение схемы и модели
const carSchema = new mongoose.Schema({
    brand: String,
    model: String,
    year: Number,
    price: Number,
});

const Car = mongoose.model('Car', carSchema);

// Получение всех машин (доступно всем)
app.get('/cars', async (req, res) => {
    try {
        const cars = await Car.find();
        res.json(cars);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении машин' });
    }
});

// Добавление новой машины (только для админа)
app.post('/cars', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const newCar = new Car(req.body);
        await newCar.save();
        res.json(newCar);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при добавлении машины' });
    }
});

// Маршрут для создания админ-аккаунтов (доступен только админам)
app.post("/admin/create-user", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const { username, password, role } = req.body;
  
      if (!username || !password || !role) {
        return res.status(400).json({ error: "Заполните все поля" });
      }
  
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: "Пользователь уже существует" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword, role });
  
      await newUser.save();
  
      res.status(201).json({ message: "Пользователь успешно создан", user: newUser });
    } catch (error) {
      console.error("Ошибка создания пользователя:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });

// Получение профиля текущего пользователя
app.get("/users/profile", authenticate, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select("-password"); // Исключаем пароль из ответа
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      res.json(user);
    } catch (error) {
      console.error("Ошибка при получении профиля:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  app.put("/users/profile", authenticate, async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Проверяем, что хотя бы одно поле передано
      if (!username && !password) {
        return res.status(400).json({ message: "Необходимо указать username или password" });
      }
  
      // Находим пользователя и обновляем его данные
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
  
      if (username) user.username = username;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
  
      await user.save();
  
      res.json({ message: "Профиль успешно обновлен", user });
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });

// Получение машин по марке (доступно всем)
app.get("/cars/brand/:brand", async (req, res) => {
    try {
      const brand = req.params.brand; // Получаем марку из параметров запроса
      const cars = await Car.find({ brand: new RegExp(brand, "i") }); // Поиск с учетом регистра
      if (cars.length === 0) {
        return res.status(404).json({ message: "Машины с такой маркой не найдены" });
      }
      res.json(cars);
    } catch (error) {
      console.error("Ошибка при поиске машин по марке:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });

// Запуск сервера
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));