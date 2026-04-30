import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const positiveReviews = [
  "Absolutely loved this place! The vibe is unmatched.",
  "Great experience, would highly recommend to anyone in the area.",
  "A hidden gem for sure. Loved the aesthetics.",
  "Good spot, but gets a bit crowded on weekends.",
  "The ambiance is fantastic, perfect for an evening out.",
  "One of my favorite spots in the city now!",
  "Amazing! Definitely coming back.",
  "Very cozy and welcoming environment.",
  "Loved it! The aesthetic is really nice and Instagrammable.",
  "Such a great find! I can't believe I didn't know about this sooner.",
  "10/10 would recommend. The energy here is just right.",
  "A perfect spot to hang out and relax."
];

const handles = [
  { handle: '@wanderlust_delhi', email: 'wander@example.com' },
  { handle: '@foodie_ninja', email: 'ninja@example.com' },
  { handle: '@local_explorer', email: 'explorer@example.com' },
  { handle: '@chill_vibes', email: 'vibes@example.com' },
  { handle: '@weekend_warrior', email: 'warrior@example.com' },
  { handle: '@delhi_diaries', email: 'diaries@example.com' },
  { handle: '@hidden_gems_hunter', email: 'hunter@example.com' },
  { handle: '@aesthetic_chaser', email: 'chaser@example.com' }
];

async function main() {
  const city = await prisma.city.findFirst({ where: { name: 'Delhi NCR' } });
  if (!city) {
    console.log("City not found");
    return;
  }

  const spots = await prisma.spot.findMany({ where: { cityId: city.id } });
  console.log(`Found ${spots.length} spots in Delhi. Inserting engagement...`);

  // Clear old reviews and votes for Delhi to prevent constraint issues
  await prisma.review.deleteMany({ where: { spot: { cityId: city.id } } });
  await prisma.vote.deleteMany({ where: { spot: { cityId: city.id } } });

  for (const spot of spots) {
    // 1 to 2 positive reviews
    const numReviews = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numReviews; i++) {
      const reviewText = positiveReviews[Math.floor(Math.random() * positiveReviews.length)]!;
      const user = handles[Math.floor(Math.random() * handles.length)]!;
      
      await prisma.review.create({
        data: {
          text: reviewText,
          spotId: spot.id,
          // Uniquify email slightly to avoid unique constraint if the same user is randomly picked
          submitterEmail: `${i}_${spot.id.substring(0,4)}_${user.email}`,
          submitterHandle: user.handle,
        }
      });
    }

    // 10 to 20 upvotes
    const numVotes = Math.floor(Math.random() * 11) + 10;
    for (let i = 0; i < numVotes; i++) {
      await prisma.vote.create({
        data: {
          spotId: spot.id,
          email: `voter_${i}_${spot.id.substring(0,5)}@example.com`,
        }
      });
    }
  }

  console.log("Done! Every spot now has unique randomized reviews and 10-20 upvotes.");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
