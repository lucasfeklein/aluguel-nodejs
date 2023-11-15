import cors from "cors";
import express from "express";
import {
  authRouter,
  bookRouter,
  copyRouter,
  personRouter,
} from "./routes/index.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/book", bookRouter);
app.use("/person", personRouter);
app.use("/copy", copyRouter);
app.use("/auth", authRouter);

app.get("/", async (req, res) => {
  res.send("oi");
});

app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
