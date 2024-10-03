import { sendCommentNotificationEmail } from "../emails/emailHandlers";
import cloudinary from "../lib/cloudinary";
import User from "../models/auth.model";
import Notification from "../models/notification.model";
import Post from "../models/post.model";
import { Request, Response } from "express";
import { IPost } from "../Interfaces/post.interface";

type AuthenticatedRequest = Request & {
  user?: typeof User.prototype;
};
export const getFeedPosts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const posts = await Post.find({
      author: { $in: req.user.connections },
    })
      .populate("author", "name, username, profilePicture headline")
      .populate("comments.user", "name, profilePicture")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(`Error in getFeedPosts ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createPost = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { content, image } = req.body;

    let newPost;

    if (image) {
      const imageRes = await cloudinary.uploader.upload(image);
      newPost = new Post({
        author: req.user._id,
        content,
        image: imageRes.secure_url,
      });
    } else {
      newPost = new Post({
        author: req.user._id,
        content,
      });
    }

    // save post to database
    await newPost.save();
    res.json(201).json(newPost);
  } catch (error) {
    console.error(`Error in createPost ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // check if not owner of the post
    if (post.author.toString() !== userId.toString()) {
      res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
      return;
    }

    // delete image if present
    if (post.image) {
      const imagePublicId = post?.image?.split("/").pop()?.split(".")[0];
      if (imagePublicId) {
        await cloudinary.uploader.destroy(imagePublicId);
      }
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(`Error in deletePost ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPostById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture username headline");

    res.status(200).json(post);
  } catch (error) {
    console.error(`Error in getPostById ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createComment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    const post: IPost | null = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            user: req.user._id,
            content,
          },
        },
      },
      { new: true }
    ).populate("author", "name email username headline profilePicture"); // Populate author details

    if (post?.author && "name" in post.author && "email" in post.author) {
      // send notification if comment owner is not the post owner
      if (post.author._id.toString() !== req.user._id.toString()) {
        const newNotification = new Notification({
          recipient: post.author._id,
          type: "comment",
          relatedUser: req.user._id,
          relatedPost: postId,
        });

        await newNotification.save();

        try {
          const postUrl = `${process.env.CLIENT_URL}/post/${postId}`;
          await sendCommentNotificationEmail(
            post.author.name,
            post.author.email,
            req.user.name!,
            postUrl,
            content
          );
          console.log(postUrl);
        } catch (error) {
          console.error(
            `Error in sendCommentNotificationEmail ${(error as Error).message}`
          );
        }
      }
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(`Error in createComment ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const likePost = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    const userId = req.user?._id;

    if (post?.likes.includes(userId)) {
      // remove like
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // add like
      post?.likes.push(userId);

      // create notification if liked user is not the post owner
      if (post?.author.toString() !== userId.toString()) {
        const newNotification = new Notification({
          recipient: post?.author,
          type: "like",
          relatedUser: userId,
          relatedPost: postId,
        });

        await newNotification.save();
      }

      await post?.save();
    }
  } catch (error) {
    console.error(`Error in likePost ${(error as Error).message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
