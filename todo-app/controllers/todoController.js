const Todo = require("../models/todo");

exports.listTasks = (req, res) => {
  const tasks = Todo.getAll();
  res.render("index", { title: "Список задач", tasks });
};

exports.createTask = (req, res) => {
  if (!req.body || !req.body.text) {
    return res.status(400).send("Ошибка: не передан текст задачи");
  }
  Todo.create(req.body.text);
  res.redirect("/");
};

exports.toggleTask = (req, res) => {
  const id = Number(req.params.id);
  const task = Todo.toggle(id);
  if (!task) return res.status(404).render("404", { title: "Не найдено" });
  res.redirect("/");
};

exports.deleteTask = (req, res) => {
  const id = Number(req.params.id);
  const deleted = Todo.deleteTask(id);
  if (!deleted) return res.status(404).render("404", { title: "Не найдено" });
  res.redirect("/");
};

exports.getTaskById = (req, res) => {
  const id = Number(req.params.id);
  const task = Todo.findById(id);
  if (!task) {
    return res.status(404).render("404", { title: "Не найдено" });
  }
  res.render("task", { title: "Задача", task });
};

exports.getAbout = (req, res) => {
  res.render("about", { title: "О нас" });
};
