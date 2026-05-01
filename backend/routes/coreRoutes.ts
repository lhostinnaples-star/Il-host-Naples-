import { Router } from 'express';
import { createHotel, getAllHotels, getMyHotels, getHotelById, updateHotel } from '../controllers/hotelController';
import { createRoom, getRoomsByHotel } from '../controllers/roomController';
import { createBooking, getMyBookings, cancelBooking, updateBookingStatus, getOwnerBookings, getAllBookings, shareBooking, acceptBooking, closeBooking, getSharedPool, releaseBooking } from '../controllers/bookingController';
import { createReview, getHotelReviews } from '../controllers/reviewController';
import { createService, getAllServices, getMyServices, requestService, getProviderRequests, updateRequestStatus } from '../controllers/serviceController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Hotel Routes
router.get('/hotels', getAllHotels);
router.get('/hotels/my', authenticate, authorize(UserRole.HOTEL_OWNER, UserRole.ADMIN), getMyHotels);
router.get('/hotels/:id', getHotelById);
router.post('/hotels', authenticate, authorize(UserRole.HOTEL_OWNER, UserRole.ADMIN), createHotel);
router.put('/hotels/:id', authenticate, authorize(UserRole.HOTEL_OWNER, UserRole.ADMIN), updateHotel);

// Room Routes
router.get('/rooms/hotel/:hotelId', getRoomsByHotel);
router.post('/rooms', authenticate, authorize(UserRole.HOTEL_OWNER, UserRole.ADMIN), createRoom);

// Booking Routes
router.post('/bookings', authenticate, createBooking);
router.get('/bookings/my', authenticate, getMyBookings);
router.put('/bookings/:id/cancel', authenticate, cancelBooking);
router.put('/bookings/:id/status', authenticate, authorize(UserRole.HOTEL_OWNER, UserRole.ADMIN), updateBookingStatus);
router.get('/bookings/owner', authenticate, authorize(UserRole.HOTEL_OWNER, UserRole.ADMIN), getOwnerBookings);
router.get('/bookings/all', authenticate, authorize(UserRole.ADMIN), getAllBookings);

// Shared Pool Routes
router.get('/bookings/pool', authenticate, authorize(UserRole.HOTEL_OWNER), getSharedPool);
router.put('/bookings/:id/share', authenticate, authorize(UserRole.HOTEL_OWNER), shareBooking);
router.put('/bookings/:id/accept', authenticate, authorize(UserRole.HOTEL_OWNER), acceptBooking);
router.put('/bookings/:id/close', authenticate, authorize(UserRole.HOTEL_OWNER), closeBooking);
router.put('/bookings/:id/release', authenticate, authorize(UserRole.HOTEL_OWNER), releaseBooking);

// Review Routes
router.post('/reviews', authenticate, createReview);
router.get('/reviews/:hotelId', getHotelReviews);

// Service Routes
router.post('/services', authenticate, authorize(UserRole.SERVICE_PROVIDER), createService);
router.get('/services', getAllServices);
router.get('/services/my', authenticate, authorize(UserRole.SERVICE_PROVIDER), getMyServices);
router.post('/services/request', authenticate, requestService);
router.get('/services/requests', authenticate, authorize(UserRole.SERVICE_PROVIDER), getProviderRequests);
router.put('/services/requests/:id', authenticate, authorize(UserRole.SERVICE_PROVIDER), updateRequestStatus);

export default router;
