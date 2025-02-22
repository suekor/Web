const User = require("../models/User");

// 📌 Получение профиля пользователя
exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
};

// 📌 Обновление профиля пользователя
exports.updateProfile = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: "Имя пользователя обязательно" });

        const user = await User.findByIdAndUpdate(req.user.id, { username }, { new: true }).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Ошибка обновления профиля" });
    }
};
