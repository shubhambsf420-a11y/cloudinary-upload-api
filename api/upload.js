// api/upload.js

import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Disable Vercel’s default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Cloudinary config using env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Form parsing error" });
    }

    const file = files.file;
    if (!file || !file.path) {
      return res.status(400).json({ error: "Missing file" });
    }

    try {
      const publicId = fields.public_id;

      // Delete previous image if public_id is passed
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }

      const result = await cloudinary.uploader.upload(file.path, {
        folder: "profile_pics",
      });

      return res.status(200).json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}
