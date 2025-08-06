// api/upload.js
import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";

// Prevent Vercel from parsing the request body
export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.dgqky5ees,
  api_key: process.env.233859675136666,
  api_secret: process.env.sF69Wr6GfMEN6Dv4YVBlmin1xFQ,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form parsing error" });

    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const publicId = fields.public_id?.[0];

      // Delete old image if public_id provided
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }

      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "profile_pics", // optional: organize uploads
      });

      return res.status(200).json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}
