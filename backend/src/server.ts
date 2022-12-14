import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prismaClient } from "./datasource/prismaClient";

const ACCESS_TOKEN_KEY = "f03ae9b5-ddce-4976-b77d-dce75cca04d7";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/secure", async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    res.status(401).send("Access denied");
    return;
  }

  console.log("existe");

  try {
    const verified = jwt.verify(token.split(" ")[1], ACCESS_TOKEN_KEY);
    console.log("verifico");
    if (!(typeof verified === "string")) {
      req.currentUser = await prismaClient.user.findFirst({
        where: { id: verified.sub },
      });
    }
    next();
  } catch (error) {
    console.log("não verifico", error);
    res.status(400).send("Expired token");
  }
});

app.post("/user", async (req, res) => {
  const { name, email, password } = req.body;

  const emailExist = await prismaClient.user.findUnique({
    where: {
      email,
    },
  });

  if (emailExist) {
    res.status(400).send("Email already exists");
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prismaClient.user.create({
    data: { name, email, password: hashedPassword },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  res.status(201).json(user);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prismaClient.user.findUnique({ where: { email } });

  if (!user) {
    res.status(400).send("Invalid credentials");
    return;
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    res.status(400).send("Invalid credentials");
    return;
  }

  const token = jwt.sign({}, ACCESS_TOKEN_KEY, { subject: user.id });

  res.json({ token });
});

app.get("/secure/validate", (req, res) => res.status(204).json({}));

app.post("/secure/todo", async (req, res) => {
  const { name } = req.body;
  const user = req.currentUser;

  if (!user) {
    res.send(401).send("Expired token");
    return;
  }

  const todo = await prismaClient.todo.create({
    data: {
      name,
      isChecked: false,
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
      isChecked: true,
    },
  });

  res.status(201).json(todo);
});

app.get("/secure/todo", async (req, res) => {
  const user = req.currentUser;

  if (!user) {
    res.send(401).send("Expired token");
    return;
  }

  const todos = await prismaClient.todo.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      isChecked: true,
    },
  });

  res.status(201).json(todos);
});

app.put("/secure/todo/:id", async (req, res) => {
  const user = req.currentUser;
  const { name, isChecked } = req.body;
  const todoId = req.params.id;

  if (!user) {
    res.send(401).send("Expired token");
    return;
  }

  const todo = await prismaClient.todo.findFirst({ where: { id: todoId } });

  if (todo?.userId !== user.id) {
    res.status(403).json("Access denied");
    return;
  }

  const todos = await prismaClient.todo.update({
    where: { id: todoId },
    data: {
      name,
      isChecked,
    },
    select: {
      id: true,
      name: true,
      isChecked: true,
    },
  });

  res.status(201).json(todos);
});

app.delete("/secure/todo/:id", async (req, res) => {
  const user = req.currentUser;
  const todoId = req.params.id;

  if (!user) {
    res.send(401).send("Expired token");
    return;
  }

  const todo = await prismaClient.todo.findFirst({ where: { id: todoId } });

  if (todo?.userId !== user.id) {
    res.status(403).json("Access denied");
    return;
  }

  await prismaClient.todo.delete({
    where: { id: todoId },
  });

  res.status(204).json({});
});

app.listen(3333, () => console.log("Server is running in port 3333 🚀"));
