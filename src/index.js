import express from "express";
import RekapRoute from "../src/routes/routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.send("index");
});

app.use(express.json());
app.use(RekapRoute);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
