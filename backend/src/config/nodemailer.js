const nodemailer = require('nodemailer');

const mailUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'your-email@gmail.com';
const mailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || 'your-app-password';
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || mailUser;
const FROM_NAME = process.env.SMTP_FROM_NAME || 'Organic Store';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// SMTP transporter — used locally / as a fallback when no Brevo key is set.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: { user: mailUser, pass: mailPass },
    tls: { rejectUnauthorized: false }
});

/**
 * Send via Brevo's HTTPS transactional-email API.
 * Works on hosts that block outbound SMTP (e.g. Render's free tier).
 */
async function sendViaBrevo({ to, subject, html, text, attachments }) {
    const body = {
        sender: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: to }],
        subject,
        htmlContent: html || (text ? `<pre>${text}</pre>` : undefined),
        textContent: text || undefined
    };
    if (attachments && attachments.length) {
        body.attachment = attachments.map((a) => ({
            name: a.filename,
            content: Buffer.isBuffer(a.content) ? a.content.toString('base64') : Buffer.from(a.content || '').toString('base64')
        }));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        if (!res.ok) {
            const t = await res.text().catch(() => '');
            throw new Error(`Brevo HTTP ${res.status} ${t.slice(0, 200)}`);
        }
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Unified low-level send. Uses Brevo (HTTPS) if BREVO_API_KEY is set,
 * otherwise falls back to SMTP (nodemailer).
 */
async function dispatchMail({ to, subject, html, text, attachments }) {
    if (!to) throw new Error('Email recipient (to) is required');
    if (BREVO_API_KEY && typeof fetch !== 'undefined') {
        return sendViaBrevo({ to, subject, html, text, attachments });
    }
    return transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to,
        subject,
        html,
        text,
        attachments
    });
}

// Back-compat wrapper used by the order/invoice flow.
// Accepts either { to } or { email }, and either { text } or { message }.
const sendEmail = async (options) => {
    return dispatchMail({
        to: options.to || options.email,
        subject: options.subject,
        html: options.html,
        text: options.text || options.message,
        attachments: options.attachments
    });
};

module.exports = { transporter, sendEmail, dispatchMail, sendViaBrevo };
