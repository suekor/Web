const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "mysecretkey"; 

// 📌 Регистрация пользователя
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.json({ message: "✅ Пользователь зарегистрирован" });
    } catch (err) {
        res.status(400).json({ error: "Ошибка регистрации" });
    }
};

// 📌 Вход (логин)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Неверные данные" });
        }
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        res.status(400).json({ error: "Ошибка входа" });
    }
};
