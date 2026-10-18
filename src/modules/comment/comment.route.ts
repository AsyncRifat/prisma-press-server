import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { Role } from '../../../generated/prisma/enums';
import { commentController } from './comment.controller';

const router = Router();

router.post('/', auth(Role.ADMIN, Role.USER), commentController.createComment);

router.get('/author/:authorId', commentController.getCommentByAuthorId);

router.get('/:commentId', commentController.getCommentByCommentId);
router.patch(
  '/:commentId',
  auth(Role.ADMIN, Role.USER),
  commentController.updateComment,
);
router.delete(
  '/:commentId',
  auth(Role.ADMIN, Role.USER),
  commentController.deleteComment,
);

router.patch(
  '/:commentId/moderate',
  auth(Role.ADMIN),
  commentController.updateCommentByModerator,
);
export const commentRoutes = router;
