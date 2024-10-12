import { sendCommentNotificationEmail } from "../emails/emailHandlers";
import { mailTrapClient } from "../lib/mailtrap";

jest.mock("../lib/mailtrap", () => {
  const originalModule = jest.requireActual("../lib/mailtrap");

  return {
    ...originalModule,
    mailTrapClient: {
      send: jest.fn(), // Mock the send method
    },
  };
});

describe("sendCommentNotificationEmail", () => {
  it("should send the email successfully", async () => {
    // Mock implementation of send
    (mailTrapClient.send as jest.Mock).mockResolvedValue({ success: true });

    const result = await sendCommentNotificationEmail(
      "recipient@example.com",
      "Recipient Name",
      "Commenter Name",
      "http://example.com/post/1",
      "This is a comment"
    );

    expect(result).toEqual({ success: true });
    expect(mailTrapClient.send).toHaveBeenCalledWith({
      from: {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME,
      },
      to: [{ email: "recipient@example.com" }],
      subject: "Comment on your post",
      html: expect.any(String),
      category: "comment notification",
    });
  });
});
