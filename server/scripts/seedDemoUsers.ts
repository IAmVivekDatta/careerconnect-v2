import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { connectDatabase } from '../src/config/mongodb';

const demoUsers = [
  {
    name: 'Tinku Kumar',
    email: 'tinku@alumni.com',
    password: 'DemoPassword@123',
    role: 'alumni',
    bio: 'Full-stack developer with 5 years of experience in React and Node.js. Passionate about mentoring junior developers.',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'AWS'],
    education: [
      {
        institution: 'Delhi Institute of Technology',
        degree: 'B.Tech in Computer Science',
        year: 2019
      }
    ],
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp India',
        from: new Date('2022-01-01'),
        description: 'Leading full-stack development team, architecting microservices'
      },
      {
        title: 'Software Engineer',
        company: 'StartupXYZ',
        from: new Date('2019-06-01'),
        to: new Date('2021-12-31'),
        description: 'Built customer-facing React applications and backend APIs'
      }
    ],
    points: 850
  },
  {
    name: 'Panku Singh',
    email: 'panku@alumni.com',
    password: 'DemoPassword@123',
    role: 'alumni',
    bio: 'Data scientist and ML engineer. Focused on building scalable ML systems.',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'Spark', 'AWS', 'GCP'],
    education: [
      {
        institution: 'Mumbai Institute of Technology',
        degree: 'B.Tech in Information Technology',
        year: 2020
      }
    ],
    experience: [
      {
        title: 'ML Engineer',
        company: 'DataSystems Ltd',
        from: new Date('2021-07-01'),
        description: 'Developing ML pipelines and data models for predictive analytics'
      }
    ],
    points: 720
  },
  {
    name: 'Patlu Gupta',
    email: 'patlu@alumni.com',
    password: 'DemoPassword@123',
    role: 'alumni',
    bio: 'DevOps and Infrastructure specialist. Cloud-native architecture enthusiast.',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins', 'Linux', 'CI/CD'],
    education: [
      {
        institution: 'Bangalore University of Technology',
        degree: 'B.Tech in Computer Engineering',
        year: 2021
      }
    ],
    experience: [
      {
        title: 'DevOps Engineer',
        company: 'CloudTech Systems',
        from: new Date('2021-03-01'),
        description: 'Managing cloud infrastructure and implementing CI/CD pipelines'
      }
    ],
    points: 680
  },
  {
    name: 'Motu Sharma',
    email: 'motu@alumni.com',
    password: 'DemoPassword@123',
    role: 'alumni',
    bio: 'Mobile app developer specializing in iOS and Android. 4 years of industry experience.',
    skills: ['Swift', 'Kotlin', 'Flutter', 'React Native', 'Firebase', 'REST APIs'],
    education: [
      {
        institution: 'Chennai Institute of Technology',
        degree: 'B.Tech in Electronics and Communication',
        year: 2020
      }
    ],
    experience: [
      {
        title: 'Senior Mobile Developer',
        company: 'MobileSoft Inc',
        from: new Date('2020-08-01'),
        description: 'Developing cross-platform mobile applications with 2M+ downloads'
      }
    ],
    points: 790
  },
  {
    name: 'Mothi Patel',
    email: 'mothi@alumni.com',
    password: 'DemoPassword@123',
    role: 'alumni',
    bio: 'Product manager and tech entrepreneur. Previously built 2 successful startups.',
    skills: ['Product Strategy', 'Business Development', 'Marketing', 'Analytics', 'Leadership'],
    education: [
      {
        institution: 'Hyderabad College of Engineering',
        degree: 'B.Tech in Mechanical Engineering',
        year: 2018
      }
    ],
    experience: [
      {
        title: 'Co-founder & CEO',
        company: 'NextGen Solutions',
        from: new Date('2022-01-01'),
        description: 'Building B2B SaaS product for enterprise automation'
      },
      {
        title: 'Product Manager',
        company: 'FinTech Innovations',
        from: new Date('2019-02-01'),
        to: new Date('2021-12-31'),
        description: 'Led product team for digital payment platform'
      }
    ],
    points: 920
  }
];

async function seedDemoUsers() {
  try {
    await connectDatabase();
    console.log('Connected to MongoDB');

    // Clear existing demo users
    await User.deleteMany({ email: { $in: demoUsers.map(u => u.email) } });
    console.log('Cleared existing demo users');

    // Insert new demo users
    const insertedUsers = await User.insertMany(demoUsers);
    console.log(`✅ Successfully seeded ${insertedUsers.length} demo alumni users!`);

    insertedUsers.forEach((user, idx) => {
      console.log(`   ${idx + 1}. ${user.name} (${user.email}) - ${user.points} points`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDemoUsers();
