// api/upload.js

import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Disable default body parsing by Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({
    multiples: false,
    keepExtensions: true,
  });

  try {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return res.status(500).json({ error: "Form parsing error" });
      }

      const file = files.file;
      const publicId = fields.public_id;

      if (!file || !file.filepath) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Optionally delete old image
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.warn("Cloudinary delete failed:", deleteError.message);
        }
      }

      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "profile_pics",
      });

      return res.status(200).json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    });
  } catch (e) {
    console.error("Upload error:", e);
    return res.status(500).json({ error: "Upload failed" });
  }
}
