const express = require('express');
const router = express.Router();
const File = require('../models/File');
const User = require('../models/User');
const Key = require('../models/Key');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ dest: 'uploads/' });

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  const { userId, isPublic } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Check upload restrictions
  const fileCount = await File.countDocuments({ userId });
  if (fileCount >= user.uploadLimit) {
    return res.status(403).json({ error: 'Upload limit reached' });
  }

  const file = new File({
    userId,
    filename: req.file.originalname,
    path: req.file.path,
    isPublic: isPublic === 'true',
    accessLink: `https://mywebsite.com/file/${uuidv4()}`
  });

  await file.save();
  res.json({ file, accessLink: file.accessLink });
});

// Toggle public/private
router.put('/toggle/:id', async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  file.isPublic = !file.isPublic;
  await file.save();
  res.json({ isPublic: file.isPublic });
});

// Download file
router.get('/file/:accessLink', async (req, res) => {
  const file = await File.findOne({ accessLink: `https://mywebsite.com/file/${req.params.accessLink}` });
  if (!file || (!file.isPublic && !req.user)) return res.status(403).json({ error: 'Access denied' });
  res.download(file.path, file.filename);
});

// Redeem membership key
router.post('/redeem', async (req, res) => {
  const { userId, key } = req.body;
  const keyData = await Key.findOne({ key });
  if (!keyData || keyData.used || keyData.expiry < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired key' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.membership = keyData.membership;
  user.uploadLimit = keyData.membership === 'Ultra Premium Member' ? 100 : keyData.membership === 'Premium Member' ? 50 : 20;
  user.storageLimit = keyData.membership === 'Ultra Premium Member' ? 10 * 1024 * 1024 * 1024 : keyData.membership === 'Premium Member' ? 5 * 1024 * 1024 * 1024 : 1 * 1024 * 1024 * 1024;

  keyData.used = true;
  await user.save();
  await keyData.save();
  res.json({ message: 'Membership upgraded', membership: user.membership });
});

module.exports = router;