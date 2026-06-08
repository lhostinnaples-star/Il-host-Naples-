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
  `<p>Hello ${booking.customerName || 'Guest'},</p>
   <p>We have received your booking request for <strong>${booking.itemName || 'property'}</strong>.</p>
   <ul>
     <li><strong>Check-in:</strong> ${booking.startDate ? new Date(booking.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : (booking.checkIn || 'N/A')}</li>
     <li><strong>Check-out:</strong> ${booking.endDate ? new Date(booking.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : (booking.checkOut || 'N/A')}</li>
     <li><strong>Guests:</strong> ${booking.guests || 'N/A'}</li>
   </ul>
   <p>We are processing your request and will send a confirmation shortly.</p>`
);

export const newBookingListerTemplate = (booking: any) => wrapEmail(
  'New Booking Request',
  `<p>You have a new booking request!</p>
   
   <div style="background:#1e293b;padding:20px;
   border-radius:8px;margin:16px 0">
     <h3 style="color:#F5A623;margin:0 0 16px">
       Booking Details
     </h3>
     <ul style="list-style:none;padding:0;margin:0">
       <li style="margin-bottom:8px">
         <strong>Reference:</strong> 
         ${booking.reference || 'N/A'}
       </li>
       <li style="margin-bottom:8px">
         <strong>Property:</strong> 
         ${booking.itemName || 'N/A'}
       </li>
       <li style="margin-bottom:8px">
         <strong>Check-in:</strong> 
         ${booking.startDate ? 
           new Date(booking.startDate)
           .toLocaleDateString('en-GB', {
             day: 'numeric', 
             month: 'long', 
             year: 'numeric'
           }) : 'N/A'}
       </li>
       <li style="margin-bottom:8px">
         <strong>Check-out:</strong> 
         ${booking.endDate ? 
           new Date(booking.endDate)
           .toLocaleDateString('en-GB', {
             day: 'numeric', 
             month: 'long', 
             year: 'numeric'
           }) : 'N/A'}
       </li>
       <li style="margin-bottom:8px">
         <strong>Guests:</strong> 
         ${booking.guests || 'N/A'}
       </li>
       <li style="margin-bottom:8px">
         <strong>Total Price:</strong> 
         €${booking.totalPrice || 'N/A'}
       </li>
       ${booking.notes ? 
         `<li style="margin-bottom:8px">
           <strong>Special Notes:</strong> 
           ${booking.notes}
         </li>` : ''}
     </ul>
   </div>

   <div style="background:#1e293b;padding:20px;
   border-radius:8px;margin:16px 0">
     <h3 style="color:#F5A623;margin:0 0 16px">
       Guest Contact Details
     </h3>
     <ul style="list-style:none;padding:0;margin:0">
       <li style="margin-bottom:8px">
         <strong>Name:</strong> 
         ${booking.customerName || 'Guest'}
       </li>
       <li style="margin-bottom:8px">
         <strong>Email:</strong> 
         <a href="mailto:${booking.customerEmail}"
         style="color:#F5A623">
           ${booking.customerEmail || 'N/A'}
         </a>
       </li>
       <li style="margin-bottom:8px">
         <strong>Phone:</strong> 
         <a href="tel:${booking.customerPhone}"
         style="color:#F5A623">
           ${booking.customerPhone || 'N/A'}
         </a>
       </li>
     </ul>
     <div style="margin-top:16px">
       <a href="tel:${booking.customerPhone}"
       style="background:#16a34a;color:#fff;
       padding:8px 16px;border-radius:8px;
       text-decoration:none;font-weight:bold;
       display:inline-block;margin-right:8px">
         📞 Call
       </a>
       <a href="mailto:${booking.customerEmail}"
       style="background:#2563eb;color:#fff;
       padding:8px 16px;border-radius:8px;
       text-decoration:none;font-weight:bold;
       display:inline-block;margin-right:8px">
         ✉️ Email
       </a>
       <a href="https://wa.me/${booking.customerPhone}"
       style="background:#25D366;color:#fff;
       padding:8px 16px;border-radius:8px;
       text-decoration:none;font-weight:bold;
       display:inline-block">
         💬 WhatsApp
       </a>
     </div>
   </div>

   <a href="https://lhostinnaples.com/owner"
   style="background:#F5A623;color:#0f172a;
   padding:12px 24px;border-radius:8px;
   text-decoration:none;font-weight:bold;
   display:inline-block;margin-top:8px">
     Go to Dashboard
   </a>`
);

export const bookingConfirmedTemplate = (booking: any) => wrapEmail(
  'Booking Confirmed!',
  `<p>Hello ${booking.customerName || booking.guestName || 'Guest'},</p>
   <p>Your booking for <strong>${booking.itemName || 'property'}</strong> has been confirmed!</p>
   <p>We look forward to hosting you.</p>`
);

export const bookingCancelledTemplate = (booking: any) => wrapEmail(
  'Booking Cancelled',
  `<p>Hello ${booking.customerName || booking.guestName || 'Guest'},</p>
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
