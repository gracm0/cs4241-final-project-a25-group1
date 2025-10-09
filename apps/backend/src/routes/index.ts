// index.ts
import { Router } from "express";
import loginRouter from "./Login";
import signupRouter from "./Signup";
import itemRouter from "./Item";
import bucketRouter from "./BucketAction";
import uploadRouter from "./Upload";
import userRouter from "./CurrentUser";
import logoutRouter from "./Logout";
import galleryImageRouter from "./GalleryImageAction";
import collaborationRouter from "./CollaborationInvite";

const router = Router();

router.use("/login", loginRouter);
router.use("/signup", signupRouter);
router.use("/item-action", itemRouter);
router.use("/bucket-action", bucketRouter);
router.use("/upload", uploadRouter);
router.use("/me", userRouter);
router.use("/logout", logoutRouter);
router.use("/gallery-image", galleryImageRouter);
router.use("/collab", collaborationRouter);

export default router;
