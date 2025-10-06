import { Router } from "express";
import loginRouter from "./Login";
import signupRouter from "./Signup";
import itemRouter from "./Item";
import uploadRouter from "./Upload";

const router = Router();

router.use("/login", loginRouter);
router.use("/signup", signupRouter);
router.use("/item", itemRouter);
router.use("/upload", uploadRouter);

export default router;
