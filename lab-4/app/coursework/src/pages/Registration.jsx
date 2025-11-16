import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Container, Button, TextField, Typography, Box } from "@mui/material";

function Registration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    try {
      await axiosInstance.post("/auth/register", formData);

      const loginResponse = await axiosInstance.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = loginResponse.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Ошибка регистрации");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#354f52",
        backgroundImage:
          "url(https://u-stena.ru/upload/iblock/5ea/5ea640f9c5cadfed58a52a6d53d2e142.jpg)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "centr",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container
        sx={{
          height: 500,
          width: 400,
          marginTop: 5,
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: 5,
          background:
            "linear-gradient(135deg, rgba(26, 62, 34, 0.6) 0%, rgba(33, 94, 64, 0.6) 100%)",
          backdropFilter: "blur(7px)",
          WebkitBackdropFilter: "blur(7px)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            sx={{ width: 300, margin: "0 auto", mt: 0 }}
          >
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: "bold" }}>
              Регистрация
            </Typography>
            <TextField
              name="name"
              label="Имя"
              fullWidth
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              name="email"
              label="Email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              name="password"
              label="Пароль"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleChange}
            />
            {error && <Typography color="error">{error}</Typography>}
            {success && <Typography color="success.main">{success}</Typography>}
            <Button variant="contained" color="primary" type="submit">
              Зарегистрироваться
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
}

export default Registration;
