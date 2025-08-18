const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Admin notification email for registration
// const sendRegistrationEmail = async (registrationData) => {
//   const { firstName, lastName, email, mobileNo, dob, occupation, levelName } =
//     registrationData;

//   const mailOptions = {
//     from: email,
//     to: process.env.MAIL_USER,
//     subject: "New Course Registration",
//     html: `
//       <div style="${emailStyles.container}">
//         <div style="${emailStyles.header}">
//           <h2 style="margin: 0;">New Registration Received</h2>
//         </div>
//         <div style="${emailStyles.content}">
//           <div style="${emailStyles.field}">
//             <p><strong>Name:</strong> ${firstName} ${lastName}</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Mobile:</strong> ${mobileNo}</p>
//             <p><strong>Date of Birth:</strong> ${new Date(
//               dob
//             ).toDateString()}</p>
//             <p><strong>Occupation:</strong> ${occupation}</p>
//             <p><strong>Registered For:</strong> ${levelName}</p>
//           </div>
//         </div>
//         <div style="${emailStyles.footer}">
//           <p>EKAA Registration System &copy; ${new Date().getFullYear()}</p>
//         </div>
//       </div>
//     `,
//   };

//   console.log(mailOptions);
//   await transporter.sendMail(mailOptions);
// };

// const sendUserConfirmationEmail = async (registrationData) => {
//   const {
//     firstName,
//     lastName,
//     email,
//     levelName,
//     city,
//     courseDetailDate,
//     courseDetailTime,
//     timeslot,
//   } = registrationData;

//   // Format date and time
//   const formattedDate = courseDetailDate
//     ? new Date(courseDetailDate).toDateString()
//     : "TBD";
//   const timeInfo = courseDetailTime || timeslot || "TBD";

//   const mailOptions = {
//     from: process.env.MAIL_USER,
//     to: email,
//     subject: "Registration Confirmed – Your EKAA Course Details",
//     html: `
//       <div style="${emailStyles.container}">
//         <div style="${emailStyles.header}">
//           <h2 style="margin: 0;">Registration Confirmed – Your EKAA Course Details</h2>
//         </div>
//         <div style="${emailStyles.content}">
//           <p>Dear ${firstName},</p>
//           <p>Thank you for registering with EKAA.</p>

//           <h3 style="${emailStyles.subHeading}">📋 Registration Details</h3>
//           <div style="${emailStyles.field}">
//             <p><strong>Course:</strong> ${levelName}</p>
//             <p><strong>City:</strong> ${city}</p>
//             <p><strong>Date:</strong> ${formattedDate}</p>
//             <p><strong>Time:</strong> ${timeInfo}</p>
//           </div>

//           <div style="${emailStyles.highlightBox}">
//             <h3 style="${emailStyles.subHeading}">📅 What's Next</h3>
//             <p>A representative from EKAA will contact you shortly to guide you through the next steps.</p>
//           </div>

//           <p>For any queries, contact us at <a href="mailto:connect@ekaausa.com" style="color: #667eea; text-decoration: none;">connect@ekaausa.com</a>.</p>
//         </div>
//         <div style="${emailStyles.footer}">
//           <p>EKAA Learning Center &copy; ${new Date().getFullYear()}</p>
//         </div>
//       </div>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };

// Admin Contact Notification
const sendAdminNotification = async (contactData) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.MAIL_USER,
      replyTo: contactData.email,
      subject: `🔔 New Contact Form Submission - ${contactData.fullName}`,
      html: generateAdminEmailTemplate(contactData),
      attachments: contactData.uploadImage?.path
        ? [
            {
              filename: contactData.uploadImage.originalName,
              path: contactData.uploadImage.path,
            },
          ]
        : [],
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    throw error;
  }
};

// Client Contact Confirmation
const sendClientConfirmation = async (contactData) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: contactData.email,
      subject: "✅ Thank you for contacting us - We received your message",
      html: generateClientEmailTemplate(contactData),
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    throw error;
  }
};

