import {ok} from "../is";
import {Transporter, SendMailOptions} from "nodemailer";

export const {
    MAIL_MAILER,
    MAIL_URL,
    MAIL_HOST = "smtp.mailgun.org",
    MAIL_PORT = "587",
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_ENCRYPTION = "tls",
    MAIL_SENDMAIL_PATH,
    MAIL_MAILGUN_API_KEY,
    MAIL_MAILGUN_DOMAIN
} = process.env;

export async function email(options: SendMailOptions) {
    const transport = await getNodemailerTransport();
    return transport.sendMail(options);
}

let transport: Transporter<unknown>;

export async function getNodemailerTransport(): Promise<Transporter<unknown>> {
    if (transport) return transport;
    return transport = await getTransport();

    async function getTransport() {

        const nodemailer = await import("nodemailer");

        if (MAIL_MAILER === "mailgun") {
            const mailgun = await import("nodemailer-mailgun-transport");
            return nodemailer.createTransport(mailgun({
                auth: {
                    domain: MAIL_MAILGUN_DOMAIN || MAIL_USERNAME,
                    api_key: MAIL_MAILGUN_API_KEY || MAIL_PASSWORD
                }
            }));
        }

        if (MAIL_MAILER === "sendmail") {
            return nodemailer.createTransport({
                sendmail: true,
                path: MAIL_SENDMAIL_PATH
            });
        }

        ok(!MAIL_MAILER || MAIL_MAILER === "smtp", `Unsupported MAIL_MAILER "${MAIL_MAILER}"`);
        return nodemailer.createTransport({
            url: MAIL_URL,
            host: MAIL_HOST,
            port: MAIL_PORT ? +MAIL_PORT : undefined,
            auth: (MAIL_USERNAME || MAIL_PASSWORD) ? {
                user: MAIL_USERNAME,
                pass: MAIL_PASSWORD
            } : undefined,
            tls: {
                rejectUnauthorized: MAIL_ENCRYPTION === "tls"
            }
        });
    }
}