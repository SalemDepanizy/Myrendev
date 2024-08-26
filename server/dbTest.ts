import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize Prisma Client
const client = new PrismaClient();

async function testDatabaseConnection() {
  try {
    // Attempt to run a raw SQL query
    const result = await client.$queryRaw`SELECT 1`;
    console.log('Database connection test successful:', result);
  } catch (error) {
    console.error('Database connection test failed:', error);
  } finally {
    // Disconnect the client
    await client.$disconnect();
  }
}

testDatabaseConnection();
