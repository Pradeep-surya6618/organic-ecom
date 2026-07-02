const { transporter } = require('../config/nodemailer');
const logger = require('../utils/logger');

class EmailService {
    async sendMail({ to, subject, html, text }) {
        try {
            const mailOptions = {
                from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
                to, subject, html, text
            };
            const result = await transporter.sendMail(mailOptions);
            logger.info(`Email sent to ${to}: ${result.messageId}`);
            return result;
        } catch (error) {
            logger.error(`Email sending failed to ${to}:`, error);
            throw error;
        }
    }

    async sendOTPEmail(email, otpCode, purpose) {
        const purposeText = {
            registration: 'Verify your email address',
            login: 'Complete your login',
            password_reset: 'Reset your password',
            email_change: 'Verify your new email'
        };
        await this.sendMail({
            to: email,
            subject: `Your OTP Code - Organic Store`,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;">
                <h2 style="color:#2d6a4f;text-align:center;">Organic Store</h2>
                <p style="font-size:16px;color:#333;">${purposeText[purpose] || 'Verify your request'}</p>
                <div style="background:#f0f7f4;padding:20px;text-align:center;border-radius:4px;margin:20px 0;">
                    <p style="font-size:14px;color:#666;margin:0 0 10px 0;">Your OTP Code:</p>
                    <h1 style="font-size:36px;color:#2d6a4f;letter-spacing:8px;margin:0;">${otpCode}</h1>
                </div>
                <p style="font-size:14px;color:#666;text-align:center;">This code expires in <strong>10 minutes</strong>.</p>
            </div>`
        });
    }

    async sendOrderConfirmation(email, order) {
        await this.sendMail({
            to: email,
            subject: `Order Confirmed - ${order.orderNumber}`,
            html: `<div style="font-family:Arial,sans-serif;"><h2 style="color:#2d6a4f;">Order Confirmed!</h2><p>Your order <strong>${order.orderNumber}</strong> has been confirmed.</p><p>Total: Rs.${order.pricing.total}</p></div>`
        });
    }

    async sendOrderStatusUpdate(email, order, status) {
        const statusMessages = {
            confirmed: 'Your order has been confirmed!',
            processing: 'Your order is being processed.',
            packed: 'Your order has been packed!',
            out_for_delivery: 'Your order is out for delivery!',
            delivered: 'Your order has been delivered!',
            cancelled: 'Your order has been cancelled.'
        };
        await this.sendMail({
            to: email,
            subject: `Order Update - ${order.orderNumber}`,
            html: `<div style="font-family:Arial,sans-serif;"><h2 style="color:#2d6a4f;">${statusMessages[status] || 'Order Update'}</h2><p>Order: <strong>${order.orderNumber}</strong></p><p>Status: <strong>${status}</strong></p></div>`
        });
    }
}
module.exports = new EmailService();