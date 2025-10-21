import { Training } from '../src/models/Training';
import { connectDatabase } from '../src/config/mongodb';

const seedTrainings = async () => {
  await connectDatabase();

  const trainingsData = [
    {
      title: 'React Advanced Patterns',
      description: 'Master advanced React patterns including hooks, context API, and performance optimization.',
      provider: 'Udemy',
      skills: ['React', 'JavaScript', 'Frontend'],
      level: 'advanced',
      duration: 24,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      price: 49.99,
      url: 'https://www.udemy.com/course/react-advanced',
      logoUrl: 'https://i.pravatar.cc/150?img=1',
      rating: 4.8
    },
    {
      title: 'Full Stack JavaScript Bootcamp',
      description: 'Learn full-stack development with Node.js, Express, React, and MongoDB.',
      provider: 'Coursera',
      skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
      level: 'intermediate',
      duration: 40,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      price: 39.99,
      url: 'https://www.coursera.org/courses/javascript',
      logoUrl: 'https://i.pravatar.cc/150?img=2',
      rating: 4.6
    },
    {
      title: 'Python for Data Science',
      description: 'Explore Python libraries for data analysis, visualization, and machine learning.',
      provider: 'DataCamp',
      skills: ['Python', 'Data Science', 'Pandas'],
      level: 'beginner',
      duration: 20,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      price: 29.99,
      url: 'https://www.datacamp.com/courses/python',
      logoUrl: 'https://i.pravatar.cc/150?img=3',
      rating: 4.7
    },
    {
      title: 'TypeScript Essentials',
      description: 'Learn TypeScript from scratch. Covers types, interfaces, generics, and decorators.',
      provider: 'Pluralsight',
      skills: ['TypeScript', 'JavaScript'],
      level: 'beginner',
      duration: 16,
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      price: 44.99,
      url: 'https://www.pluralsight.com/courses/typescript',
      logoUrl: 'https://i.pravatar.cc/150?img=4',
      rating: 4.9
    },
    {
      title: 'AWS Solutions Architect Associate',
      description: 'Prepare for AWS SAA certification. Covers EC2, S3, Lambda, RDS, and more.',
      provider: 'A Cloud Guru',
      skills: ['AWS', 'Cloud', 'DevOps'],
      level: 'intermediate',
      duration: 35,
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      price: 59.99,
      url: 'https://acloudguru.com/courses/aws-saa',
      logoUrl: 'https://i.pravatar.cc/150?img=5',
      rating: 4.8
    },
    {
      title: 'Docker & Kubernetes Mastery',
      description: 'Master containerization with Docker and orchestration with Kubernetes.',
      provider: 'Udemy',
      skills: ['Docker', 'Kubernetes', 'DevOps'],
      level: 'advanced',
      duration: 32,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      price: 54.99,
      url: 'https://www.udemy.com/course/docker-kubernetes',
      logoUrl: 'https://i.pravatar.cc/150?img=6',
      rating: 4.7
    },
    {
      title: 'Machine Learning with TensorFlow',
      description: 'Build ML models using TensorFlow. Covers neural networks, CNNs, and RNNs.',
      provider: 'Coursera',
      skills: ['Machine Learning', 'TensorFlow', 'Python'],
      level: 'advanced',
      duration: 45,
      startDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      price: 49.99,
      url: 'https://www.coursera.org/specializations/tensorflow',
      logoUrl: 'https://i.pravatar.cc/150?img=7',
      rating: 4.6
    },
    {
      title: 'Web Performance Optimization',
      description: 'Learn techniques to optimize web performance: lazy loading, code splitting, caching.',
      provider: 'LinkedIn Learning',
      skills: ['Frontend', 'Performance', 'JavaScript'],
      level: 'intermediate',
      duration: 12,
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      price: 19.99,
      url: 'https://www.linkedin.com/learning/web-performance',
      logoUrl: 'https://i.pravatar.cc/150?img=8',
      rating: 4.5
    },
    {
      title: 'GraphQL Complete Guide',
      description: 'Build APIs with GraphQL. Covers queries, mutations, subscriptions, and Apollo.',
      provider: 'Udemy',
      skills: ['GraphQL', 'Backend', 'Node.js'],
      level: 'intermediate',
      duration: 28,
      startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      price: 44.99,
      url: 'https://www.udemy.com/course/graphql',
      logoUrl: 'https://i.pravatar.cc/150?img=9',
      rating: 4.8
    },
    {
      title: 'Mobile App Dev with React Native',
      description: 'Build iOS and Android apps with React Native. Live coding included.',
      provider: 'egghead.io',
      skills: ['React Native', 'Mobile', 'JavaScript'],
      level: 'intermediate',
      duration: 22,
      startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      price: 34.99,
      url: 'https://egghead.io/courses/react-native',
      logoUrl: 'https://i.pravatar.cc/150?img=10',
      rating: 4.7
    }
  ];

  try {
    for (const training of trainingsData) {
      const existing = await Training.findOne({ title: training.title });
      if (!existing) {
        await Training.create(training);
        console.log(`✓ Seeded training: ${training.title}`);
      }
    }
    console.log('Training seed completed!');
    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding trainings:', error.message);
    process.exit(1);
  }
};

seedTrainings();
