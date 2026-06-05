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
      if (after.status === 'REJECTED' && after.guestEmail) {
        await transporter.sendMail({
          from: 'bookings@lhostinnaples.com',
          to: after.guestEmail,
          subject: 'Booking Request Update',
          html: `
            <div style="font-family:sans-serif;
            background:#0f172a;color:#fff;
            padding:32px;border-radius:12px">
              <h2 style="color:#F5A623">
                Booking Update
              </h2>
              <p>Dear ${after.customerName},</p>
              <p>Unfortunately your booking request 
              for <strong>${after.itemName}</strong> 
              could not be accommodated.</p>
              <p><strong>Dates:</strong> 
              ${after.startDate} - ${after.endDate}</p>
              <p>Please search for other available 
              properties in Naples.</p>
              <a href="https://lhostinnaples.com/search"
              style="background:#F5A623;color:#0f172a;
              padding:12px 24px;border-radius:8px;
              text-decoration:none;font-weight:bold">
                Search Properties
              </a>
            </div>
          `
        });
      }
      if (after.status === 'SHARED') {
        const listersSnapshot = await admin
          .firestore()
          .collection('users')
          .where('role', '==', 'hotel_owner')
          .where('status', '==', 'ACTIVE')
          .get();
        
        const emailPromises = listersSnapshot.docs
          .map(doc => {
            const lister = doc.data();
            return transporter.sendMail({
              from: 'noreply@lhostinnaples.com',
              to: lister.email,
              subject: '🏨 New Booking Available in Pool!',
              html: `
                <div style="font-family:sans-serif;
                background:#0f172a;color:#fff;
                padding:32px;border-radius:12px">
                  <h2 style="color:#F5A623">
                    New Booking in Sharing Pool
                  </h2>
                  <p>A new booking is available.</p>
                  <p><strong>Property Type:</strong> 
                  ${after.propertyType || 'Any'}</p>
                  <p><strong>Guest:</strong> 
                  ${after.customerName}</p>
                  <p><strong>Dates:</strong> 
                  ${after.startDate} - ${after.endDate}</p>
                  <p><strong>Guests:</strong> 
                  ${after.guests}</p>
                  <p><strong>Area:</strong> 
                  ${after.area || 'Naples'}</p>
                  <a href="https://lhostinnaples.com/shared-pool"
                  style="background:#F5A623;color:#0f172a;
                  padding:12px 24px;border-radius:8px;
                  text-decoration:none;font-weight:bold">
                    View Booking Pool
                  </a>
                </div>
              `
            });
          });
        await Promise.all(emailPromises);

        // Email admin
        await transporter.sendMail({
          from: 'admin@lhostinnaples.com',
          to: 'info@lhostinnaples.com',
          subject: 'Booking Shared to Pool',
          html: `
            <p><strong>Property:</strong> ${after.itemName}</p>
            <p><strong>Guest:</strong> ${after.customerName}</p>
            <p><strong>Dates:</strong> 
            ${after.startDate} - ${after.endDate}</p>
          `
        });
      }

      if (after.status === 'ACCEPTED') {
        if (after.acceptingListerEmail || after.ownerEmail) {
          await transporter.sendMail({
            from: 'bookings@lhostinnaples.com',
            to: after.acceptingListerEmail || after.ownerEmail,
            subject: '✅ Booking Successfully Claimed!',
            html: `
              <div style="font-family:sans-serif;
              background:#0f172a;color:#fff;
              padding:32px;border-radius:12px">
                <h2 style="color:#F5A623">
                  You claimed a booking!
                </h2>
                <p>You have 6 hours to contact 
                the guest and confirm.</p>
                <p><strong>Guest:</strong> 
                ${after.customerName}</p>
                <p><strong>Phone:</strong> 
                ${after.customerPhone}</p>
                <p><strong>Dates:</strong> 
                ${after.startDate} - 
                ${after.endDate}</p>
                <a href="https://lhostinnaples.com/owner"
                style="background:#F5A623;
                color:#0f172a;padding:12px 24px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold">
                  Go to Dashboard
                </a>
              </div>
            `
          });
        }

        // Email original lister
        if (after.originalListerEmail) {
          await transporter.sendMail({
            from: 'noreply@lhostinnaples.com',
            to: after.originalListerEmail,
            subject: '✅ Your Pool Booking Found a Host!',
            html: `
              <div style="font-family:sans-serif;
              background:#0f172a;color:#fff;
              padding:32px;border-radius:12px">
                <h2 style="color:#F5A623">
                  Great News!
                </h2>
                <p>Your booking in the pool 
                has been accepted by another host.</p>
                <p><strong>Booking:</strong> 
                ${after.itemName}</p>
                <p><strong>Guest:</strong> 
                ${after.customerName}</p>
              </div>
            `
          });
        }

        // Email guest
        if (after.guestEmail) {
          await transporter.sendMail({
            from: 'bookings@lhostinnaples.com',
            to: after.guestEmail,
            subject: '🎉 Your Booking Has Been Transferred!',
            html: `
              <div style="font-family:sans-serif;
              background:#0f172a;color:#fff;
              padding:32px;border-radius:12px">
                <h2 style="color:#F5A623">
                  Good News, ${after.customerName}!
                </h2>
                <p>Your booking request has been 
                accepted by a new host in Naples.</p>
                <p><strong>Dates:</strong> 
                ${after.startDate} - ${after.endDate}</p>
                <p>The host will contact you soon.</p>
              </div>
            `
          });
        }
      }

      if (after.status === 'CLOSED') {
        if (after.guestEmail) {
          await transporter.sendMail({
            from: 'bookings@lhostinnaples.com',
            to: after.guestEmail,
            subject: '🏠 Booking Confirmed in Naples!',
            html: `
              <div style="font-family:sans-serif;
              background:#0f172a;color:#fff;
              padding:32px;border-radius:12px">
                <h2 style="color:#F5A623">
                  Booking Confirmed!
                </h2>
                <p>Dear ${after.customerName},</p>
                <p>Your booking has been 
                successfully confirmed.</p>
                <p><strong>Dates:</strong> 
                ${after.startDate} - ${after.endDate}</p>
                <p>Enjoy your stay in Naples! 🇮🇹</p>
              </div>
            `
          });
        }
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

// 6. Contact Request
export const onContactRequest = functions.firestore
  .document('contact_requests/{requestId}')
  .onCreate(async (snap) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured');
      return;
    }
    const request = snap.data();
    
    // Notify admin
    await transporter.sendMail({
      from: 'info@lhostinnaples.com',
      to: 'info@lhostinnaples.com',
      subject: 'New Contact Request',
      html: `
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${request.name}</p>
        <p><strong>Email:</strong> ${request.email}</p>
        <p><strong>Message:</strong> ${request.message}</p>
      `
    });
    
    // Confirm to user
    await transporter.sendMail({
      from: 'info@lhostinnaples.com',
      to: request.email,
      subject: 'We received your message!',
      html: `
        <h2>Thank you ${request.name}!</h2>
        <p>We received your message and 
        will get back to you soon.</p>
        <p>Il Host in Naples Team</p>
      `
    });
  });
