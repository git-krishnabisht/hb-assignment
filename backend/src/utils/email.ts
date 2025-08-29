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
  otp: string,
  isSignup: boolean = false
): Promise<void> => {
  const actionType = isSignup ? "Sign Up" : "Sign In";
  const actionDescription = isSignup
    ? "complete your registration"
    : "sign in to your account";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your OTP Code - ${actionType} to Auth App`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center; margin-bottom: 10px;">Your OTP Code</h2>
          <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 30px;">
            ${actionType} Request
          </p>
          <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">
            Use this one-time password to ${actionDescription}:
          </p>
          <div style="background-color: #f0f8ff; border: 2px dashed #4CAF50; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
            <h1 style="color: #4CAF50; font-size: 36px; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 2px;">${otp}</h1>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
            ⏰ This code will expire in 10 minutes for security purposes.
          </p>
          ${
            isSignup
              ? `
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px; padding: 15px; background-color: #e8f5e8; border-radius: 5px;">
            🎉 Welcome! You're just one step away from creating your account.
          </p>
          `
              : ""
          }
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            If you didn't request this ${actionType.toLowerCase()}, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Legacy method for backward compatibility
export const sendSigninOTPEmail = async (
  email: string,
  otp: string
): Promise<void> => {
  return sendOTPEmail(email, otp, false);
};

export const sendSignupOTPEmail = async (
  email: string,
  otp: string
): Promise<void> => {
  return sendOTPEmail(email, otp, true);
};
