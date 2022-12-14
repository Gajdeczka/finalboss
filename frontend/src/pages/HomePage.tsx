import { ChangeEventHandler, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type TTodo = {
  id: string;
  name: string;
  isChecked: boolean;
};

export default function HomePage() {
  const [inputValue, setInputValue] = useState("");
  const [todoList, setTodoList] = useState<TTodo[]>([]);

  const navigate = useNavigate();

  const handleAddTodo = async () => {
    const token = localStorage.getItem("auth-token");
    const request = await fetch("http://127.0.0.1:3333/secure/todo", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: inputValue,
      }),
    });

    if (!request.ok) {
      alert("Ocorreu um erro");
      return;
    }

    setInputValue("");
    await getTodoList();
  };
  const handleDeleteTodo = async (todoId: string) => {
    setTodoList([]);

    const token = localStorage.getItem("auth-token");
    const request = await fetch(`http://127.0.0.1:3333/secure/todo/${todoId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!request.ok) {
      alert("Ocorreu um erro");
      return;
    }

    await getTodoList();
  };
  const handleChangeTodo = async (checked: boolean, todoId: string) => {
    setTodoList([]);

    const token = localStorage.getItem("auth-token");
    const request = await fetch(`http://127.0.0.1:3333/secure/todo/${todoId}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        isChecked: checked,
      }),
    });

    if (!request.ok) {
      alert("Ocorreu um erro");
      return;
    }

    await getTodoList();
  };
  const getTodoList = async () => {
    setTodoList([]);
    const token = localStorage.getItem("auth-token");
    const request = await fetch("http://127.0.0.1:3333/secure/todo", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!request.ok) {
      alert("Ocorreu um erro");
      return;
    }

    setTodoList(await request.json());
  };
  function handleLogout() {
    localStorage.removeItem("auth-token")

    navigate("/login")
  }

  useEffect(() => {
    getTodoList();
  }, []);

  return (
    <main>
      <div className="meio">
      <h1 className="list">Lista de tarefas</h1>
      <input
        value={inputValue}
        onChange={(ev) => setInputValue(ev.currentTarget.value)}
        type="text"
        placeholder="Tarefa"
      />
      <button className="test" onClick={handleAddTodo}>Adicionar</button>

      <button onClick={handleLogout}>Sair</button>
      </div>
      <ul>
        {todoList.length < 1 && <span>A lista está vazia 🤨</span>}
        {todoList.map((todo) => (
          <li key={todo.id}>
            <input
              onChange={(ev) => {
                ev.preventDefault();
                handleChangeTodo(ev.currentTarget.checked, todo.id);
              }}
              defaultChecked={todo.isChecked}
              type="checkbox"
            />
            <p
              style={{
                textDecoration: todo.isChecked ? "line-through" : "none",
              }}
            >
              {todo.name}
            </p>
            <button
              onClick={(ev) => {
                ev.preventDefault();
                handleDeleteTodo(todo.id);
              }}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    
    </main>
  );
}
