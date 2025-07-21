import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    }
});

export const sendResetEmail = async (to, token) => {
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    const mailOptions = {
        from: `"Lion Lanka Electric" <${process.env.EMAIL}>`,
        to,
        subject: '🔐 Reset Your Password - Lion Lanka Electric',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 30px; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://drive.google.com/uc?export=view&id=1CjrcTvOYC322Uo_mUTCrzqewU1aXo7Li" alt="Lion Lanka Electric" style="width: 150px;" />
        </div>
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p style="font-size: 16px; color: #555;">
          Hello,<br/><br/>
          We received a request to reset your password for your Lion Lanka Electric account.
          Click the button below to reset it. This link will expire in <strong>15 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 5px; display: inline-block; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #888;">
          If you did not request a password reset, you can safely ignore this email.<br/>
          For any issues, contact our support team.
        </p>
        <hr style="margin: 30px 0;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          &copy; ${new Date().getFullYear()} Lion Lanka Electric. All rights reserved.<br/>
          No. 123, Main Street, Colombo, Sri Lanka
        </p>
      </div>
    `
    };

    await transporter.sendMail(mailOptions);
};