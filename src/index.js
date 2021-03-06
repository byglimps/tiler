import "./env";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
const {
  PORT = 3001,
  TMP_DIR = "tmp",
  APP_NAME = "TILER"
} = process.env;
import create from "./create";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));

if (__DEV__) {
  app.use("/tmp", express.static(TMP_DIR));
}

app.post("/create", create);

app.listen(PORT, err => {
  if (err) {
    console.error(err);
  }

  if (__DEV__) {
    console.log("> in development");
  }
  console.log(`> ${APP_NAME} listening on port ${PORT}`);
});
