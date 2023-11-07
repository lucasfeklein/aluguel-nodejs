import express from "express";
import { verifyToken } from "../middleware.js";
import { prisma } from "../prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const books = await prisma.book.findMany();
  res.json(books);
});

router.post("/rentcopy", verifyToken, async (req, res) => {
  const { copyId } = req.body;

  const pin = req.pin;

  const copy = await prisma.copy.findUnique({ where: { id: copyId } });

  // Check if the copy is already rented
  if (copy.isRented) {
    res.status(400).json({ error: "Copy is already rented" });
  }

  const currentDate = new Date(); // Get the current date and time
  const rentedDate = new Date(currentDate.toDateString()); // Extract the date part

  const updatedCopy = await prisma.copy.update({
    where: { id: copyId },
    data: { isRented: true, rentedByPin: pin },
  });

  const rentalHistory = await prisma.rentalHistory.create({
    data: {
      copyId: copyId,
      rentedByPin: pin,
      rentedAt: rentedDate,
    },
  });

  res.json({ updatedCopy });
});

export default router;
