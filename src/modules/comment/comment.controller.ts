import { catchAsync } from '../../utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { commentService } from './comment.service';

const createComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id as string;
    const payload = req.body;
    const result = await commentService.createComment(authorId, payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'Comment post successfully',
      data: result,
    });
  },
);
const getCommentByAuthorId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { authorId } = req.params;

    const result = await commentService.getCommentByAuthorId(
      authorId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Get comments data retrieved successfully by authorId',
      data: result,
    });
  },
);

// not good approach
const getCommentByCommentId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params;
    // console.log(commentId);

    const result = await commentService.getCommentByCommentId(
      commentId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Comment fetched successfully',
      data: result,
    });
  },
);
const updateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params;
    const authorId = req.user?.id;
    const data = req.body;
    const result = await commentService.updateComment(
      commentId as string,
      data,
      authorId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Comment updated successfully',
      data: result,
    });
  },
);
const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params;
    const authorId = req.user?.id;
    const result = await commentService.deleteComment(
      commentId as string,
      authorId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Comment updated successfully',
      data: result,
    });
  },
);
const updateCommentByModerator = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params;
    const data = req.body;
    const result = await commentService.moderateComment(
      commentId as string,
      data,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Comment status updated successfully',
      data: result,
    });
  },
);
export const commentController = {
  createComment,
  getCommentByAuthorId,
  getCommentByCommentId,
  updateComment,
  deleteComment,
  updateCommentByModerator,
};
