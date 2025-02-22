const Resource = require("../models/Resource");

// 📌 Добавление ресурса
exports.createResource = async (req, res) => {
    const { title } = req.body;
    const resource = new Resource({ title, userId: req.user.id });
    await resource.save();
    res.json({ message: "✅ Ресурс добавлен" });
};

// 📌 Получение всех ресурсов пользователя
exports.getResources = async (req, res) => {
    const resources = await Resource.find({ userId: req.user.id });
    res.json(resources);
};

// 📌 Получение ресурса по ID
exports.getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findOne({ _id: req.params.id, userId: req.user.id });
        if (!resource) return res.status(404).json({ error: "Ресурс не найден" });

        res.json(resource);
    } catch (err) {
        res.status(400).json({ error: "Ошибка получения ресурса" });
    }
};

// 📌 Обновление ресурса
exports.updateResource = async (req, res) => {
    try {
        const { title, completed } = req.body;
        const resource = await Resource.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { title, completed },
            { new: true }
        );

        if (!resource) return res.status(404).json({ error: "Ресурс не найден" });
        res.json({ message: "✅ Ресурс обновлен", resource });
    } catch (err) {
        res.status(400).json({ error: "Ошибка обновления ресурса" });
    }
};

// 📌 Удаление ресурса (Только для админа)
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findOneAndDelete({ _id: req.params.id });
        if (!resource) return res.status(404).json({ error: "Ресурс не найден" });

        res.json({ message: "✅ Ресурс удален" });
    } catch (err) {
        res.status(400).json({ error: "Ошибка удаления ресурса" });
    }
};
