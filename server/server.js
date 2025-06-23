const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting - max 5 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many contact form submissions, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://www.yaduraj.me',
      'https://yaduraj.me'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to contact endpoint
app.use('/api/contact', limiter);

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Validate email configuration
const validateEmailConfig = () => {
  const required = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_TO'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('Please check your .env file');
    return false;
  }
  return true;
};

// Auto-reply email template for users
const createAutoReplyHTML = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for contacting me!</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #cb450c, #ff6b35); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
            .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; color: #2c3e50; margin-bottom: 20px; }
            .message { font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .next-steps { background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #cb450c; margin: 30px 0; }
            .next-steps h3 { margin: 0 0 15px 0; color: #2c3e50; font-size: 18px; }
            .next-steps ul { margin: 0; padding-left: 20px; }
            .next-steps li { margin-bottom: 8px; color: #555; }
            .project-info { background: #fff; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .project-info h4 { margin: 0 0 10px 0; color: #cb450c; font-size: 16px; }
            .contact-info { text-align: center; margin: 30px 0; }
            .contact-info a { color: #cb450c; text-decoration: none; font-weight: 500; }
            .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef; }
            .footer p { margin: 0; font-size: 14px; color: #666; }
            .signature { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
            .signature strong { color: #2c3e50; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Thank You for Reaching Out!</h1>
                <p>Your message has been received successfully</p>
            </div>
            
            <div class="content">
                <div class="greeting">Hi ${data.name}! 👋</div>
                
                <div class="message">
                    Thank you for contacting me through my portfolio! I'm excited to learn more about your ${data.projectType || 'project'} and explore how we can work together.
                </div>
                
                <div class="project-info">
                    <h4>📋 Your Project Details:</h4>
                    <p><strong>Project Type:</strong> ${data.projectType || 'Not specified'}</p>
                    <p><strong>Budget Range:</strong> ${data.budget || 'Not specified'}</p>
                </div>
                
                <div class="next-steps">
                    <h3>🚀 What happens next:</h3>
                    <ul>
                        <li><strong>Review:</strong> I'll carefully review your message within 24 hours</li>
                        <li><strong>Response:</strong> I'll get back to you with questions or next steps</li>
                        <li><strong>Discovery Call:</strong> We can schedule a call to discuss your project in detail</li>
                        <li><strong>Proposal:</strong> If it's a good fit, I'll provide a detailed proposal</li>
                    </ul>
                </div>
                
                <div class="message">
                    I appreciate you taking the time to reach out, and I'm looking forward to potentially working together on your project!
                </div>
                
                <div class="signature">
                    <strong>Best regards,</strong><br>
                    <strong>Yaduraj Singh</strong><br>
                    iOS Developer<br>
                    📱 Specialized in Swift, SwiftUI & iOS Development<br>
                    🌍 Available for remote work worldwide
                </div>
                
                <div class="contact-info">
                    <p>
                        <a href="mailto:yadurajsingham@gmail.com">yadurajsingham@gmail.com</a> | 
                        <a href="https://yaduraj.me">yaduraj.me</a>
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated confirmation. Please don't reply to this email.</p>
                <p>If you have urgent questions, please contact me directly at yadurajsingham@gmail.com</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Email template
const createEmailHTML = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact from Portfolio</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #cb450c, #ff6b35); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .field { margin-bottom: 20px; }
            .field strong { color: #2c3e50; display: block; margin-bottom: 5px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
            .field p { margin: 0; font-size: 16px; color: #333; }
            .message-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #cb450c; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Contact from Portfolio</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Someone wants to connect with you!</p>
            </div>
            
            <div class="content">
                <div class="field">
                    <strong>From:</strong>
                    <p>${data.name}</p>
                </div>
                
                <div class="field">
                    <strong>Email:</strong>
                    <p><a href="mailto:${data.email}" style="color: #cb450c; text-decoration: none;">${data.email}</a></p>
                </div>
                
                <div class="field">
                    <strong>Project Type:</strong>
                    <p>${data.projectType}</p>
                </div>
                
                <div class="field">
                    <strong>Budget Range:</strong>
                    <p>${data.budget}</p>
                </div>
                
                <div class="field">
                    <strong>Message:</strong>
                    <div class="message-box">
                        ${data.message.replace(/\n/g, '<br>')}
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="mailto:${data.email}" style="display: inline-block; background: #cb450c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                        Reply to ${data.name}
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Sent from your portfolio contact form</p>
                <p><a href="https://yadurajsingh.dev" style="color: #cb450c; text-decoration: none;">yadurajsingh.dev</a></p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Validation middleware
const validateContactData = (req, res, next) => {
  const { name, email, projectType, budget, message } = req.body;
  
  // Check required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['name', 'email', 'message']
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format'
    });
  }
  
  // Validate lengths
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({
      error: 'Name must be between 2 and 100 characters'
    });
  }
  
  if (message.length < 10 || message.length > 2000) {
    return res.status(400).json({
      error: 'Message must be between 10 and 2000 characters'
    });
  }
  
  next();
};

// Contact form endpoint
app.post('/api/contact', validateContactData, async (req, res) => {
  try {
    const { name, email, projectType, budget, message } = req.body;
    
    console.log('📧 New contact form submission:', { name, email, projectType, budget });
    
    // Create email transporter
    const transporter = createTransporter();
    
    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('✅ Email server connection verified');
    } catch (error) {
      console.error('❌ Email server connection failed:', error.message);
      return res.status(500).json({
        error: 'Email service configuration error',
        message: 'Please contact the administrator'
      });
    }
    
    // Email options
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `New Contact from Portfolio - ${name}`,
      html: createEmailHTML({ name, email, projectType, budget, message }),
      text: `
New Contact from Portfolio

From: ${name}
Email: ${email}
Project Type: ${projectType || 'Not specified'}
Budget Range: ${budget || 'Not specified'}

Message:
${message}

---
Sent from your portfolio contact form
      `.trim()
    };
    
    // Send email to you
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);

    // Send auto-reply confirmation to the user
    const autoReplyOptions = {
      from: `"Yaduraj Singh" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Thank you for contacting me, ${name}!`,
      html: createAutoReplyHTML({ name, projectType, budget }),
      text: `
Hi ${name},

Thank you for reaching out through my portfolio! I've received your message about "${projectType || 'your project'}" and I'm excited to learn more.

Here's what happens next:
• I'll review your message within 24 hours
• I'll get back to you with questions or next steps
• We can schedule a call to discuss your project in detail

I appreciate you taking the time to contact me, and I look forward to potentially working together!

Best regards,
Yaduraj Singh
iOS Developer
yadurajsingham@gmail.com
https://yaduraj.me

---
This is an automated confirmation. Please don't reply to this email.
      `.trim()
    };

    // Send auto-reply
    const autoReplyInfo = await transporter.sendMail(autoReplyOptions);
    console.log('✅ Auto-reply sent successfully:', autoReplyInfo.messageId);
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    res.status(500).json({
      error: 'Failed to send email',
      message: 'Please try again later or contact directly via email'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend server is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'API endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Portfolio Backend Server Started');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
  
  // Validate email configuration on startup
  if (validateEmailConfig()) {
    console.log('✅ Email configuration validated');
  } else {
    console.log('⚠️  Email configuration incomplete - check .env file');
  }
  
  console.log('📧 Contact endpoint: POST /api/contact');
  console.log('🏥 Health check: GET /api/health');
  console.log('🧪 Test endpoint: GET /api/test');
});

module.exports = app; 