import { Response } from 'express';
import Review from '../models/Review';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { hotelId, rating, comment } = req.body;
    
    if (!hotelId || !rating) {
      return res.status(400).json({ error: 'Hotel ID and rating are required' });
    }

    const review = await Review.create({
      hotelId,
      userId: req.user!.id,
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date()
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
};

export const getHotelReviews = async (req: AuthRequest, res: Response) => {
  try {
    const hotelId = req.params.hotelId;
    const reviews = await Review.findAll({ where: { hotelId } });
    
    // Join with users for display names
    const users = await User.findAll();
    const reviewsWithUsers = reviews.map((r: any) => ({
      ...r,
      User: users.find((u: any) => u.id === r.userId)
    }));

    res.json(reviewsWithUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};
