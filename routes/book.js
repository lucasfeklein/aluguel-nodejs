import express from "express";
import { verifyToken } from "../middleware.js";
import { prisma } from "../prisma.js";

const router = express.Router();

router.get("/myrentals", verifyToken, async (req, res) => {
  const { pin } = req;
  const books = await prisma.book.findMany({
    orderBy: {
      title: "asc",
    },
    include: { copies: { where: { rentedByPin: pin } } },
  });
  res.json(books);
});

router.get("/", async (req, res) => {
  const books = await prisma.book.findMany({
    orderBy: {
      title: "asc",
    },
    include: { copies: true },
  });
  res.json(books);
});

export default router;
