import nodemailer from "nodemailer";

import { env } from "../../../config/env.service";
import Mail from "nodemailer/lib/mailer";

export const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
},
});


export const sendEmail = async({to,subject,html}:Mail.Options):Promise<void>=>{
const info = await transporter.sendMail({
    from: `"Ahmed Yosri" <${env.EMAIL_USER}>`, // sender address
    to, // clinet email
    subject, 
    html
})
console.log("Message sent: %s", info.messageId);
}


