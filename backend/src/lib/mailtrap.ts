import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;

if (!TOKEN) {
  throw new Error(
    "MAILTRAP_TOKEN must be defined in the environment variables"
  );
}

export const mailTrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: process.env.EMAIL_FROM,
  name: process.env.EMAIL_FROM_NAME,
};
