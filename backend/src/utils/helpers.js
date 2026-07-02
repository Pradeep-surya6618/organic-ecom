// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Format OTP email template
const getOTPEmailTemplate = (name, otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .body { padding: 30px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #4CAF50; text-align: center; letter-spacing: 8px; margin: 20px 0; }
            .footer { background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Organic Store</h1>
            </div>
            <div class="body">
                <h2>Hello ${name},</h2>
                <p>Your One-Time Password (OTP) for verification is:</p>
                <div class="otp-code">${otp}</div>
                <p>This OTP will expire in <strong>10 minutes</strong>.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>Organic Store - Fresh & Organic Products</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { generateOTP, getOTPEmailTemplate };