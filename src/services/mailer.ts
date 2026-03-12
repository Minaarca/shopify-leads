import nodemailer from "nodemailer";

interface SendEmailOptions {
    to: string;
    subject: string;
    body: string;
    auth: {
        user: string;
        pass: string;
    };
}

export async function sendEmail({ to, subject, body, auth }: SendEmailOptions) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: auth.user,
                pass: auth.pass,
            },
        });

        const info = await transporter.sendMail({
            from: auth.user,
            to,
            subject,
            text: body,
            html: body.replace(/\n/g, "<br>"), // Basic text to HTML conversion
        });

        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
}
