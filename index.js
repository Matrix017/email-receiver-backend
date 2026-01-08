const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configure multer for multipart/form-data
const upload = multer();

// Logging middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.url}`);
    next();
});

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Route to handle form submission
app.post('/send-email', upload.none(), async (req, res) => {
    console.log('Content-Type:', req.headers['content-type']);
    console.log(req.body);
    const body = req.body || {};
    const { name, email, subject, message } = body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields: name, email, message' });
    }
    
    try {
        console.log(`Sending email to ${process.env.EMAIL_USER} from ${email}`);
        await transporter.sendMail({
            from: email,
            to: process.env.EMAIL_USER,
            subject: subject || `New message from ${name}`,
            text: message,
            html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message}</p>`,
        });
        console.log('Email sent successfully');
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});