require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');

async function fixDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const posts = await Post.find({ image: { $regex: '^http://localhost' } });
    console.log(`Found ${posts.length} posts with localhost images.`);

    for (const post of posts) {
      post.image = '';
      await post.save();
    }
    console.log('Fixed posts.');

    const users = await User.find({ $or: [{ profilePicture: { $regex: '^http://localhost' } }, { coverImage: { $regex: '^http://localhost' } }] });
    console.log(`Found ${users.length} users with localhost images.`);
    
    for (const user of users) {
      if (user.profilePicture && user.profilePicture.startsWith('http://localhost')) {
        user.profilePicture = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name);
      }
      if (user.coverImage && user.coverImage.startsWith('http://localhost')) {
        user.coverImage = '';
      }
      await user.save();
    }
    console.log('Fixed users.');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fixDB();
