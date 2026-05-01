import { Request, Response } from 'express';
import Hotel from '../models/Hotel';
import User, { UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const createHotel = async (req: AuthRequest, res: Response) => {
  try {
    const { name, businessName, description, address, city, country, price, amenities, imageUrl, rooms, area, category, cirCode, cancellationPolicy, unavailableDates, extraServices, phoneNumber } = req.body;
    const hotel = await Hotel.create({
      name,
      businessName,
      description,
      address,
      city,
      country,
      price: Number(price) || 0,
      amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',').map((s: string) => s.trim()) : []),
      imageUrl,
      rooms: Array.isArray(rooms) ? rooms : [],
      area,
      category,
      cirCode,
      cancellationPolicy,
      unavailableDates: Array.isArray(unavailableDates) ? unavailableDates : [],
      extraServices: Array.isArray(extraServices) ? extraServices : [],
      phoneNumber,
      ownerId: req.user!.id
    });
    res.status(201).json(hotel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hotel' });
  }
};

export const updateHotel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findByPk(id);
    if (!hotel || hotel.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to update this hotel' });
    }

    const updatedHotel = await Hotel.update(id, {
      ...req.body,
      price: Number(req.body.price) || hotel.price,
    });
    res.json(updatedHotel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hotel' });
  }
};

export const getAllHotels = async (req: Request, res: Response) => {
  try {
    const { area } = req.query;
    let hotels = await Hotel.findAll({ include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }] });
    
    if (area) {
      hotels = hotels.filter((h: any) => h.area?.toLowerCase() === (area as string).toLowerCase());
    }
    
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
};

export const getMyHotels = async (req: AuthRequest, res: Response) => {
  try {
    const hotels = await Hotel.findAll({ where: { ownerId: req.user!.id } });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your hotels' });
  }
};

export const getHotelById = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id, { include: ['owner'] });
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotel details' });
  }
};
