require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin found');
      process.exit(1);
    }

    const project = await Project.create({
      name: 'Test Project',
      description: 'Test Desc',
      createdBy: admin._id,
      members: []
    });

    console.log('Created project', project);
  } catch (err) {
    console.error('Error creating project:', err);
  }
  process.exit(0);
}

test();
