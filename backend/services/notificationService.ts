import User, { UserRole } from '../models/User';
import Booking from '../models/Booking';
import Hotel from '../models/Hotel';

export class NotificationService {
  /**
   * Notifies all hotel owners about a new booking available in the shared pool.
   */
  static async notifyOwnersAboutSharedBooking(booking: any) {
    try {
      // Find all users with the HOTEL_OWNER role
      const owners = await User.findAll();
      const hotelOwners = owners.filter((u: any) => u.role === UserRole.HOTEL_OWNER);
      
      const hotel = await Hotel.findByPk(booking.hotelId);
      const businessName = hotel?.businessName || hotel?.name || 'A property';

      console.log(`\n--- [SYSTEM NOTIFICATION: BOOKING POOL ALERT] ---`);
      console.log(`Alerting ${hotelOwners.length} hotel owners about a new shared booking.`);
      
      hotelOwners.forEach((owner: any) => {
        // Here we would integrate with an SMTP service (SendGrid, Mailgun, etc.)
        // For now, we simulate the email logic.
        console.log(`[EMAIL SENDING] To: ${owner.email}`);
        console.log(`Subject: New Booking Opportunity in Pool!`);
        console.log(`Body: Hello ${owner.name}, a new booking for ${businessName} has been shared to the pool. Check your dashboard to accept it.`);
      });
      
      console.log(`--- [END NOTIFICATION] ---\n`);
      
      return true;
    } catch (error) {
      console.error('Failed to send pool notifications:', error);
      return false;
    }
  }

  /**
   * Notifies a service provider about a new service request from a customer.
   */
  static async notifyProviderAboutRequest(provider: any, service: any, customer: any) {
    try {
      console.log(`\n--- [SYSTEM NOTIFICATION: SERVICE REQUEST] ---`);
      console.log(`Alerting Service Provider: ${provider.name} (${provider.email})`);
      console.log(`[EMAIL SENDING] To: ${provider.email}`);
      console.log(`Subject: New Service Request for ${service.name}`);
      console.log(`Body: Hello ${provider.name}, ${customer.name} has requested your service "${service.name}". Please log in to your dashboard to view the details and respond.`);
      console.log(`--- [END NOTIFICATION] ---\n`);
      return true;
    } catch (error) {
      console.error('Failed to send service request notification:', error);
      return false;
    }
  }

  /**
   * Notifies the customer that their service request has been sent successfully.
   */
  static async notifyCustomerAboutRequestConfirmation(customer: any, service: any) {
    try {
      console.log(`\n--- [SYSTEM NOTIFICATION: REQUEST CONFIRMATION] ---`);
      console.log(`[EMAIL SENDING] To: ${customer.email}`);
      console.log(`Subject: Your Request for ${service.name}`);
      console.log(`Body: Hello ${customer.name}, your request for "${service.name}" has been sent. The provider will review it and get back to you shortly.`);
      console.log(`--- [END NOTIFICATION] ---\n`);
      return true;
    } catch (error) {
      console.error('Failed to send request confirmation:', error);
      return false;
    }
  }
}
