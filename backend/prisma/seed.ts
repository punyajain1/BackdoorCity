import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // Seed Categories based on user provided image + requests
  const categoriesData = [
    { name: 'Food', icon: '🥘' },
    { name: 'Coffee', icon: '☕' },
    { name: 'Gyms', icon: '🏋️' },
    { name: 'Co Working', icon: '💻' },
    { name: 'Drinks?', icon: '🪩' },
    { name: 'Gedi Routes', icon: '🏎️' },
    { name: 'Date Plans', icon: '💐' },
    { name: 'Hidden Gems', icon: '💎' },
  ];

  await prisma.category.deleteMany(); // Reset for clean seed
  console.log('Inserted Categories...');
  for (const cat of categoriesData) {
    await prisma.category.create({ data: cat });
  }

  // Seed Cities
  const citiesData = [
    { name: 'Delhi NCR', icon: '🏙️' },
    { name: 'Mumbai', icon: '🌊' },
    { name: 'Bangalore', icon: '🌿' },
    { name: 'Pune', icon: '⛰️' },
    { name: 'Jaipur', icon: '🕌' },
    { name: 'Chandigarh', icon: '🌳' },
  ];

  await prisma.city.deleteMany(); // Reset for clean seed
  console.log('Inserted Cities...');
  for (const city of citiesData) {
    await prisma.city.create({ data: city });
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });