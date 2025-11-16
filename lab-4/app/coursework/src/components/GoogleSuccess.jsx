import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function GoogleSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const name = query.get("name");
    const email = query.get("email");

    if (!token) {
      alert("Ошибка авторизации через Google.");
      navigate("/");
      return;
    }

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ name, email }));

      navigate("/profile");
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  return <div>Авторизация через Google... Подождите...</div>;
}

export default GoogleSuccess;
