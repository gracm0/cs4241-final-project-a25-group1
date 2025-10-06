import { Router } from "express";
import loginRouter from "./Login";
import signupRouter from "./Signup";
import completeItemRouter from "./CompleteItem";
import uploadRouter from "./Upload";

const router = Router();

router.use("/login", loginRouter);
router.use("/signup", signupRouter);
router.use("/complete-item", completeItemRouter);
router.use("/upload", uploadRouter);

export default router;
