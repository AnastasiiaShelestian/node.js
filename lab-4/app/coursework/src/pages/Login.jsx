import axiosInstance from "../api/axiosInstance";
import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Link,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      const { token, user, twoFactor } = response.data;

      if (twoFactor) {
        localStorage.setItem("tempToken", token);
        navigate("/verify-2fa");
      } else {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/profile");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Неверный email или пароль");
    }
  };

  const socialIconStyle = {
    width: "50px",
    height: "auto",
    cursor: "pointer",
    borderRadius: "6px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
    transition: "transform 0.2s ease",
  };

  const handleHover = (e, scale) => {
    e.currentTarget.style.transform = `scale(${scale})`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#354f52",
        backgroundImage:
          "url(https://u-stena.ru/upload/iblock/5ea/5ea640f9c5cadfed58a52a6d53d2e142.jpg)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container
        sx={{
          height: 500,
          width: 400,
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: 5,
          background:
            "linear-gradient(135deg, rgba(26, 62, 34, 0.7) 0%, rgba(33, 94, 64, 0.7) 100%)",
          backdropFilter: "blur(7px)",
          padding: 3,
        }}
      >
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            sx={{ width: "100%" }}
          >
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: "bold" }}>
              Авторизация
            </Typography>
            <TextField
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Пароль"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button variant="contained" color="primary" type="submit">
              Войти
            </Button>

            <Box
              sx={{
                my: 2,
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Box sx={{ flex: 1, height: "1px", backgroundColor: "#ccc" }} />
              <Typography
                variant="body2"
                sx={{
                  mx: 2,
                  color: "#fff",
                  whiteSpace: "nowrap",
                }}
              >
                или войти через
              </Typography>
              <Box sx={{ flex: 1, height: "1px", backgroundColor: "#ccc" }} />
            </Box>

            <Box
              sx={{
                mt: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <a href="http://localhost:5000/api/auth/google">
                <img
                  src="/images/Google.png"
                  alt="Войти через Google"
                  style={socialIconStyle}
                  onMouseOver={(e) => handleHover(e, 1.05)}
                  onMouseOut={(e) => handleHover(e, 1)}
                />
              </a>

              <a href="http://localhost:5000/api/auth/github">
                <img
                  src="/images/GitHub.png"
                  alt="Войти через GitHub"
                  style={socialIconStyle}
                  onMouseOver={(e) => handleHover(e, 1.05)}
                  onMouseOut={(e) => handleHover(e, 1)}
                />
              </a>
            </Box>

            <Typography variant="body2" sx={{ color: "#dad7cd", mt: 2 }}>
              Нет аккаунта?{" "}
              <Link component="button" onClick={() => navigate("/register")}>
                Зарегистрироваться
              </Link>
            </Typography>
          </Box>
        </form>
      </Container>
    </Box>
  );
}

export default Login;
