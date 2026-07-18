require('dotenv').config();
const cloudinary = require('./config/cloudinary');
const fs = require('fs');
const path = require('path');

async function testCloudinary() {
  try {
    console.log("Testing basic cloudinary upload...");
    
    // Create a dummy image (1x1 pixel gif)
    const dummyPath = path.join(__dirname, 'dummy.gif');
    const base64Gif = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    fs.writeFileSync(dummyPath, Buffer.from(base64Gif, 'base64'));
    
    // 1. Test basic upload without folder or transformation
    console.log("Attempt 1: Basic upload...");
    try {
      const res1 = await cloudinary.uploader.upload(dummyPath);
      console.log("Attempt 1 Success:", res1.secure_url);
    } catch (e) {
      console.error("Attempt 1 Failed:", e.message || e);
    }

    // 2. Test upload with folder
    console.log("\nAttempt 2: Upload with folder...");
    try {
      const res2 = await cloudinary.uploader.upload(dummyPath, { folder: 'devconnect' });
      console.log("Attempt 2 Success:", res2.secure_url);
    } catch (e) {
      console.error("Attempt 2 Failed:", e.message || e);
    }

    // 3. Test upload with folder and transformation
    console.log("\nAttempt 3: Upload with folder & transformation...");
    try {
      const res3 = await cloudinary.uploader.upload(dummyPath, { 
        folder: 'devconnect/posts',
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
      });
      console.log("Attempt 3 Success:", res3.secure_url);
    } catch (e) {
      console.error("Attempt 3 Failed:", e.message || e);
    }

    fs.unlinkSync(dummyPath);
    process.exit(0);
  } catch (error) {
    console.error("Global Error:", error);
    process.exit(1);
  }
}

testCloudinary();
