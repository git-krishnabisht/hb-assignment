import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code - Auth App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Your OTP Code</h2>
          <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">
            Use this one-time password to complete your authentication:
          </p>
          <div style="background-color: #f0f8ff; border: 2px dashed #4CAF50; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
            <h1 style="color: #4CAF50; font-size: 36px; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 2px;">${otp}</h1>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
            ⏰ This code will expire in 10 minutes for security purposes.
          </p>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
