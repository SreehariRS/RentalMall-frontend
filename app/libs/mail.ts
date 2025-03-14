import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = "https://www.rentalmall.site";

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmationLink = `${domain}/verify-email?token=${token}`;

  const emailHTML = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #4caf50; padding: 20px; text-align: center; color: #fff;">
        <h1 style="margin: 0; font-size: 24px;">Welcome to RENTALMALL</h1>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for signing up with <strong>RENTALMALL</strong>. Please verify your email address to start exploring our platform.
        </p>
        <p style="text-align: center;">
          <a 
            href="${confirmationLink}" 
            style="display: inline-block; background-color: #4caf50; color: #ffffff; text-decoration: none; padding: 12px 20px; font-size: 16px; border-radius: 4px; margin-top: 20px;">
            Verify Email Address
          </a>
        </p>
        <p style="margin-top: 20px; font-size: 14px; color: #555;">
          If the button above does not work, copy and paste the following link into your browser:
        </p>
        <p style="font-size: 14px; color: #555; word-wrap: break-word;">
          <a href="${confirmationLink}" style="color: #4caf50;">${confirmationLink}</a>
        </p>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 14px; color: #888;">
        <p style="margin: 0;">© ${new Date().getFullYear()} RENTALMALL. All rights reserved.</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: "no-reply@rentalmall.site", // ✅ Using the correct sender email
    to: email,
    subject: "Verify your email - RENTALMALL",
    html: emailHTML,
  });
};
