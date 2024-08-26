import nodemailer from "nodemailer";

export const sendEmails = async ({
  email,
  subject,
  content,
}: {
  email?: string;
  subject: string;
  content: string;
}) => {
  const smtpConfig = {
    host: "smtp.ionos.fr",
    port: 465,
    secure: true,
    auth: {
      user: "ne-pas-repondre@myrendev.com",
      pass: "Liamedia2608150155@",
    },
  };
  const transporter = nodemailer.createTransport(smtpConfig);
  const mailOptions = {
    from: "ne-pas-repondre@myrendev.com",
    to: email,
    subject: subject,
    html: content,
    
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(`Error: ${error}`);
    }
    console.log(`Message sent: ${info.response}`);
  });
};