// Helper function to generate admin email template
const generateAdminEmailTemplate = (data) => {
  return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0;">📧 New Contact Form Submission</h2>
        <p style="margin: 10px 0 0; opacity: 0.9;">A new inquiry has been received through your website</p>
      </div>
      <div style="${emailStyles.content}">
        <div style="${emailStyles.field}">
          <p><strong>👤 Full Name:</strong> ${data.fullName}</p>
          <p><strong>📧 Email:</strong> ${data.email}</p>
          <p><strong>📱 Contact:</strong> ${data.contactNo}</p>
          <p><strong>🌍 Country:</strong> ${data.country}</p>
          <p><strong>📮 Zip Code:</strong> ${data.zipCode}</p>
          <p><strong>📝 Privacy Policy:</strong> ${
            data.readPrivacyPolicy ? "✅ Accepted" : "❌ Not Accepted"
          }</p>
          <p><strong>⏰ Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        ${
          data.uploadImage?.filename
            ? `
          <div style="${emailStyles.highlightBox}">
            <h3 style="${emailStyles.subHeading}">📎 Attachment</h3>
            <p>${data.uploadImage.originalName} (${(
                data.uploadImage.size / 1024
              ).toFixed(2)} KB)</p>
          </div>
        `
            : ""
        }

        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">💬 Message</h3>
          <p>${data.message.replace(/\n/g, "<br>")}</p>
        </div>
      </div>
      <div style="${emailStyles.footer}">
        <p>Reply directly to this email to respond to the customer</p>
        <p>EKAA Support System &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;
};

