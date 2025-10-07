import { Router } from "express";
import loginRouter from "./Login";
import signupRouter from "./Signup";
import itemRouter from "./Item";
import uploadRouter from "./Upload";
import userRouter from "./CurrentUser";
import logoutRouter from "./Logout";

const router = Router();

router.use("/login", loginRouter);
router.use("/signup", signupRouter);
router.use("/item-action", itemRouter);
router.use("/upload", uploadRouter);
router.use("/me", userRouter);
router.use("/logout", logoutRouter);

export default router;
