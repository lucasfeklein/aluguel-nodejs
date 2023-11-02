import express from "express";
import { prisma } from "./prisma.js";

const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
