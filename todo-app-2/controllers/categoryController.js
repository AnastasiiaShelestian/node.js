const Category = require("../models/category");

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении категорий" });
  }
};


exports.getById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Категория не найдена" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении категории" });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0)
      return res.status(400).json({ error: "Название категории обязательно" });

    const newCategory = await Category.create({ name });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при создании категории" });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Категория не найдена" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при обновлении категории" });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Категория не найдена" });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Ошибка при удалении категории" });
  }
};
