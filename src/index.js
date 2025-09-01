import express from "express";
import RekapRoute from "../src/routes/routes.js";
const app = express();

app.get("/", (req, res) => {
  res.send("index");
});

app.use(express.json());
app.use(RekapRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
