import { FormEventHandler, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const onSubmit: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();

    const { userName, email, password } = ev.currentTarget;

    const requestRegister = await fetch("http://127.0.0.1:3333/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userName.value,
        email: email.value,
        password: password.value,
      }),
    });

    if (!requestRegister.ok) {
      alert("Ocorreu um erro");
      return;
    }

    const requestLogin = await fetch("http://127.0.0.1:3333/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    if (!requestLogin.ok) {
      alert("Ocorreu um erro");
      return;
    }

    const { token } = await requestLogin.json();

    localStorage.setItem("auth-token", token);

    navigate("/");
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Cadastrar-se</h1>
      <input name="userName" placeholder="Nome" required />
      <input name="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Senha" required />
      <button type="submit">Cadrastrar-se</button>
      <span>
        Já tem uma conta? <Link to="/login">Entre!</Link>
      </span>
    </form>
  );
}
