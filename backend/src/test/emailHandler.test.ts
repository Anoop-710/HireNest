import { createComment } from "../controllers/post.controller";
import { Request, Response } from "express";
import Post from "../models/post.model";
import Notification from "../models/notification.model";
import { sendCommentNotificationEmail } from "../emails/emailHandlers";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    name: string;
  };
}

describe("createComment", () => {
  it("should create a comment and send notification if the commenter is not the post owner", async () => {
    // Mock request and response objects
    const req: Partial<AuthenticatedRequest> = {
      params: { id: "123" },
      body: { content: "This is a test comment" },
      user: { _id: "456", name: "John Doe" },
    };

    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Define mock Post object
    const postMock = {
      author: { _id: "789", email: "owner@example.com", name: "Jane Doe" },
      comments: [],
    };

    // Mock the Post.findByIdAndUpdate method to return a chainable query with populate
    const execMock = jest.fn().mockResolvedValue(postMock);
    const populateMock = jest.fn().mockReturnValue({ exec: execMock });

    jest.spyOn(Post, "findByIdAndUpdate").mockReturnValue({
      populate: populateMock,
    } as unknown as ReturnType<typeof Post.findByIdAndUpdate>); // Cast to the expected Query type

    // Mock the sendCommentNotificationEmail function
    const sendEmailMock = jest
      .spyOn(require("../emails/emailHandlers"), "sendCommentNotificationEmail")
      .mockResolvedValue({ success: true });

    await createComment(req as Request, res as Response);

    // Assertions
    expect(sendEmailMock).toHaveBeenCalledWith(
      "Jane Doe", // post.author.name
      "owner@example.com", // post.author.email
      "John Doe", // req.user.name
      expect.any(String), // post URL
      "This is a test comment" // req.body.content
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(postMock);

    sendEmailMock.mockRestore();
  });
});
