import { PrismaClient } from '@prisma/client';

// Single shared client so the app uses one connection pool
const prisma = new PrismaClient();

export default prisma;
