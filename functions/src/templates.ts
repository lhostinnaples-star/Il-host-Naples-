const baseStyles = `
  font-family: Arial, sans-serif;
  color: #0f172a;
  line-height: 1.6;
`;

const headerStyles = `
  background-color: #0f172a;
  color: #F5A623;
  padding: 20px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
`;

const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const contentStyles = `
  padding: 20px;
`;

const footerStyles = `
  background-color: #f8fafc;
  padding: 15px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
`;

const wrapEmail = (title: string, content: string) => `
  <div style="${baseStyles}">
    <div style="${containerStyles}">
      <div style="${headerStyles}">
        L Host in Naples
      </div>
      <div style="${contentStyles}">
        <h2 style="color: #0f172a;">${title}</h2>
        ${content}
      </div>
      <div style="${footerStyles}">
        &copy; ${new Date().getFullYear()} L Host in Naples. All rights reserved.
      </div>
    </div>
  </div>
`;

export const welcomeEmailTemplate = (name: string) => wrapEmail(
  'Welcome to L Host!',
  `<p>Hello ${name},</p>
   <p>Welcome to L Host in Naples. We're thrilled to have you here.</p>
   <p>You can now browse our exclusive properties and book your next stay.</p>`
);

export const pendingApprovalTemplate = (name: string) => wrapEmail(
  'Application Received',
  `<p>Hello ${name},</p>
   <p>Thank you for submitting your application to L Host in Naples.</p>
   <p>Our team is currently reviewing your details. We will notify you once your account has been approved.</p>`
);

export const newUserAdminTemplate = (user: any) => wrapEmail(
  'New User Registration',
  `<p>A new user has registered and requires attention.</p>
   <ul>
     <li><strong>Name:</strong> ${user.name}</li>
     <li><strong>Email:</strong> ${user.email}</li>
     <li><strong>Role:</strong> ${user.role}</li>
     <li><strong>Status:</strong> ${user.status}</li>
   </ul>
   <p>Please log in to the admin dashboard to review.</p>`
);

export const accountApprovedTemplate = (name: string) => wrapEmail(
  'Account Approved!',
  `<p>Hello ${name},</p>
   <p>Great news! Your account application has been approved.</p>
   <p>You can now log in and access all features for your role.</p>`
);

export const accountRejectedTemplate = (name: string) => wrapEmail(
  'Application Update',
  `<p>Hello ${name},</p>
   <p>Thank you for your interest in L Host in Naples.</p>
   <p>Unfortunately, after careful review, we are unable to approve your account application at this time.</p>
   <p>If you have any questions, please contact our support team.</p>`
);

export const bookingReceivedTemplate = (booking: any) => wrapEmail(
  'Booking Request Received',
  `<p>Hello ${booking.guestName},</p>
   <p>We have received your booking request for <strong>${booking.itemName || 'property'}</strong>.</p>
   <ul>
     <li><strong>Check-in:</strong> ${booking.startDate || booking.checkIn}</li>
     <li><strong>Check-out:</strong> ${booking.endDate || booking.checkOut}</li>
     <li><strong>Guests:</strong> ${booking.guests}</li>
   </ul>
   <p>We are processing your request and will send a confirmation shortly.</p>`
);

export const newBookingListerTemplate = (booking: any) => wrapEmail(
  'New Booking Request',
  `<p>You have a new booking request for your property.</p>
   <ul>
     <li><strong>Guest Name:</strong> ${booking.guestName}</li>
     <li><strong>Property:</strong> ${booking.itemName || 'Property'}</li>
     <li><strong>Check-in:</strong> ${booking.startDate || booking.checkIn}</li>
     <li><strong>Check-out:</strong> ${booking.endDate || booking.checkOut}</li>
   </ul>
   <p>Please log in to your dashboard to review and confirm.</p>`
);

export const bookingConfirmedTemplate = (booking: any) => wrapEmail(
  'Booking Confirmed!',
  `<p>Hello ${booking.guestName},</p>
   <p>Your booking for <strong>${booking.itemName || 'property'}</strong> has been confirmed!</p>
   <p>We look forward to hosting you.</p>`
);

export const bookingCancelledTemplate = (booking: any) => wrapEmail(
  'Booking Cancelled',
  `<p>Hello ${booking.guestName},</p>
   <p>We are writing to confirm that your booking for <strong>${booking.itemName || 'property'}</strong> has been cancelled.</p>
   <p>If you think this is a mistake, please contact our support team.</p>`
);

export const serviceRequestTemplate = (request: any) => wrapEmail(
  'New Service Request Available',
  `<p>A new service request has been posted by a Lister.</p>
   <ul>
     <li><strong>Property:</strong> ${request.propertyName || request.hotelName || 'N/A'}</li>
     <li><strong>Needed By:</strong> ${request.neededBy || 'N/A'}</li>
     <li><strong>Details:</strong> ${request.details || request.description || 'N/A'}</li>
   </ul>
   <p>Please log in to the Supplier dashboard if you are available to fulfill this request.</p>`
);
