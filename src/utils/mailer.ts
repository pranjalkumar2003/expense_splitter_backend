import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail", // can be 'gmail', 'outlook', or use host/port for SMTP
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password (not regular password)
  },
});

export const sendInviteEmail = async (to: string, Name: string, inviteLink: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Invitation to join ESplitter plateForm`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        <p style="color: red; font-weight: bold;">Caution: External Email</p>
        <p>Please be cautious when interacting with this email. It may be malicious.</p>
        
        <p>Hello, <b>${Name}</b>!</p>
        
        <p>
          You have been invited to join as a member on the
          <b>ESplitter</b> platform.
        </p>
        
        <p>
          Please click on the link below to activate your account and start using our platform:
        </p>
        
        <p>
          <a href="${inviteLink}" target="_blank" style="color: #1a73e8; font-weight: bold;">
            Click here
          </a>
        </p>
        
        <p>
          If you have any questions or need assistance, please contact our support team at 
          <a href="mailto:support@expensesplitter.com">support@expensesplitter.com</a>.
        </p>
        
        <p>Thank you</p>
        <p>Regards,<br/>ESplitter Admin</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};


export const sendGroupInviteEmail = async (
  to: string,
  groupName: string,
  inviteLink: string
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Invitation to join ${groupName} on ESplitter`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        <p style="color: red; font-weight: bold;">Caution: External Email</p>
        <p>Please be cautious when interacting with this email. It may be malicious.</p>
        
        <p>Hello, <b>${to}</b>!</p>
        
        <p>
          You have been invited to join <b>${groupName}</b> as a member on the
          <b>ESplitter</b> platform.
        </p>
        
        <p>
          Please click on the link below to activate your account and start using our platform:
        </p>
        
        <p>
          <a href="${inviteLink}" target="_blank" style="color: #1a73e8; font-weight: bold;">
            Click here
          </a>
        </p>
        
        <p>
          If you have any questions or need assistance, please contact our support team at 
          <a href="mailto:support@expensesplitter.com">support@expensesplitter.com</a>.
        </p>
        
        <p>Thank you</p>
        <p>Regards,<br/>ESplitter Admin</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

