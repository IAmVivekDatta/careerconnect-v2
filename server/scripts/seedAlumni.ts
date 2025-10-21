import { User } from '../src/models/User';
import { connectDatabase } from '../src/config/mongodb';

const seedAlumni = async () => {
  await connectDatabase();

  const alumniData = [
    {
      name: 'Alice Johnson',
      email: 'alice.johnson@alumni.com',
      password: 'temp1234', // Will be hashed
      role: 'alumni',
      skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
      bio: 'Senior Frontend Engineer at Tech Corp. Passionate about React and scalable architectures.',
      profilePicture: 'https://i.pravatar.cc/150?img=1'
    },
    {
      name: 'Bob Smith',
      email: 'bob.smith@alumni.com',
      password: 'temp1234',
      role: 'alumni',
      skills: ['Python', 'Django', 'AWS', 'PostgreSQL'],
      bio: 'Backend specialist with 5 years of experience in cloud infrastructure.',
      profilePicture: 'https://i.pravatar.cc/150?img=2'
    },
    {
      name: 'Carol Davis',
      email: 'carol.davis@alumni.com',
      password: 'temp1234',
      role: 'alumni',
      skills: ['Machine Learning', 'Python', 'TensorFlow', 'Data Analysis'],
      bio: 'ML Engineer at AI Innovations. Focused on NLP and computer vision.',
      profilePicture: 'https://i.pravatar.cc/150?img=3'
    },
    {
      name: 'David Lee',
      email: 'david.lee@alumni.com',
      password: 'temp1234',
      role: 'alumni',
      skills: ['React', 'Vue.js', 'CSS', 'UI/UX Design'],
      bio: 'Full-stack developer with a passion for beautiful interfaces.',
      profilePicture: 'https://i.pravatar.cc/150?img=4'
    },
    {
      name: 'Emma Wilson',
      email: 'emma.wilson@alumni.com',
      password: 'temp1234',
      role: 'alumni',
      skills: ['Node.js', 'Express', 'GraphQL', 'MongoDB'],
      bio: 'Backend engineer specializing in RESTful and GraphQL APIs.',
      profilePicture: 'https://i.pravatar.cc/150?img=5'
    },
    {
      name: 'Frank Martinez',
      email: 'frank.martinez@alumni.com',
      password: 'temp1234',
      role: 'alumni',
      skills: ['DevOps', 'Docker', 'Kubernetes', 'CI/CD'],
      bio: 'DevOps engineer helping teams scale their infrastructure.',
      profilePicture: 'https://i.pravatar.cc/150?img=6'
    },
    {
      name: 'Grace Chen',
      email: 'grace.chen@alumni.com',
      password: 'temp1234',
      role: 'alumni',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      bio: 'Full-stack JavaScript developer. Currently building at a startup.',
      profilePicture: 'https://i.pravatar.cc/150?img=7'
    },
    {
      name: 'Henry Brown',
      email: 'henry.brown@alumni.com',
      password: 'temp1234',
      role: 'alumni',
      skills: ['Java', 'Spring Boot', 'Microservices', 'AWS'],
      bio: 'Enterprise architect with 8 years in Java ecosystems.',
      profilePicture: 'https://i.pravatar.cc/150?img=8'
    },
    {
      name: 'Iris Taylor',
      email: 'iris.taylor@alumni.com',
      password: 'temp1234',
      role: 'alumni',
      skills: ['Product Management', 'Data Analytics', 'SQL', 'A/B Testing'],
      bio: 'Product manager at FinTech startup. Passionate about data-driven decisions.',
      profilePicture: 'https://i.pravatar.cc/150?img=9'
    },
    {
      name: 'Jack Anderson',
      email: 'jack.anderson@alumni.com',
      password: 'temp1234',
      role: 'alumni',
      skills: ['Mobile Development', 'React Native', 'Swift', 'Kotlin'],
      bio: 'Mobile engineer shipping apps on iOS and Android.',
      profilePicture: 'https://i.pravatar.cc/150?img=10'
    }
  ];

  try {
    for (const alumni of alumniData) {
      const existing = await User.findOne({ email: alumni.email });
      if (!existing) {
        await User.create(alumni);
        console.log(`✓ Seeded alumni: ${alumni.name}`);
      }
    }
    console.log('Alumni seed completed!');
    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding alumni:', error.message);
    process.exit(1);
  }
};

seedAlumni();
