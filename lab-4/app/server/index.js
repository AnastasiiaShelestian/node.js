const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("./config/passport");

const Sentry = require("@sentry/node");
const morgan = require("morgan");
const logger = require("./logger");
const errorHandler = require("./middleware/errorHandler");

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

app.use(cors());
app.use(express.json());

app.use(
  morgan("combined", {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  })
);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.use(errorHandler);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Успешное подключение к MongoDB");
    console.log("Успешное подключение к MongoDB");

    app.listen(process.env.PORT, () => {
      logger.info(`Сервер запущен на http://localhost:${process.env.PORT}`);
      console.log(`Сервер запущен на http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    logger.error(`Ошибка подключения к БД: ${error.message}`);
    console.error("Ошибка подключения к БД:", error.message);
  }
};

start();
