import dotenv from "dotenv";
import { Dizime } from "./Dizime";
dotenv.config();

const instance = new Dizime();
instance.start().catch(console.error);

["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
  process.on(signal, async () => {
    await instance.stop();
    process.exit();
  });
});