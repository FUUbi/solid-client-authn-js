import express from "express";
import path from "path";

const PORT = 3001;

const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

app.get("/B", (req, res) => {
  res.sendFile(path.join(__dirname, "./B.html"));
});

app.get("/C", (req, res) => {
  res.sendFile(path.join(__dirname, "./C.html"));
});

app.get("/solid-client-authn.bundle.js", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../../dist/solid-client-authn.bundle.js")
  );
});

app.listen(PORT, () => console.log(`Listening on port [${PORT}]...`));
