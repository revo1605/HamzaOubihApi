import { Router } from 'express';
import { CommentsController } from '../controllers';
import { validateCreatePost } from '../middlewares/dataValidator';
import authJwt from '../middlewares/authJwt';


export class CommentsRoute {
    private commentsController: CommentsController;

    constructor(commentsController: CommentsController) {
        this.commentsController = commentsController;
    }


    createRouter(): Router {
        const router = Router();

        router.post('/posts/:postId/comments',authJwt.verifyToken , this.commentsController.addCommentToPost.bind(this.commentsController));

        router.get('/comments', this.commentsController.getComments.bind(this.commentsController))

        router.get('/posts/:postId/comments', this.commentsController.getallCommentsPost.bind(this.commentsController));

        router.get('/comments/:id', this.commentsController.getCommentById.bind(this.commentsController));

        router.put('/comments/:id', this.commentsController.updateComment.bind(this.commentsController));

        router.delete('/comments/:id', this.commentsController.deleteComment.bind(this.commentsController));

        router.post('/comments/:id/vote',authJwt.verifyToken , this.commentsController.updownvote.bind(this.commentsController));

        
        return router;

    }
}