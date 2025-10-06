import { Router } from "express";
import { upload } from "../cloudinary";
import { uploadImage } from "../controllers/uploadController";

const router = Router();

router.post("/", upload.single("image"), uploadImage);

export default router;