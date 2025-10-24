const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.set("view engine", "pug");
app.set("views", "./views");
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const todoController = require("./controllers/todoController");
const aboutController = require("./controllers/aboutController");
const errorController = require("./controllers/errorController");

app.get("/", todoController.listTasks);
app.get("/new", (req, res) => {
  res.render("new", { title: "Новая задача" });
});
app.post("/new", todoController.createTask);
app.get("/about", aboutController.getAbout);
app.get("/:id", todoController.getTaskById);
app.post("/:id/toggle", todoController.toggleTask);
app.post("/:id/delete", todoController.deleteTask);

app.use(errorController.notFound);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
