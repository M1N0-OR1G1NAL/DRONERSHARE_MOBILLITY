const mongoose = require('mongoose');

// Mock MongoDB connection for tests
beforeAll(async () => {
  // Use in-memory MongoDB or mock
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
  } else {
    // Mock connection
    mongoose.connect = jest.fn().mockResolvedValue(true);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
