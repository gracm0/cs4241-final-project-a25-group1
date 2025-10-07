import { Request, Response } from "express";

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file?.path) {
    return res.status(400).json({ success: false, message: "Upload failed" });
  }

  // Cloudinary URL
  return res.json({ success: true, url: req.file.path });
};