const Todo = require("../models/todo");
const Category = require("../models/category");

exports.listTasks = async (req, res) => {
  try {
    const { q, categoryId, status, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (q) filter.title = { $regex: q, $options: "i" };
    if (categoryId) filter.categoryId = categoryId;
    if (status === "completed") filter.completed = true;
    if (status === "active") filter.completed = false;

    const total = await Todo.countDocuments(filter);
    const todos = await Todo.find(filter)
      .populate("categoryId", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      items: todos,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении задач" });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id).populate(
      "categoryId",
      "name"
    );
    if (!todo) return res.status(404).json({ error: "Задача не найдена" });
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении задачи" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, categoryId, dueDate } = req.body;

    if (!title || title.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Название задачи должно быть от 2 символов" });
    }

    const todo = await Todo.create({
      title,
      categoryId: categoryId || null,
      dueDate: dueDate || null,
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при создании задачи" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, completed, categoryId, dueDate } = req.body;
    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      { title, completed, categoryId, dueDate },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Задача не найдена" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при обновлении задачи" });
  }
};

exports.toggleTask = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: "Задача не найдена" });
    todo.completed = !todo.completed;
    await todo.save();
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при переключении статуса" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Todo.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Задача не найдена" });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Ошибка при удалении задачи" });
  }
};
