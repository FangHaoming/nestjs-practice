// Initialize MongoDB for NestJS Practice
db = db.getSiblingDB('nestjs_practice');

// Create collections and insert sample data
db.users.insertMany([
  {
    email: 'admin@example.com',
    password: '$2b$10$example_hashed_password',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'user@example.com',
    password: '$2b$10$example_hashed_password',
    firstName: 'Regular',
    lastName: 'User',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.posts.insertMany([
  {
    title: 'MongoDB First Post',
    content: 'This is content of first MongoDB post',
    excerpt: 'First MongoDB post excerpt',
    authorId: 1,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'MongoDB Second Post',
    content: 'This is content of second MongoDB post',
    excerpt: 'Second MongoDB post excerpt',
    authorId: 2,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.posts.createIndex({ authorId: 1 });
db.posts.createIndex({ title: 'text', content: 'text' });

print('MongoDB initialization completed successfully!');