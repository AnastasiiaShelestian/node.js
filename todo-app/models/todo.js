let tasks = [];
let nextId = 1;

function getAll() {
  return tasks;
}

function create(text) {
  const task = { id: nextId++, text, completed: false };
  tasks.push(task);
  return task;
}

function findById(id) {
  return tasks.find((task) => task.id === id);
}

function toggle(id) {
  const task = findById(id);
  if (!task) return null;
  task.completed = !task.completed;
  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return null;
  const [deleted] = tasks.splice(index, 1);
  return deleted;
}

module.exports = {
  getAll,
  create,
  findById,
  toggle,
  deleteTask,
};
