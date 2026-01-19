const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Key authentication
const API_KEY = process.env.API_KEY || 'your-secure-api-key-here';

// Create SMTP transporter
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mangomail.com',
  port: smtpPort,
  secure: smtpPort === 465, // true for 465 (SSL), false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'smtp-relay' });
});

// Send email endpoint
app.post('/send', async (req, res) => {
  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey || apiKey !== API_KEY) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: Invalid API key' 
      });
    }

    const { to, subject, html, text, attachments, from } = req.body;

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, and either html or text'
      });
    }

    // Prepare email options
    const mailOptions = {
      from: from || process.env.FROM_EMAIL || 'noreply@adlindustries.net',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || undefined,
      attachments: attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        encoding: 'base64'
      }))
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', {
      messageId: info.messageId,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    res.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`SMTP Relay server running on port ${PORT}`);
  console.log(`SMTP Host: ${process.env.SMTP_HOST || 'smtp.mangomail.com'}`);
  console.log(`SMTP Port: ${process.env.SMTP_PORT || '587'}`);
});
