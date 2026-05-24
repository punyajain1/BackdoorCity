import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const app = express();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Get all cities
app.get('/api/cities', async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      include: {
        _count: { select: { spots: true } }
      }
    });

    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    // In a real app you might want spot counts per category relative to a city
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch spots, optionally filtered by cityId and categoryId
app.get('/api/spots', async (req, res) => {
  try {
    const { cityId, categoryId } = req.query;

    let whereClause: any = {};
    if (cityId) whereClause.cityId = String(cityId);
    if (categoryId) whereClause.categoryId = String(categoryId);

    const spots = await prisma.spot.findMany({
      where: whereClause,
      include: {
        reviews: true,
        category: true,
        city: true,
        _count: { select: { votes: true } }
      },
    });

    // Formatting it nicely for frontend (tallying votes as simple integer)
    const formatted = spots.map((s: typeof spots[number]) => ({
      ...s,
      votes: s._count.votes,
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new spot
app.post('/api/spots', async (req, res) => {
  try {
    const { name, area, locationUrl, cityId, categoryId, time, price, description, submitterEmail, submitterHandle } = req.body;
    // OTP verification would hypothetically happen before this step

    const newSpot = await prisma.spot.create({
      data: {
        name,
        area,
        locationUrl,
        cityId,
        categoryId,
        time,
        price,
        description,
        submitterEmail: submitterEmail || 'anonymous@example.com',
        submitterHandle: submitterHandle || 'anonymous',
        verified: false,
        tags: []
      }
    });

    res.json(newSpot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create spot' });
  }
});

// Create a new review
app.post('/api/reviews', async (req, res) => {
  try {
    const { text, spotId, submitterEmail, submitterHandle } = req.body;

    if (!text || !spotId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newReview = await prisma.review.create({
      data: {
        text,
        spotId,
        submitterEmail: submitterEmail || 'anonymous@example.com',
        submitterHandle: submitterHandle || 'anonymous'
      }
    });

    res.json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Submit an upvote (Anonymous)
app.post('/api/spots/:spotId/upvote', async (req, res) => {
  try {
    const { spotId } = req.params;

    // Generate a random email just to satisfy the database schema
    const anonEmail = `anon_${Date.now()}_${Math.floor(Math.random() * 10000)}@anonymous.com`;

    const vote = await prisma.vote.create({
      data: { spotId, email: anonEmail }
    });

    res.json(vote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// Remove an upvote / Downvote (Anonymous)
app.post('/api/spots/:spotId/downvote', async (req, res) => {
  try {
    const { spotId } = req.params;

    // Find any one existing vote for this spot and delete it
    const vote = await prisma.vote.findFirst({
      where: { spotId }
    });

    if (vote) {
      await prisma.vote.delete({
        where: { id: vote.id }
      });
      return res.json({ success: true, message: 'Vote removed' });
    }

    res.json({ success: true, message: 'No votes to remove' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to downvote' });
  }
});

// Edit an existing spot (partial update)
// NOTE: Email verification via OTP is required but currently DISABLED.
// When auth is enabled, verify that `submitterEmail` matches the original spot's submitterEmail
// before allowing the update to go through.
app.patch('/api/spots/:spotId', async (req, res) => {
  try {
    const { spotId } = req.params;
    const { name, area, locationUrl, categoryId, time, price, description, submitterHandle, tags, verified, submitterEmail } = req.body;

    // ── EMAIL VERIFICATION (DISABLED) ──────────────────────────────────────
    // TODO: Enable this block once OTP auth is live
    //
    // const spot = await prisma.spot.findUnique({ where: { id: spotId } });
    // if (!spot) return res.status(404).json({ error: 'Spot not found' });
    // if (spot.submitterEmail !== submitterEmail) {
    //   return res.status(403).json({ error: 'Email does not match original submitter' });
    // }
    // ───────────────────────────────────────────────────────────────────────

    // Only include fields that were actually provided in the request
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (area !== undefined) updateData.area = area;
    if (locationUrl !== undefined) updateData.locationUrl = locationUrl;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (time !== undefined) updateData.time = time;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (submitterHandle !== undefined) updateData.submitterHandle = submitterHandle;
    if (tags !== undefined) updateData.tags = tags;
    if (verified !== undefined) updateData.verified = verified;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update' });
    }

    const updatedSpot = await prisma.spot.update({
      where: { id: spotId },
      data: updateData,
      include: {
        reviews: true,
        category: true,
        city: true,
        _count: { select: { votes: true } }
      }
    });

    res.json({ ...updatedSpot, votes: updatedSpot._count.votes });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Spot not found' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to update spot' });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});