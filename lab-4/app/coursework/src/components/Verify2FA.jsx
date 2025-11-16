import React from "react";
import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Container } from "@mui/material";

const Verify2FA = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    setError("");

    if (!code.trim()) {
      setError("Пожалуйста, введите код");
      return;
    }

    try {
      const tempToken = localStorage.getItem("tempToken");

      const response = await axiosInstance.post(
        "/auth/verify-2fa",
        { code },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
        }
      );

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      localStorage.setItem("token", response.data.token);
      localStorage.removeItem("tempToken");
      console.log("Ответ от сервера:", response.data);

      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка верификации 2FA");
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
        backgroundPosition: "center",
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container
        sx={{
          height: 300,
          width: 400,
          borderRadius: 4,
          boxShadow: 5,
          background:
            "linear-gradient(135deg, rgba(26, 62, 34, 0.7) 0%, rgba(33, 94, 64, 0.7) 100%)",
          backdropFilter: "blur(7px)",
          padding: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
          Введите код из приложения-аутентификатора
        </Typography>
        <TextField
          variant="outlined"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          sx={{
            backgroundColor: "#fff",
            borderRadius: 1,
            width: "100%",
            input: { color: "#000" },
          }}
        />
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleVerify}
          sx={{ mt: 2, width: "100%" }}
        >
          Подтвердить
        </Button>
      </Container>
    </Box>
  );
};

export default Verify2FA;
