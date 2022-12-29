import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { DatabaseManager } from "../../../manager/DatabaseManager";
import hCaptcha from "hcaptcha";
import { v4 } from "uuid";
const router = Router();

router.post("/", async (req, res) => {
  const { email, password, newsletter, username } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password", code: 40000 });
  }
  if (!req.body["h-captcha-response"]) {
    res.status(400).json({ error: "Captcha Required", code: 40002 });
    return;
  }
  
  const captcha = await hCaptcha.verify(process.env.HCAPTCHA_SECRET!, req.body["h-captcha-response"]);
  if (!captcha.success) {
    res.status(400).json({ error: "Captcha Failed", code: 40003 });
    return;
  }
  const sameName = await DatabaseManager.getMultiUsers({ username });
  if (sameName.length >= 9999) {
    res.status(400).json({ error: "Username is taken", code: 40001 });
    return;
  }
  const sameEmail = await DatabaseManager.getUser({ email });
  if (sameEmail) {
    res.status(400).json({ error: "Email is taken", code: 40001 });
    return;
  }
  const availableDiscriminator = Array.from({ length: 9999 }, (_, i) => i).filter((i) => !sameName.some((u) => u.discriminator === `${String(i + 1).padStart(4, "0")}`)).map((i) => `${String(i + 1).padStart(4, "0")}`);
  const user = await DatabaseManager.createUser({
    email,
    password: await bcrypt.hash(password, 10),
    receiveEmails: newsletter,
    username,
    id: v4(),
    discriminator: `${availableDiscriminator[Math.floor(Math.random() * availableDiscriminator.length)]}`,
  });
  const wsOnlyToken = jwt.sign({ id: user.id, email: user.email, password: user.password }, process.env.JWT_WS_SECRET!, { expiresIn: "30d" });
  const token = jwt.sign({ id: user.id, email: user.email, password: user.password }, process.env.JWT_SECRET!, { expiresIn: "30d" });
  res.cookie("token", token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 });
  res.json({ error: null, wsOnlyToken });
});

export default router;