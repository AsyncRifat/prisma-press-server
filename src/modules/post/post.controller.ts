import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import httpStatus from 'http-status';
import { sendResponse } from '../../utils/sendResponse';
import { postService } from './post.service';

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const payload = req.body;

    const result = await postService.createPost(payload, id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'Post created successfully',
      data: result,
    });
  },
);

const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    // console.log(query);

    const result = await postService.getAllPosts(query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User registered successfully',
      data: result.data,
      meta: result.meta,
    });
  },
);

const getPostsStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await postService.getPostsStats();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Post stats retrieved successfully',
      data: result,
    });
  },
);

const getMyPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const result = await postService.getMyPost(authorId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'My posts retrieved successfully',
      data: result,
    });
  },
);

const getPostsById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    if (!postId) {
      throw new Error('Post Id Required');
    }

    const result = await postService.getPostById(postId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Post retrieved successfully',
      data: result,
    });
  },
);

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const postId = req.params.postId;
    const payload = req.body;

    const result = await postService.updatePost(
      postId as string,
      payload,
      authorId as string,
      isAdmin,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Post Updated successfully',
      data: result,
    });
  },
);

const deletePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const postId = req.params.postId;
    if (!postId) {
      throw new Error('Post Id Required');
    }

    const result = await postService.deletePost(
      postId as string,
      authorId as string,
      isAdmin,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Post deleted successfully',
      data: result,
    });
  },
);
export const postController = {
  createPost,
  getAllPosts,
  getPostsStats,
  getMyPosts,
  getPostsById,
  updatePost,
  deletePost,
};
