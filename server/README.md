# Portfolio Backend Server

Custom Node.js + Express + Nodemailer backend for Yaduraj Singh's portfolio contact form.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Email Settings

Create a `.env` file in the `server` directory:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=yadurajsingham@gmail.com

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 3. Gmail Setup (Recommended)

For Gmail, you need to:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### 4. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## 📡 API Endpoints

- **POST** `/api/contact` - Send contact form email
- **GET** `/api/health` - Health check
- **GET** `/api/test` - Test if server is running

## 🔒 Security Features

- **Rate Limiting**: Max 5 requests per 15 minutes per IP
- **CORS Protection**: Only allows specified origins
- **Input Validation**: Validates all form data
- **Helmet Security**: Additional security headers
- **Error Handling**: Proper error responses

## 📧 Email Template

The server sends beautiful HTML emails with:
- Professional design matching your portfolio
- All contact form data
- Direct reply functionality
- Mobile-responsive layout

## 🧪 Testing

Test the server:
```bash
curl http://localhost:3001/api/test
```

Test contact form:
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "projectType": "iOS App Development",
    "budget": "Under $5,000",
    "message": "This is a test message"
  }'
```

## 🚀 Deployment

For production deployment, consider:
- **Vercel** (recommended for Node.js)
- **Railway**
- **Heroku**
- **DigitalOcean**

Make sure to set environment variables in your hosting platform.

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USER` | Your email address | `your@gmail.com` |
| `EMAIL_PASS` | App password | `abcd efgh ijkl mnop` |
| `EMAIL_FROM` | From email address | `your@gmail.com` |
| `EMAIL_TO` | Where to send emails | `yadurajsingham@gmail.com` |
| `PORT` | Server port | `3001` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000` |

## 🐛 Troubleshooting

**Email not sending?**
- Check your app password
- Verify 2FA is enabled
- Check spam folder
- Look at server logs

**CORS errors?**
- Add your domain to `ALLOWED_ORIGINS`
- Check the frontend is making requests to correct URL

**Rate limiting?**
- Wait 15 minutes or adjust limits in code 