const express = require('express');
const Car = require('../models/Car');

const router = express.Router();

// Получить все автомобили
router.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавить новый автомобиль
router.post('/cars', async (req, res) => {
  try {
    const newCar = new Car(req.body);
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Обновить автомобиль
router.put('/cars/:id', async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Удалить автомобиль
router.delete('/cars/:id', async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
