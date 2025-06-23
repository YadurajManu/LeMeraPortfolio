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
      'http://localhost:3001'
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
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    
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