// Helper function to generate client email template
const generateClientEmailTemplate = (data) => {
  return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0;">🎉 Thank You for Reaching Out!</h2>
        <p style="margin: 10px 0 0; opacity: 0.9;">We've received your message and will get back to you soon</p>
      </div>
      <div style="${emailStyles.content}">
        <p>Dear <strong>${data.fullName}</strong>,</p>
        
        <div style="${emailStyles.highlightBox}">
          <h3 style="${
            emailStyles.subHeading
          }">✅ Your message has been received!</h3>
          <p><strong>Reference ID:</strong> #${Date.now()
            .toString()
            .slice(-8)}</p>
          <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">📋 What happens next?</h3>
          <ul style="${emailStyles.list}">
            <li style="${
              emailStyles.listItem
            }">Our team will review your inquiry within 24 hours</li>
            <li style="${
              emailStyles.listItem
            }">We'll respond to your email: <strong>${data.email}</strong></li>
            <li style="${
              emailStyles.listItem
            }">You'll receive personalized assistance based on your query</li>
          </ul>
        </div>
        
        <p>Thank you for contacting us. We will be in touch soon to help take your journey forward.</p>
      </div>
      <div style="${emailStyles.footer}">
        <p>For immediate assistance, contact us at <a href="mailto:connect@ekaausa.com" style="color: #6e2d79; text-decoration: none;">connect@ekaausa.com</a></p>
        <p>EKAA Support Team &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;
};
const emailTemplates = {
  internalNotification: (registration) => `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0; font-weight: 500; font-size: 1.8rem;">New Session Registration</h2>
      </div>
      
      <div style="${emailStyles.content}">
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">Session Details</h3>
          
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Event:</strong> ${registration.event}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Date:</strong> ${registration.date}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Location:</strong> ${registration.location}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Organized By:</strong> ${registration.organisedBy}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Organizer Email:</strong> ${registration.organiserEmail}
              </div>
            </div>
          </div>
        </div>
        
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">Registrant Information</h3>
          
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Name:</strong> ${registration.fullName}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Email:</strong> ${registration.email}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Phone:</strong> ${registration.phone}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Registration ID:</strong> ${registration._id}
              </div>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${registration.email}" style="${emailStyles.button}">
            Contact Registrant
          </a>
        </div>
      </div>
      
      <div style="${emailStyles.footer}">
        This registration was received on ${new Date().toLocaleString()}
      </div>
    </div>
  `,

  userConfirmation: (registration) => {
    // Check if payment is needed for these dates
    const paymentDates = [
      "Aug 9, 2025",
      "Aug 12, 2025",
      "Aug 18, 2025",
      "Aug 20, 2025",
      "Aug 22, 2025",
      "Aug 23, 2025",
      "Aug 28, 2025",
      "Aug 29, 2025",
      "Sept 7, 2025",
    ];
    const needsPayment = paymentDates.includes(registration.date);

    return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0; font-weight: 500; font-size: 1.8rem;">Registration Confirmation</h2>
      </div>
      
      <div style="${emailStyles.content}">
        <p style="font-size: 16px;">Dear ${registration.fullName},</p>
        
        <p style="font-size: 16px;">Thank you for registering for our session! We've received your registration details ${
          needsPayment
            ? "and your payment is required to complete the registration"
            : ""
        }.</p>
        
        ${
          needsPayment
            ? `
          <div style="margin: 20px 0; padding: 20px; background-color: #f6e8f6; border-radius: 8px; border-left: 4px solid #ba82c5;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2d3748;">Complete Your Registration</h3>
            <p style="margin: 0 0 15px 0; font-size: 16px;">Please complete your payment to secure your spot:</p>
            <a href="https://buy.stripe.com/8x2dR189Wgkla7u0Zl93y01" 
               style="${emailStyles.button}; background-color: #6e2d79; display: inline-block;">
              Make Payment Now
            </a>
            <p style="margin: 10px 0 0; font-size: 14px; color: #718096;">Payment must be completed within 48 hours.</p>
          </div>
        `
            : ""
        }
        
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">Session Details</h3>
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Event:</strong> ${registration.event}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Date:</strong> ${registration.date}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Location:</strong> ${registration.location}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Organized By:</strong> ${registration.organisedBy}
              </div>
            </div>
          </div>
        </div>
        
        <p style="font-size: 16px;">If you have any questions, please contact us at <a href="mailto:contact@ekaausa.com" style="color: #6e2d79; text-decoration: none; font-weight: bold;">contact@ekaausa.com</a>.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://ekaausa.com" style="${emailStyles.button}">
            Visit Our Website
          </a>
        </div>
        
        <p style="font-size: 16px; margin-top: 40px;">Best regards,<br><strong>The Ekaa USA Team</strong></p>
      </div>
      
      <div style="${emailStyles.footer}">
        Ekaa USA &bull; contact@ekaausa.com &bull; www.ekaausa.com
      </div>
    </div>
  `;
  },
};

// Send email function
const sendRegistrationEmails = async (registration) => {
  try {
    const paymentLinks = {
      "Aug 9, 2025": "https://buy.stripe.com/8x2dR189Wgkla7u0Zl93y01",
      "Aug 12, 2025": "https://buy.stripe.com/8x2dR189Wgkla7u0Zl93y01",
      "Aug 18, 2025": "https://buy.stripe.com/8x2dR189Wgkla7u0Zl93y01",
      "Aug 20, 2025": "https://buy.stripe.com/7sY00lfDKcFrcHa1YK7Vm0L",
      "Aug 22, 2025":
        "https://checkout.square.site/merchant/MLWJMSMMV9BVH/checkout/6JPYQHKGG2BK75Q6SMJB35O7",
      "Aug 23, 2025":
        "https://checkout.square.site/merchant/MLWJMSMMV9BVH/checkout/6JPYQHKGG2BK75Q6SMJB35O7",
      "Aug 28, 2025":
        "https://checkout.square.site/merchant/MLWJMSMMV9BVH/checkout/6JPYQHKGG2BK75Q6SMJB35O7",
      "Aug 29, 2025":
        "https://checkout.square.site/merchant/MLWJMSMMV9BVH/checkout/6JPYQHKGG2BK75Q6SMJB35O7",
      "Sept 7, 2025":
        "https://checkout.square.site/merchant/MLWJMSMMV9BVH/checkout/6JPYQHKGG2BK75Q6SMJB35O7",
    };

    const needsPaymentLink = paymentLinks.hasOwnProperty(registration.date);

    const paymentLink = needsPaymentLink
      ? paymentLinks[registration.date]
      : null;

    const emailData = {
      ...registration,
      paymentLink: paymentLink,
    };
    await transporter.sendMail({
      from: `"Ekaa USA" <${process.env.EMAIL_USER}>`,
      to: "contact@ekaausa.com",
      cc: ["connect@ekaausa.com", registration.organiserEmail],
      subject: `New Registration: ${registration.event} - ${registration.date}`,
      html: emailTemplates.internalNotification(registration),
      replyTo: "contact@ekaausa.com",
    });

    await transporter.sendMail({
      from: `"Ekaa USA" <${process.env.EMAIL_USER}>`,
      to: registration.email,
      subject: `Confirmation: ${registration.event} Registration`,
      html: emailTemplates.userConfirmation(emailData),
      replyTo: "contact@ekaausa.com",
    });

    return true;
  } catch (error) {
    return false;
  }
};
const DOCTOR_EMAIL_MAP = {
  "Dr Manoj's A/C": "docbhardwaj@gmail.com",
  "Dr Aiyasawmy's A/C": "Aiyasawmy@gmail.com",
  "Dr. Sonia Gupte": "Sonia@enso-nia.com",
};
const EVENT_DOCTOR_MAP = {
  "Decode The Child": "Dr Aiyasawmy's A/C",
  "L 1": "Dr. Sonia Gupte",
};
const PAYMENT_LINK_MAP = {
  // "Dr Manoj's A/C": "https://buy.stripe.com/xxxx_for_manoj",
  "Dr Aiyasawmy's A/C": "https://buy.stripe.com/6oU6ozgGsc45cfCgYj93y02",
  "Dr. Sonia Gupte": "https://buy.stripe.com/14A3cxdvCbBn8qU32O7Vm0z",
};
const ichEmailTemplates = {
  adminNotification: ({ userName, userEmail, registrationId, city }) => {
    const isManojTraining =
      city.includes("ICH L3 Training") || city.includes("ICH L1 Training");
    const displayCity = isManojTraining
      ? city.replace(/ICH (L[13] Training)/g, "Hypnotic $1")
      : city;
    const trainingType = city.split("|")[1]?.trim() || "ICH Training";
    const trainingDates = city.split("|")[2]?.trim() || "";

    return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0; font-weight: 500; font-size: 1.8rem;">New Hypnotherapy Registration</h2>
      </div>
      
      <div style="${emailStyles.content}">
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">Registrant Information</h3>
          
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Name:</strong> ${userName}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Email:</strong> ${userEmail}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Training:</strong> ${trainingType}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Dates:</strong> ${trainingDates}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Registration ID:</strong> ${registrationId}
              </div>
            </div>
          </div>
        </div>
        
        ${
          displayCity
            ? `
        <div style="margin: 20px 0; padding: 15px; background-color: #f6e8f6; border-radius: 8px; border-left: 4px solid #ba82c5;">
          <p style="margin: 0; font-size: 15px;">
            <strong>Note:</strong> Dr. Manoj has been CC'd on this notification as the instructor.
          </p>
        </div>
        `
            : ""
        }
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${
            process.env.ADMIN_PORTAL_URL
          }/registrations/${registrationId}" 
             style="${emailStyles.button}">
            View Full Registration
          </a>
        </div>
      </div>
      
      <div style="${emailStyles.footer}">
        This registration was received on ${new Date().toLocaleString()}
      </div>
    </div>
    `;
  },

  userConfirmation: (registration, paymentLink) => {
    const cityParts = registration.city?.split("|") || [];
    const trainingType = cityParts[1]?.trim() || "Hypnotherapy Training";
    const trainingDates = cityParts[2]?.trim() || "";

    const isL1 =
      trainingType.includes("Hypnotherapy L1 Training") ||
      trainingType.includes("Basic Course");
    const isL2 =
      trainingType.includes("Hypnotherapy L2 Training") ||
      trainingType.includes("Behavioral Resolutions");
    const isL3 =
      trainingType.includes("Hypnotherapy L3 Training") ||
      trainingType.includes("Health Resolutions");

    const sessions = [
      {
        id: 1,
        Event:
          "Advanced Course in Integrated Hypnotic Modalities for Health Resolutions",
        Date: "13th-17th Aug",
        Location: "Houston",
        organisedby: "Yuvraj Kapadia",
        level: 3,
      },
      {
        id: 4,
        Event: "Basic Course in Integrated Clinical Hypnotherapy Certification",
        Date: "11th Aug-12th Aug",
        Location: "Houston TX",
        organisedby: "Dr. Manoj",
        level: 1,
      },
      {
        id: 2,
        Event: "Basic Course in Integrated Clinical Hypnotherapy Certification",
        Date: "Aug 20-21, 2025",
        Location: "Austin",
        organisedby: "Dr. Manoj",
        level: 1,
      },
      {
        id: 3,
        Event:
          "Course in Integrated Hypnotic Modalities for Behavioral Resolutions.",
        Date: "13th–17th Aug",
        Location: "Houston TX",
        organisedby: "Dr.Sonia Gupte",
        level: 2,
      },
    ];

    const normalizeDate = (dateStr) => {
      if (!dateStr) return "";
      return dateStr
        .replace(/th|rd|nd|st|,/g, "")
        .replace(/–/g, "-")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    };

    const matchingSession = sessions.find((session) => {
      const sessionDateNormalized = normalizeDate(session.Date);
      const trainingDateNormalized = normalizeDate(trainingDates);

      const datesMatch =
        sessionDateNormalized.includes(trainingDateNormalized) ||
        trainingDateNormalized.includes(sessionDateNormalized);

      const levelMatch =
        (isL1 && session.level === 1) ||
        (isL2 && session.level === 2) ||
        (isL3 && session.level === 3);

      return datesMatch && levelMatch;
    });

    const instructorName = matchingSession?.organisedby || "Dr. Manoj Bhardwaj";

    const paymentLinks = {
      l1: {
        "20-21 aug 2025":
          "https://checkout.square.site/merchant/MLWJMSMMV9BVH/checkout/75K6WKOBWCFROFGM4LUDBT6I",
        "11 aug-12 aug": "https://buy.stripe.com/3cI5kv9e03xz7ZmdM793y04",
        default:
          "https://checkout.square.site/merchant/MLWJMSMMV9BVH/checkout/75K6WKOBWCFROFGM4LUDBT6I",
      },
      l2: {
        "13-17 aug": "https://buy.stripe.com/eVq6oz61O7NP4NaeQb93y05",
        default: "https://buy.stripe.com/eVq6oz61O7NP4NaeQb93y05",
      },
      l3: {
        "13-17 aug": "https://buy.stripe.com/cNidR189W1pr1AY7nJ93y03",
        default: "https://buy.stripe.com/cNidR189W1pr1AY7nJ93y03",
      },
    };

    const getPaymentLink = (level) => {
      const levelLinks = paymentLinks[level];
      const normalizedTrainingDates = normalizeDate(trainingDates);

      // Try to find a matching date key
      const foundKey = Object.keys(levelLinks).find((key) => {
        if (key === "default") return false;
        const normalizedKey = normalizeDate(key);
        return (
          normalizedTrainingDates.includes(normalizedKey) ||
          normalizedKey.includes(normalizedTrainingDates)
        );
      });

      return foundKey ? levelLinks[foundKey] : levelLinks.default;
    };

    return `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0; font-weight: 500; font-size: 1.8rem;">Hypnotherapy Registration Confirmation</h2>
      </div>
      
      <div style="${emailStyles.content}">
        <p style="font-size: 16px;">Dear ${registration.firstName} ${
      registration.lastName
    },</p>
        
        <p style="font-size: 16px;">Thank you for registering for our <strong>${trainingType}</strong> program!</p>
        
        ${
          isL1
            ? `
          <div style="margin: 20px 0; padding: 20px; background-color: #f6e8f6; border-radius: 8px; border-left: 4px solid #ba82c5;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2d3748;">L1 Training Details</h3>
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Your training will be conducted by ${instructorName} from ${trainingDates}.
            </p>
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Please complete your payment to secure your spot:
            </p>
            <a href="${getPaymentLink("l1")}" 
               style="${emailStyles.button}; background-color: #6e2d79;">
              Make L1 Payment Now
            </a>
            <p style="margin: 10px 0 0; font-size: 14px; color: #718096;">
              Payment must be completed within 48 hours.
            </p>
          </div>
        `
            : ""
        }
        
        ${
          isL2
            ? `
          <div style="margin: 20px 0; padding: 20px; background-color: #f6e8f6; border-radius: 8px; border-left: 4px solid #ba82c5;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2d3748;">L2 Training Details</h3>
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Your training will be conducted by ${instructorName} from ${trainingDates}.
            </p>
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Please complete your payment to secure your spot:
            </p>
            <a href="${getPaymentLink("l2")}" 
               style="${emailStyles.button}; background-color: #6e2d79;">
              Make L2 Payment Now
            </a>
            <p style="margin: 10px 0 0; font-size: 14px; color: #718096;">
              Payment must be completed within 48 hours.
            </p>
          </div>
        `
            : ""
        }
        
        ${
          isL3
            ? `
          <div style="margin: 20px 0; padding: 20px; background-color: #f6e8f6; border-radius: 8px; border-left: 4px solid #ba82c5;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #2d3748;">L3 Training Details</h3>
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Your training will be conducted by ${instructorName} from ${trainingDates}.
            </p>
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Please complete your payment to secure your spot:
            </p>
            <a href="${getPaymentLink("l3")}" 
               style="${emailStyles.button}; background-color: #6e2d79;">
              Make L3 Payment Now
            </a>
            <p style="margin: 10px 0 0; font-size: 14px; color: #718096;">
              Payment must be completed within 48 hours.
            </p>
          </div>
        `
            : ""
        }
        
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">Your Registration Details</h3>
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Training Program:</strong> ${trainingType}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Dates:</strong> ${trainingDates}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Instructor:</strong> ${instructorName}
              </div>
            </div>
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Name on Certificate:</strong> ${
                  registration.nameAsCertificate
                }
              </div>
            </div>
            ${
              registration.timeslot
                ? `
            <div style="${emailStyles.listItem}">
              <div style="${emailStyles.field}">
                <strong>Time Slot:</strong> ${registration.timeslot}
              </div>
            </div>
            `
                : ""
            }
          </div>
        </div>
        
        <p style="font-size: 16px;">
          If you have any questions, please contact us at 
          <a href="mailto:contact@ekaausa.com" style="color: #6e2d79; text-decoration: none;">
            contact@ekaausa.com
          </a>.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://ekaausa.com/ich" style="${emailStyles.button}">
            View Program Details
          </a>
        </div>
        
        <p style="font-size: 16px; margin-top: 40px;">
          Best regards,<br>
          <strong>The Ekaa USA Hypnotherapy Team</strong>
        </p>
      </div>
      
      <div style="${emailStyles.footer}">
        Ekaa USA Hypnotherapy Program &bull; contact@ekaausa.com &bull; www.ekaausa.com/ich
      </div>
    </div>
    `;
  },
};

