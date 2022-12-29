import { Router } from "express";
const router = Router();

const isJSON = (str: string) => {
  try {
    JSON.parse(str);
  } catch {
    return false;
  }
  return true;
};

router.ws("/", (ws, req) => {
  ws.on("open", () => {
    ws.send(JSON.stringify({ m: "Hello" }));
  });
  ws.on("message", (msg) => {
    const data = msg.toString();
    if (!isJSON(data)) {
      ws.send(JSON.stringify({ e: "Invalid JSON" }));
      ws.close();
    }
  });
});
router.all("/", (req, res) => {
  res.status(405).json({ error: "Method not allowed" });
})

export default router;