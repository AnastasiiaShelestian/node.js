import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Enable2FA from "./Enable2FA";

function Profile() {
  const navigate = useNavigate();
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser || storedUser === "undefined") return;
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    } catch (err) {
      console.error("Ошибка парсинга user:", err);
    }
  }, []);

  if (!user) {
    return (
      <Typography variant="h6" sx={{ mt: 4, color: "white" }}>
        Загрузка профиля...
      </Typography>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handle2FASuccess = () => {
    const updatedUser = { ...user, twoFactorEnabled: true };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setShow2FASetup(false);
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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container
        sx={{
          position: "relative",
          width: 400,
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: 5,
          background:
            "linear-gradient(135deg, rgba(26, 62, 34, 0.6) 0%, rgba(33, 94, 64, 0.6) 100%)",
          backdropFilter: "blur(7px)",
          padding: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}
        >
          Добро пожаловать!
        </Typography>
        <Typography variant="body1" sx={{ color: "#dad7cd", mb: 1 }}>
          Имя: {user.name}
        </Typography>
        <Typography variant="body1" sx={{ color: "#dad7cd", mb: 2 }}>
          Email: {user.email}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Двухфакторная аутентификация:{" "}
          <strong>
            {user.twoFactorEnabled ? "включена ✅" : "отключена ❌"}
          </strong>
        </Typography>

        {!user?.twoFactorEnabled && !show2FASetup && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShow2FASetup(true)}
            sx={{ mt: 4 }}
          >
            Включить двухфакторную аутентификацию
          </Button>
        )}

        {show2FASetup && (
          <Box sx={{ mt: 2 }}>
            <Enable2FA user={user} onSuccess={handle2FASuccess} />
          </Box>
        )}

        {user?.twoFactorEnabled && (
          <Typography
            variant="body2"
            sx={{ mt: 2, color: "lightgreen", fontWeight: "bold" }}
          >
            ✅ Двухфакторная аутентификация включена
          </Typography>
        )}

        <Box sx={{ mt: 4 }}>
          <Button variant="contained" onClick={handleLogout} color="primary">
            Выйти из аккаунта
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Profile;
