import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { DatabaseManager } from "../../../manager/DatabaseManager";
import hCaptcha from "hcaptcha";
import crypto from "crypto";

const router = Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password", code: 40000 });
  }
  if (!req.body["h-captcha-response"]) {
    return res.status(400).json({ error: "Captcha required", code: 40002 });
  }
  const captcha = await hCaptcha.verify(process.env.HCAPTCHA_SECRET!, req.body["h-captcha-response"]);
  if (!captcha.success) {
    return res.status(400).json({ error: "Invalid captcha", code: 40003 });
  }
  const db = await DatabaseManager.getUser({ email });
  if (!db) {
    return res.status(400).json({ error: "Invalid email or password", code: 40001 });
  }
  const compare = bcrypt.compareSync(password, db.password!);
  if (!compare) {
    return res.status(400).json({ error: "Invalid email or password", code: 40001 });
  }
  const wsOnlyToken = jwt.sign({ id: db.id, email: db.email, password: db.password }, process.env.JWT_WS_SECRET!, { expiresIn: "30d" });
  const token = jwt.sign({ id: db.id, email: db.email, password: db.password }, process.env.JWT_SECRET!, { expiresIn: "30d" });
  res.cookie("token", token, { httpOnly: true });
  res.json({ error: null, wsOnlyToken });
});

export default router;