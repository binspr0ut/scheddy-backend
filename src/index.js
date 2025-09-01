import express from "express";
import RekapRoute from "../src/routes/routes.js";
const app = express();

app.get("/", (req, res) => {
  res.send("index");
});

app.use(express.json());
app.use(RekapRoute);

app.listen(3000, () => console.log("Server up and running"));
