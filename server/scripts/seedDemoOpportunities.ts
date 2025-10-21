import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Opportunity } from '../src/models/Opportunity';
import { User } from '../src/models/User';
import { connectDatabase } from '../src/config/mongodb';

const demoOpportunities = [
  {
    title: 'Full Stack Developer - B.Tech Fresh Graduates',
    company: 'TechCorp India',
    description: 'We are looking for enthusiastic B.Tech graduates to join our engineering team. You will work on modern web technologies and contribute to building scalable applications. This role offers extensive mentoring and career growth opportunities.',
    type: 'Full-time' as const,
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'REST APIs', 'Git'],
    location: 'Bangalore, India',
    salary: '5-7 LPA',
    applyUrl: 'https://careers.techcorp.com/full-stack-dev',
    status: 'approved' as const
  },
  {
    title: 'Android/Kotlin Developer Internship',
    company: 'MobileSoft Inc',
    description: 'Join our mobile development team and work on real Android applications. You will learn modern app architecture, Kotlin programming, and Firebase integration. Perfect for B.Tech students passionate about mobile development.',
    type: 'Internship' as const,
    skills: ['Kotlin', 'Android Studio', 'Firebase', 'REST APIs', 'Git', 'Jetpack Compose'],
    location: 'Remote',
    salary: '15,000-20,000/month',
    applyUrl: 'https://careers.mobilesoft.com/android-intern',
    status: 'approved' as const
  },
  {
    title: 'Data Science & ML - B.Tech Specialization Track',
    company: 'DataSystems Ltd',
    description: 'Start your data science journey with us. Work on real-world datasets, build predictive models, and learn machine learning best practices. Ideal for B.Tech students with interest in mathematics and programming.',
    type: 'Full-time' as const,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'SQL', 'Statistics', 'Scikit-learn'],
    location: 'Hyderabad, India',
    salary: '6-8 LPA',
    applyUrl: 'https://careers.datasystems.com/ml-developer',
    status: 'approved' as const
  },
  {
    title: 'DevOps & Cloud Engineering - Fresh Graduate',
    company: 'CloudTech Systems',
    description: 'Build and maintain cloud infrastructure for enterprise applications. Learn containerization, orchestration, and CI/CD pipelines. Perfect for B.Tech graduates interested in infrastructure and automation.',
    type: 'Full-time' as const,
    skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Terraform', 'Jenkins', 'Python'],
    location: 'Pune, India',
    salary: '5.5-7.5 LPA',
    applyUrl: 'https://careers.cloudtech.com/devops',
    status: 'approved' as const
  },
  {
    title: 'UI/UX & Frontend Development - B.Tech Fresh Grad',
    company: 'DesignFlow Studios',
    description: 'Create beautiful and responsive user interfaces for web and mobile applications. Work with React, learn design principles, and collaborate with product teams. Ideal for creative B.Tech graduates with design aptitude.',
    type: 'Full-time' as const,
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'UI/UX Design', 'Figma', 'JavaScript', 'CSS3'],
    location: 'Mumbai, India',
    salary: '5-6.5 LPA',
    applyUrl: 'https://careers.designflow.com/frontend-ux',
    status: 'approved' as const
  }
];

async function seedDemoOpportunities() {
  try {
    await connectDatabase();
    console.log('Connected to MongoDB');

    // Find or create an admin/company user to post opportunities
    let adminUser = await User.findOne({ email: 'admin@careerconnect.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'CareerConnect Admin',
        email: 'admin@careerconnect.com',
        password: 'AdminPassword@123',
        role: 'admin',
        bio: 'Official administrator for CareerConnect platform'
      });
      console.log('Created admin user for opportunities');
    }

    // Clear existing demo opportunities
    await Opportunity.deleteMany({ 
      company: { $in: ['TechCorp India', 'MobileSoft Inc', 'DataSystems Ltd', 'CloudTech Systems', 'DesignFlow Studios'] }
    });
    console.log('Cleared existing demo opportunities');

    // Add postedBy field to each opportunity
    const opportunities = demoOpportunities.map(opp => ({
      ...opp,
      postedBy: adminUser!._id
    }));

    // Insert new opportunities
    const insertedOpportunities = await Opportunity.insertMany(opportunities);
    console.log(`✅ Successfully seeded ${insertedOpportunities.length} demo opportunities!`);

    insertedOpportunities.forEach((opp, idx) => {
      console.log(`   ${idx + 1}. ${opp.title} at ${opp.company}`);
      console.log(`      Skills: ${opp.skills.join(', ')}`);
      console.log(`      Location: ${opp.location} | Salary: ${opp.salary}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDemoOpportunities();
