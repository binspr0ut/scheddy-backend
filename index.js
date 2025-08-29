import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("index");
});

app.listen(3000, () => console.log("Server up and running"));