const sendICHUserConfirmation = async ({ email, name, registration }) => {
  try {
    await transporter.sendMail({
      from: `"Ekaa USA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Hypnotherapy Registration Confirmation",
      html: ichEmailTemplates.userConfirmation(registration),
      replyTo: "contact@ekaausa.com",
    });
    return true;
  } catch (error) {
    return false;
  }
};

// AWAKEN THE LIMITLESS HUMAN email templates
const awakenLimitlessHumanEmailTemplates = {
  adminNotification: (registration) => `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0;">New AWAKEN THE LIMITLESS HUMAN Registration</h2>
      </div>
      <div style="${emailStyles.content}">
        <div style="${emailStyles.field}">
          <p><strong>Name:</strong> ${registration.firstName} ${registration.lastName}</p>
          <p><strong>Email:</strong> ${registration.email}</p>
          <p><strong>Mobile:</strong> ${registration.mobileNo}</p>
          <p><strong>Date of Birth:</strong> ${new Date(registration.dob).toDateString()}</p>
          <p><strong>Occupation:</strong> ${registration.occupation}</p>
          <p><strong>Registered For:</strong> ${registration.levelName}</p>
          <p><strong>City:</strong> ${registration.city}</p>
          <p><strong>Current Address:</strong> ${registration.currentAddress}</p>
          <p><strong>Permanent Address:</strong> ${registration.permanenetAddress}</p>
          ${registration.timeslot ? `<p><strong>Time Slot:</strong> ${registration.timeslot}</p>` : ''}
          ${registration.courseDetailDate ? `<p><strong>Course Date:</strong> ${new Date(registration.courseDetailDate).toDateString()}</p>` : ''}
          ${registration.courseDetailTime ? `<p><strong>Course Time:</strong> ${registration.courseDetailTime}</p>` : ''}
          ${registration.courseDetailVenue ? `<p><strong>Course Venue:</strong> ${registration.courseDetailVenue}</p>` : ''}
          ${registration.hearAbout ? `<p><strong>How did you hear about us:</strong> ${registration.hearAbout}</p>` : ''}
        </div>
      </div>
      <div style="${emailStyles.footer}">
        <p>EKAA AWAKEN THE LIMITLESS HUMAN Registration System &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `,

  userConfirmation: (registration) => `
    <div style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h2 style="margin: 0;">AWAKEN THE LIMITLESS HUMAN Registration Confirmed</h2>
      </div>
      <div style="${emailStyles.content}">
        <p style="font-size: 16px;">Dear ${registration.firstName} ${registration.lastName},</p>
        
        <p style="font-size: 16px;">Thank you for registering for our <strong>AWAKEN THE LIMITLESS HUMAN</strong> program!</p>
        
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">📋 Your Registration Details</h3>
          <div style="${emailStyles.list}">
            <div style="${emailStyles.listItem}">
              <strong>Program:</strong> ${registration.levelName}
            </div>
            <div style="${emailStyles.listItem}">
              <strong>City:</strong> ${registration.city}
            </div>
            ${registration.timeslot ? `<div style="${emailStyles.listItem}">
              <strong>Time Slot:</strong> ${registration.timeslot}
            </div>` : ''}
            ${registration.courseDetailDate ? `<div style="${emailStyles.listItem}">
              <strong>Course Date:</strong> ${new Date(registration.courseDetailDate).toDateString()}
            </div>` : ''}
            ${registration.courseDetailTime ? `<div style="${emailStyles.listItem}">
              <strong>Course Time:</strong> ${registration.courseDetailTime}
            </div>` : ''}
            ${registration.courseDetailVenue ? `<div style="${emailStyles.listItem}">
              <strong>Course Venue:</strong> ${registration.courseDetailVenue}
            </div>` : ''}
          </div>
        </div>
        
        <div style="${emailStyles.highlightBox}">
          <h3 style="${emailStyles.subHeading}">📅 What's Next</h3>
          <p>A representative from EKAA will contact you shortly to guide you through the next steps and provide further details about the program.</p>
        </div>
        
        <p style="font-size: 16px;">
          For any questions, please contact us at 
          <a href="mailto:connect@ekaausa.com" style="color: #6e2d79; text-decoration: none;">
            connect@ekaausa.com
          </a>.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://ekaausa.com" style="${emailStyles.button}">
            Visit Our Website
          </a>
        </div>
        
        <p style="font-size: 16px; margin-top: 40px;">
          Best regards,<br>
          <strong>The EKAA USA Team</strong>
        </p>
      </div>
      <div style="${emailStyles.footer}">
        EKAA USA AWAKEN THE LIMITLESS HUMAN Program &bull; connect@ekaausa.com &bull; www.ekaausa.com
      </div>
    </div>
  `,
};

const sendAwakenLimitlessHumanAdminNotification = async (registration) => {
  try {
    await transporter.sendMail({
      from: `"EKAA USA" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_Email || process.env.MAIL_USER,
      cc: ["connect@ekaausa.com"],
      subject: `New AWAKEN THE LIMITLESS HUMAN Registration: ${registration.levelName}`,
      html: awakenLimitlessHumanEmailTemplates.adminNotification(registration),
      replyTo: "connect@ekaausa.com",
    });
    return true;
  } catch (error) {
    return false;
  }
};

