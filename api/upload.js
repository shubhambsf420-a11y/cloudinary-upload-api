const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.dgqky5ees,
  api_key: process.env.233859675136666,
  api_secret: process.env.sF69Wr6GfMEN6Dv4YVBlmin1xFQ,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { image } = req.body;

  try {
    const uploaded = await cloudinary.uploader.upload(image, {
      folder: 'profile_pictures',
    });
    res.status(200).json({ url: uploaded.secure_url, public_id: uploaded.public_id });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
};
