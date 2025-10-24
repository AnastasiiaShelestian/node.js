const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/todoapp")
  .then(() => console.log("MongoDB подключена"))
  .catch((err) => console.error("Ошибка подключения к MongoDB:", err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const todoController = require("./controllers/todoController");
const categoryController = require("./controllers/categoryController");

app.get("/api/categories", categoryController.getAll);
app.get("/api/categories/:id", categoryController.getById);
app.post("/api/categories", categoryController.create);
app.put("/api/categories/:id", categoryController.update);
app.delete("/api/categories/:id", categoryController.remove);

app.get("/api/todos", todoController.listTasks);
app.get("/api/todos/:id", todoController.getTaskById);
app.post("/api/todos", todoController.createTask);
app.put("/api/todos/:id", todoController.updateTask);
app.patch("/api/todos/:id/toggle", todoController.toggleTask);
app.delete("/api/todos/:id", todoController.deleteTask);

app.get("/", (req, res) => {
  res.json({ message: "Todo API is running. Try /api/todos or /api/categories" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
