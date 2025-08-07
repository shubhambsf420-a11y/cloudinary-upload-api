// api/upload.js
import { IncomingForm } from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Disable Next.js default body parsing
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ error: 'Form parsing error' });
    }

    const file = files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const publicId = fields.public_id;

      // Delete old image if publicId is provided
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }

      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'profile_pics',
        format: 'webp', // ✅ Convert to WebP
      });

      return res.status(200).json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });
}
