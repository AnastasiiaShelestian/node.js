import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "../api/axiosInstance";

const Enable2FA = ({ onSuccess }) => {
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const fetchQRCode = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await axiosInstance.get("/auth/generate-2fa");
      setQrCode(res.data.qrCode);
      setStep(2);
    } catch (error) {
      console.error(error);
      setStatus("Не удалось получить QR-код");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    setStatus("");
    try {
      await axiosInstance.post("/auth/enable-2fa", { code });
      setStatus("✅ Двухфакторная аутентификация включена");
      if (onSuccess) onSuccess();
    } catch (error) {
      setStatus(error.response?.data?.message || "Ошибка при включении 2FA");
    }
  };

  return (
    <Box textAlign="center">
      {step === 1 && (
        <Button variant="contained" onClick={fetchQRCode}>
          Получить QR-код
        </Button>
      )}

      {loading && <CircularProgress sx={{ mt: 2 }} />}

      {step === 2 && !loading && (
        <>
          <img
            src={qrCode}
            alt="QR Code"
            style={{ width: 200, marginTop: 10 }}
          />
          <Typography variant="body2" mt={2}>
            Отсканируйте QR-код и введите код из приложения:
          </Typography>
          <TextField
            label="Код"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button variant="contained" onClick={handleEnable} sx={{ mt: 2 }}>
            Подтвердить
          </Button>
        </>
      )}

      {status && (
        <Typography mt={2} color={status.startsWith("✅") ? "green" : "error"}>
          {status}
        </Typography>
      )}
    </Box>
  );
};

export default Enable2FA;
