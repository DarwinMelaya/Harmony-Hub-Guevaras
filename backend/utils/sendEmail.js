const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Harmony Hub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

// Professional email template for verification code
const getVerificationEmailTemplate = (fullName, verificationCode) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - Harmony Hub</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                    Harmony <span style="color: #ff4444;">Hub</span>
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                    Email Verification
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                    Welcome, ${fullName}!
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Thank you for signing up with Harmony Hub! To complete your registration and secure your account, please verify your email address by entering the verification code below:
                  </p>
                  
                  <!-- Verification Code Box -->
                  <table role="presentation" style="width: 100%; margin: 30px 0; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 0;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
                          <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                            Your Verification Code
                          </p>
                          <p style="margin: 0; color: #ffffff; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${verificationCode}
                          </p>
                          <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 12px; opacity: 0.9;">
                            This code will expire in 10 minutes
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    If you didn't create an account with Harmony Hub, please ignore this email or contact our support team if you have concerns.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-align: center;">
                    Need help? Contact us at 
                    <a href="mailto:support@harmonyhub.com" style="color: #667eea; text-decoration: none; font-weight: 600;">support@harmonyhub.com</a>
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} Harmony Hub. All rights reserved.
                  </p>
                  <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px; text-align: center;">
                    This is an automated email, please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Professional email template for welcome email
const getWelcomeEmailTemplate = (fullName, email) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Harmony Hub</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                    Harmony <span style="color: #ff4444;">Hub</span>
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                    Welcome to Our Community!
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                    Welcome, ${fullName}! 🎉
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    We're thrilled to have you join the Harmony Hub community! Your account has been successfully created and verified.
                  </p>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Your email address <strong style="color: #333333;">${email}</strong> has been verified and you're all set to start exploring all the amazing features we have to offer.
                  </p>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
                    <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 600; margin-bottom: 10px;">
                      What's Next?
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                      <li>Complete your profile</li>
                      <li>Explore our services</li>
                      <li>Connect with our community</li>
                      <li>Start your journey with Harmony Hub</li>
                    </ul>
                  </div>
                  
                  <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    If you have any questions or need assistance, don't hesitate to reach out to our support team. We're here to help!
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-align: center;">
                    With love,<br/>
                    <strong style="color: #333333;">The Harmony Hub Team</strong>
                  </p>
                  <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} Harmony Hub. All rights reserved.
                  </p>
                  <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px; text-align: center;">
                    This is an automated email, please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Professional email template for password reset
const getPasswordResetEmailTemplate = (fullName, resetCode) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Harmony Hub</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                    Harmony <span style="color: #ff4444;">Hub</span>
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                    Password Reset Request
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                    Hello, ${fullName}!
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    We received a request to reset your password for your Harmony Hub account. If you didn't make this request, please ignore this email.
                  </p>
                  
                  <!-- Reset Code Box -->
                  <table role="presentation" style="width: 100%; margin: 30px 0; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 0;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
                          <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                            Your Password Reset Code
                          </p>
                          <p style="margin: 0; color: #ffffff; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${resetCode}
                          </p>
                          <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 12px; opacity: 0.9;">
                            This code will expire in 10 minutes
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    Enter this code in the password reset form to create a new password. For security reasons, this code can only be used once and will expire in 10 minutes.
                  </p>
                  
                  <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                      <strong>Security Tip:</strong> Never share this code with anyone. Harmony Hub will never ask for your password reset code via phone or email.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-align: center;">
                    Need help? Contact us at 
                    <a href="mailto:support@harmonyhub.com" style="color: #667eea; text-decoration: none; font-weight: 600;">support@harmonyhub.com</a>
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} Harmony Hub. All rights reserved.
                  </p>
                  <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px; text-align: center;">
                    This is an automated email, please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = sendEmail;
module.exports.getVerificationEmailTemplate = getVerificationEmailTemplate;
module.exports.getWelcomeEmailTemplate = getWelcomeEmailTemplate;
module.exports.getPasswordResetEmailTemplate = getPasswordResetEmailTemplate;
