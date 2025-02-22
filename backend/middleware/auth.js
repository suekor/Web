const jwt = require("jsonwebtoken");
const SECRET_KEY = "Kazakh";

// Middleware для проверки токена
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Нет токена, авторизация запрещена" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Добавляем данные пользователя в запрос
        next();
    } catch (error) {
        return res.status(403).json({ message: "Неверный или просроченный токен" });
    }
};

// Middleware для проверки, является ли пользователь админом
const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Доступ запрещён" });
    }
    next();
};

module.exports = { authenticate, authorizeAdmin };
