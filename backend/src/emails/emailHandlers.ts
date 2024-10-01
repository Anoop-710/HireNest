import { mailTrapClient, sender } from "../lib/mailtrap";
import { createWelcomeEmailTemplate } from "./emailTemplates";
export const sendWelcomeEmail = async (
  name: string,
  email: string,
  profileUrl: string
): Promise<void> => {
  const recipient = [{ email }];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Recipient email is invalid");
  }

  if (!sender.email || !sender.name) {
    throw new Error("Sender email and name must be defined.");
  }
  try {
    const response = await mailTrapClient.send({
      from: {
        email: sender.email!, // Now guaranteed to be a string
        name: sender.name!, // Now guaranteed to be a string
      },
      to: recipient,
      subject: "Welcome to HireNest",
      html: createWelcomeEmailTemplate(name, profileUrl),
      category: "welcome",
    });

    console.log(`Welcome email sent successfully: ${response}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};