const sendAwakenLimitlessHumanUserConfirmation = async (registration) => {
  try {
    await transporter.sendMail({
      from: `"EKAA USA" <${process.env.MAIL_USER}>`,
      to: registration.email,
      subject: "AWAKEN THE LIMITLESS HUMAN Registration Confirmation",
      html: awakenLimitlessHumanEmailTemplates.userConfirmation(registration),
      replyTo: "connect@ekaausa.com",
    });
    return true;
  } catch (error) {
    return false;
  }
};

const sendICHAdminNotification = async ({
  userEmail,
  userName,
  registrationId,
  city,
}) => {
  try {
    const isL1Training = city.includes("ICH L1 Training");
    const isL3Training = city.includes("ICH L3 Training");
    const cc = ["connect@ekaausa.com"];

    if (isL1Training) {
      cc.push(DOCTOR_EMAIL_MAP["Dr Manoj's A/C"]);
    } else if (isL3Training) {
      cc.push(DOCTOR_EMAIL_MAP["Dr Aiyasawmy's A/C"]);
    }

    await transporter.sendMail({
      from: `"Ekaa USA" <${process.env.EMAIL_USER}>`,
      to: "contact@ekaausa.com",
      cc: cc,
      subject: `New Hypnotherapy Registration: ${userName}`,
      html: ichEmailTemplates.adminNotification({
        userName,
        userEmail,
        registrationId,
        city,
      }),
      replyTo: "contact@ekaausa.com",
    });
    return true;
  } catch (error) {
    return false;
  }
};

