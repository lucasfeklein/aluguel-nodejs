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
    return res.status(400).json({ error: "Copy is already rented" });
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

router.put("/returncopy", verifyToken, async (req, res) => {
  try {
    const { pin } = req;
    const { copyId } = req.body;

    if (!copyId) {
      return res
        .status(400)
        .json({ error: "copyId is required in the request body" });
    }

    const currentDate = new Date();
    const returnDate = new Date(currentDate.toDateString());

    const updatedCopy = await prisma.copy.update({
      where: {
        id: copyId,
      },
      data: {
        rentedByPin: null,
        isRented: false,
      },
    });

    console.log("cheugie aqui");

    if (!updatedCopy) {
      return res
        .status(404)
        .json({ error: "Copy not found or is not rented by you" });
    }

    const updatedRentalHistory = await prisma.rentalHistory.updateMany({
      where: {
        copyId: copyId,
        rentedByPin: pin,
        returnedAt: null,
      },
      data: {
        rentedAt: returnDate,
        returnedAt: currentDate,
      },
    });

    if (!updatedRentalHistory) {
      return res
        .status(404)
        .json({ error: "Rental history not found or already returned" });
    }

    res.status(200).json({ message: "Copy returned successfully" });
  } catch (error) {
    console.error("Error returning copy:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

export default router;
