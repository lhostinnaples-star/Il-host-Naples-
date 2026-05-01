import { Request, Response } from 'express';
import Room from '../models/Room';
import Hotel from '../models/Hotel';
import { AuthRequest } from '../middleware/auth';

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { hotelId, type, price, capacity, description } = req.body;
    
    // Check if user owns the hotel
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel || hotel.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to add rooms to this hotel' });
    }

    const room = await Room.create({ hotelId, type, price, capacity, description });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const getRoomsByHotel = async (req: Request, res: Response) => {
  try {
    const rooms = await Room.findAll({ where: { hotelId: req.params.hotelId } });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};