const decodeEmailTemplates = {
  adminNotification: (registration) => {
    const cityParts = registration.city?.split("|") || [];
    const eventName = cityParts[1]?.trim() || "EKAA Program";
    const eventDate = cityParts[2]?.trim() || "";
    const doctorKey = EVENT_DOCTOR_MAP[eventName];
    const isDecodeChild = eventName.includes("Decode The Child");

    return `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}">
          <h2 style="margin:0;font-weight:500;font-size:1.8rem;">
            New Registration: ${eventName}
          </h2>
        </div>
        <div style="${emailStyles.content}">
          <div style="${emailStyles.highlightBox}">
            <h3 style="${emailStyles.subHeading}">Registrant Information</h3>
            <div style="${emailStyles.list}">
              <div style="${emailStyles.listItem}">
                <strong>Name:</strong> ${registration.firstName} ${
      registration.lastName
    }
              </div>
              <div style="${emailStyles.listItem}">
                <strong>Email:</strong> ${registration.email}
              </div>
              <div style="${emailStyles.listItem}">
                <strong>Program:</strong> ${eventName}
              </div>
              <div style="${emailStyles.listItem}">
                <strong>Date:</strong> ${eventDate}
              </div>
              <div style="${emailStyles.listItem}">
                <strong>Phone:</strong> ${registration.mobileNo}
              </div>
            </div>
          </div>
          ${
            doctorKey
              ? `<div style="margin:20px 0;padding:15px;background-color:#f6e8f6;border-radius:8px;border-left:4px solid #ba82c5;">
                   <p style="margin:0;font-size:15px;">
                     <strong>Note:</strong> ${doctorKey} has been CC'd on this notification.
                   </p>
                 </div>`
              : ""
          }
        </div>
        <div style="${emailStyles.footer}">
          Registration received on ${new Date().toLocaleString()}
        </div>
      </div>
    `;
  },

  userConfirmation: (registration, paymentLink) => {
    const cityParts = registration.city?.split("|") || [];
    const eventName = cityParts[1]?.trim() || "EKAA Program";
    const eventDate = cityParts[2]?.trim() || "";
    const hasDoctor = !!EVENT_DOCTOR_MAP[eventName];

    return `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}">
          <h2 style="margin:0;font-weight:500;font-size:1.8rem;">Registration Confirmation</h2>
        </div>
        <div style="${emailStyles.content}">
          <p style="font-size:16px;">
            Dear ${registration.firstName} ${registration.lastName},
          </p>
          <p style="font-size:16px;">
            Thank you for registering for our <strong>${eventName}</strong> program!
          </p>
          ${
            hasDoctor
              ? `
            <div style="margin:20px 0;padding:20px;background-color:#f6e8f6;border-radius:8px;border-left:4px solid #ba82c5;">
              <p style="margin:0 0 15px 0;font-size:16px;">
                Your session is scheduled on ${eventDate}.
              </p>
              <p style="margin:0 0 15px 0;font-size:16px;">
                Please complete your payment to confirm your spot:
              </p>
              <a href="${paymentLink}"
                 style="${emailStyles.button};background-color:#6e2d79;">
                Make Payment Now
              </a>
              <p style="margin-top:10px;font-size:14px;color:#718096;">
                Payment must be completed within 48 hours.
              </p>
            </div>`
              : ""
          }
          <div style="${emailStyles.highlightBox}">
            <h3 style="${emailStyles.subHeading}">Your Registration Details</h3>
            <div style="${emailStyles.list}">
              <div style="${emailStyles.listItem}">
                <strong>Program:</strong> ${eventName}
              </div>
              <div style="${emailStyles.listItem}">
                <strong>Date:</strong> ${eventDate}
              </div>
              ${
                registration.timeslot
                  ? `<div style="${emailStyles.listItem}">
                       <strong>Time Slot:</strong> ${registration.timeslot}
                     </div>`
                  : ""
              }
            </div>
          </div>
          <p style="font-size:16px;">
            For questions, contact 
            <a href="mailto:connect@ekaausa.com" style="color:#6e2d79;text-decoration:none;">
              connect@ekaausa.com
            </a>
          </p>
          <div style="text-align:center;margin-top:30px;">
            <a href="https://ekaausa.com" style="${emailStyles.button};">
              Visit Our Website
            </a>
          </div>
        </div>
        <div style="${emailStyles.footer}">
          EKAA Learning Center &copy; ${new Date().getFullYear()}
        </div>
      </div>
    `;
  },
};

