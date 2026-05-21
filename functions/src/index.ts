import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import {
  welcomeEmailTemplate,
  pendingApprovalTemplate,
  newUserAdminTemplate,
  accountApprovedTemplate,
  accountRejectedTemplate,
  bookingReceivedTemplate,
  newBookingListerTemplate,
  bookingConfirmedTemplate,
  bookingCancelledTemplate,
  serviceRequestTemplate
} from './templates';

admin.initializeApp();

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

// 1. User Registration
export const onUserCreated = functions.firestore
  .document('users/{uid}')
  .onCreate(async (snap) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured');
      return;
    }
    const user = snap.data();
    
    if (user.role === 'customer') {
      // Welcome email to customer
      await transporter.sendMail({
        from: 'noreply@lhostinnaples.com',
        to: user.email,
        subject: 'Welcome to Il Host in Naples!',
        html: welcomeEmailTemplate(user.name)
      });
    } else {
      // Pending approval email
      await transporter.sendMail({
        from: 'noreply@lhostinnaples.com',
        to: user.email,
        subject: 'Application Received',
        html: pendingApprovalTemplate(user.name)
      });
      // Notify admin
      await transporter.sendMail({
        from: 'admin@lhostinnaples.com',
        to: 'admin@lhostinnaples.com',
        subject: 'New User Registration',
        html: newUserAdminTemplate(user)
      });
    }
  });

// 2. User Approved/Rejected
export const onUserUpdated = functions.firestore
  .document('users/{uid}')
  .onUpdate(async (change) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured');
      return;
    }
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status !== after.status) {
      if (after.status === 'ACTIVE') {
        await transporter.sendMail({
          from: 'noreply@lhostinnaples.com',
          to: after.email,
          subject: 'Account Approved!',
          html: accountApprovedTemplate(after.name)
        });
      }
      if (after.status === 'REJECTED') {
        await transporter.sendMail({
          from: 'noreply@lhostinnaples.com',
          to: after.email,
          subject: 'Application Update',
          html: accountRejectedTemplate(after.name)
        });
      }
    }
  });

// 3. Booking Created
export const onBookingCreated = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured');
      return;
    }
    const booking = snap.data();
    
    if (booking.guestEmail) {
      // Email to guest
      await transporter.sendMail({
        from: 'bookings@lhostinnaples.com',
        to: booking.guestEmail,
        subject: 'Booking Request Received',
        html: bookingReceivedTemplate(booking)
      });
    }
    
    if (booking.listerEmail) {
      // Email to lister
      await transporter.sendMail({
        from: 'bookings@lhostinnaples.com',
        to: booking.listerEmail,
        subject: 'New Booking Request',
        html: newBookingListerTemplate(booking)
      });
    }
  });

// 4. Booking Status Changed
export const onBookingUpdated = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured');
      return;
    }
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status !== after.status) {
      if (after.status === 'CONFIRMED' && after.guestEmail) {
        await transporter.sendMail({
          from: 'bookings@lhostinnaples.com',
          to: after.guestEmail,
          subject: 'Booking Confirmed!',
          html: bookingConfirmedTemplate(after)
        });
      }
      if (after.status === 'CANCELLED' && after.guestEmail) {
        await transporter.sendMail({
          from: 'bookings@lhostinnaples.com',
          to: after.guestEmail,
          subject: 'Booking Cancelled',
          html: bookingCancelledTemplate(after)
        });
      }
    }
  });

// 5. Supplier Service Request
export const onServiceRequest = functions.firestore
  .document('global_requests/{requestId}')
  .onCreate(async (snap) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured');
      return;
    }
    const request = snap.data();
    
    // Get all suppliers
    const suppliersSnapshot = await admin
      .firestore()
      .collection('users')
      .where('role', '==', 'supplier')
      .where('status', '==', 'ACTIVE')
      .get();
    
    // Email all suppliers
    const emailPromises = suppliersSnapshot.docs
      .map(doc => {
        const supplier = doc.data();
        if (supplier.email) {
          return transporter.sendMail({
            from: 'suppliers@lhostinnaples.com',
            to: supplier.email,
            subject: 'New Service Request',
            html: serviceRequestTemplate(request)
          });
        }
        return Promise.resolve();
      });
    
    await Promise.all(emailPromises);
  });
