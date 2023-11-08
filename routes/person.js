import express from "express";
import { verifyToken } from "../middleware.js";
import { prisma } from "../prisma.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const person = await prisma.person.findUnique({ where: { pin: req.pin } });
  res.json(person);
});

router.post("/register", async (req, res) => {
  try {
    const { name, pin, address, birthday } = req.body;

    if (!name || !pin || !address || !birthday) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const person = await prisma.person.create({
      data: { name, pin, address, birthday },
    });

    res.status(201).json(person); // Respond with a 201 status code for successful creation
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

export default router;
