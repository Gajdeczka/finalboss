import { PropsWithChildren } from "react";
import { Route, Routes } from "react-router";
import { BrowserRouter, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function Private({ children }: PropsWithChildren) {

  const token = localStorage.getItem("auth-token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <div>{children}</div>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Private><HomePage /></Private>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
