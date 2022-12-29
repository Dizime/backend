import { Router } from "express";
import Users from "./users";
import Auth from "./auth";
const router = Router();

router.use("/users", Users);
router.use("/auth", Auth);

export default router;