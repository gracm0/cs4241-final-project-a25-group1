import { Router } from "express";
import loginRouter from "./Login";
import signupRouter from "./Signup";
import completeItemRouter from "./CompleteItem";

const router = Router();

router.use("/login", loginRouter);
router.use("/signup", signupRouter);
router.use("/complete-item", completeItemRouter);

export default router;
