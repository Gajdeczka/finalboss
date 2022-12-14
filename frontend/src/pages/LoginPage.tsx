import { FormEventHandler, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const onSubmit: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();

    const { email, password } = ev.currentTarget;

    const request = await fetch("http://127.0.0.1:3333/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    if (!request.ok) {
      alert("Ocorreu um erro");
      return;
    }

    const { token } = await request.json();

    localStorage.setItem("auth-token", token);

    navigate("/");
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Entrar</h1>
      <input name="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Senha" required />
      <button type="submit">Entrar</button>
      <span>
        Ainda não tem uma conta? <Link to="/register">Cadastre-se!</Link>
      </span>
    </form>
  );
}