// Updated email sending functions
const sendRegistrationEmail = async (registration) => {
  try {
    const isDecodeChild = registration.city?.includes("Decode The Child");
    const cc = ["connect@ekaausa.com"];

    if (isDecodeChild) {
      cc.push(DOCTOR_EMAIL_MAP["Dr Aiyasawmy's A/C"]);
    }

    await transporter.sendMail({
      from: `"EKAA USA" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      cc: cc,
      subject: `New Registration: ${
        registration.city?.split("|")[1]?.trim() || "EKAA Program"
      }`,
      html: decodeEmailTemplates.adminNotification(registration),
      replyTo: "connect@ekaausa.com",
    });
  } catch (error) {
    // Admin email error handled silently
  }
};

const sendUserConfirmationEmail = async (registration, paymentLink) => {
  try {
    await transporter.sendMail({
      from: `"EKAA USA" <${process.env.MAIL_USER}>`,
      to: registration.email,
      subject: `Confirmation: ${
        registration.city?.split("|")[1]?.trim() || "EKAA Program"
      } Registration`,
      html: decodeEmailTemplates.userConfirmation(registration, paymentLink),
      replyTo: "connect@ekaausa.com",
    });
  } catch (error) {
    // User email error handled silently
  }
};

module.exports = {
  sendRegistrationEmail,
  sendUserConfirmationEmail,
  sendAdminNotification,
  sendClientConfirmation,
  generateAdminEmailTemplate,
  generateClientEmailTemplate,
  sendRegistrationEmails,
  sendICHAdminNotification,
  sendICHUserConfirmation,
  sendAwakenLimitlessHumanAdminNotification,
  sendAwakenLimitlessHumanUserConfirmation,
};
const emailStyles = {
  container:
    "font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);",
  header:
    "background: linear-gradient(135deg, #ba82c5 0%, #6e2d79 100%); color: white; padding: 25px; text-align: center;",
  content: "padding: 30px; line-height: 1.6; color: #333333;",
  footer:
    "text-align: center; padding: 20px; color: #777777; font-size: 14px; border-top: 1px solid #eeeeee; background: #f8f9fa;",
  field:
    "margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #ba82c5; border-radius: 5px;",
  highlightBox:
    "background: #f6e8f6; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #d1b2d4;",
  heading: "color: #2c3e50; margin-top: 0;",
  subHeading: "color: #2c3e50; margin-bottom: 15px; font-weight: 600;",
  button:
    "display: inline-block; background: #6e2d79; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0;",
  list: "padding-left: 20px; margin: 15px 0;",
  listItem: "margin-bottom: 10px;",
};
