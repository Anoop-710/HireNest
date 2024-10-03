import { mailTrapClient, sender } from "../lib/mailtrap";
import {
  createCommentNotificationEmailTemplate,
  createWelcomeEmailTemplate,
} from "./emailTemplates";
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

export const sendCommentNotificationEmail = async (
  recipientEmail: string,
  recipientName: string,
  commenterName: string,
  postUrl: string,
  commentContent: string
): Promise<{ success: boolean }> => {
  const recipient = [{ email: recipientEmail }];
  try {
    const response = await mailTrapClient.send({
      from: {
        email: sender?.email!, // Ensure sender is properly defined
        name: sender?.name!,
      },
      to: recipient,
      subject: "Comment on your post",
      html: createCommentNotificationEmailTemplate(
        recipientName,
        commenterName,
        postUrl,
        commentContent
      ),
      category: "comment notification",
    });

    console.log(`Comment notification email sent successfully: ${response}`);

    // Return a success object
    return { success: true }; // Ensure this return statement is added
  } catch (error) {
    console.error("Error sending comment notification email:", error);
    throw error; // Optionally rethrow the error
  }
};
