import { Request, Response } from 'express';
import Booking, { BookingStatus } from '../models/Booking';
import Room from '../models/Room';
import Hotel from '../models/Hotel';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { hotelId, roomId, checkIn, checkOut, totalPrice: providedTotalPrice, extraServices, guests } = req.body;
    
    // Date Validation
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (outDate <= inDate) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    let roomPrice = 0;
    let businessName = 'Lhost Naples';
    let ownerEmail = 'host@example.com';
    
    if (roomId) {
      const room = await Room.findByPk(roomId);
      if (room) {
        roomPrice = room.price;
        const hotel = await Hotel.findByPk(room.hotelId);
        if (hotel) {
          businessName = hotel.businessName || hotel.name;
          ownerEmail = hotel.owner?.email || ownerEmail;
        }
      }
    } else if (hotelId) {
      const hotel = await Hotel.findByPk(hotelId);
      if (hotel) {
        roomPrice = hotel.price;
        businessName = hotel.businessName || hotel.name;
        ownerEmail = hotel.owner?.email || ownerEmail;
      }
    }

    // Calculate Price if not provided
    const days = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalPrice = providedTotalPrice || (days * roomPrice);

    const booking = await Booking.create({
      userId: req.user!.id,
      hotelId,
      roomId,
      checkIn,
      checkOut,
      totalPrice,
      guests: guests || 2,
      extraServices: extraServices || [],
      status: BookingStatus.PENDING
    });

    // Update hotel's unavailableDates
    if (hotelId) {
      const hotel = await Hotel.findByPk(hotelId);
      if (hotel) {
        const newUnavailableDates = [...(hotel.unavailableDates || [])];
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateString = d.toISOString().split('T')[0];
          if (!newUnavailableDates.includes(dateString)) {
            newUnavailableDates.push(dateString);
          }
        }
        await Hotel.update(hotelId, { unavailableDates: newUnavailableDates });
      }
    }

    // Simulate sending emails
    console.log(`[EMAIL SIMULATION] To Guest (${req.user!.email}): Thank you for your inquiry for ${businessName}. The host will contact you soon. Host contact: ${ownerEmail}`);
    console.log(`[EMAIL SIMULATION] To Host (${ownerEmail}): New inquiry from ${req.user!.name} (${req.user!.email}) for ${businessName}. Services requested: ${extraServices?.join(', ') || 'None'}`);

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Inquiry submission failed' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    if (booking.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
    }

    const updated = await Booking.update(req.params.id, { status: BookingStatus.CANCELLED });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Check if user is the owner of the hotel
    if (booking.Room?.Hotel?.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to manage this booking' });
    }

    const updated = await Booking.update(req.params.id, { status });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

export const shareBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Check if user is the owner
    const hotelId = booking.hotelId;
    const hotel = await Hotel.findByPk(hotelId);
    if (hotel?.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to share this booking' });
    }

    const updated = await Booking.update(req.params.id, { 
      status: BookingStatus.SHARED,
      sharedAt: new Date()
    });

    // Notify all owners about the new pool item
    NotificationService.notifyOwnersAboutSharedBooking(booking).catch(err => {
      console.error('Non-blocking notification error:', err);
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to share booking' });
  }
};

export const acceptBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status !== BookingStatus.SHARED) {
      return res.status(400).json({ error: 'Booking is no longer available in the pool' });
    }

    // A lister cannot accept their own shared booking
    const hotel = await Hotel.findByPk(booking.hotelId);
    if (hotel?.ownerId === req.user!.id) {
       return res.status(400).json({ error: 'You cannot accept your own shared booking' });
    }

    const updated = await Booking.update(req.params.id, { 
      status: BookingStatus.ACCEPTED,
      acceptedBy: req.user!.id,
      acceptedAt: new Date()
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept booking' });
  }
};

export const closeBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.acceptedBy !== req.user!.id && booking.Room?.Hotel?.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to close this booking' });
    }

    const updated = await Booking.update(req.params.id, { status: BookingStatus.CONFIRMED });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to close booking' });
  }
};

export const releaseBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.acceptedBy !== req.user!.id) {
      return res.status(403).json({ error: 'Only the person who accepted can release it' });
    }

    const updated = await Booking.update(req.params.id, { 
      status: BookingStatus.SHARED,
      acceptedBy: null,
      acceptedAt: null
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to release booking' });
  }
};

export const getSharedPool = async (req: AuthRequest, res: Response) => {
  try {
    const allBookings = await Booking.findAll({ where: { status: BookingStatus.SHARED } });
    
    // Mask user details for the pool
    const maskedBookings = allBookings.map((b: any) => {
      // In a real app, we would exclude sensitive fields
      const { userId, ...rest } = b;
      return {
        ...rest,
        isShared: true,
        userName: 'Private Details',
        userEmail: 'Visible after acceptance'
      };
    });

    res.json(maskedBookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared pool' });
  }
};

export const getOwnerBookings = async (req: AuthRequest, res: Response) => {
  try {
    const allBookings = await Booking.findAll({ where: {} });
    // Show bookings owned by hotel OR accepted from pool
    const ownerBookings = allBookings.filter((b: any) => 
      b.Room?.Hotel?.ownerId === req.user!.id || b.acceptedBy === req.user!.id
    );
    
    // Check for 6-hour timeout on accepted bookings
    const now = new Date();
    const updatedBookings = await Promise.all(ownerBookings.map(async (b: any) => {
      if (b.status === BookingStatus.ACCEPTED && b.acceptedAt) {
        const acceptedDate = new Date(b.acceptedAt);
        const diffInHours = (now.getTime() - acceptedDate.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours >= 6) {
          // Revert to SHARED status
          await Booking.update(b.id, { 
            status: BookingStatus.SHARED,
            acceptedBy: null,
            acceptedAt: null
          });
          return null; // This will be filtered out
        }
      }
      return b;
    }));

    const validBookings = updatedBookings.filter(b => b !== null);

    // Enhance with user details
    const users = await User.findAll();
    const ownerBookingsWithUsers = validBookings.map((b: any) => ({
      ...b,
      User: users.find((u: any) => u.id === b.userId)
    }));

    res.json(ownerBookingsWithUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch owner bookings' });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.findAll({ where: {} });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all bookings' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user!.id },
      include: [{ model: Room, include: [Hotel] }]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};
