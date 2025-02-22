const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const SECRET_KEY = "Kazakh"; // Лучше использовать process.env

// Регистрация пользователя
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Заполните все поля" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Пользователь уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role: "user" }); // Роль всегда "user"

    await newUser.save();

    // Генерация токена сразу после регистрации
    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ message: "Пользователь успешно создан", token, role: newUser.role });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Логин пользователя
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Неверный логин или пароль" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Неверный логин или пароль" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Ошибка входа:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;