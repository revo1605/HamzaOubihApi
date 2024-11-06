import { Request, Response } from 'express';
import { PostsService } from '../services';
import { validationResult } from 'express-validator';

export class PostsController {
  private postsService: PostsService;
  upVote: any;
  downVote: any;
  getPostByTitle: any;

  constructor(postsService: PostsService) {
    this.postsService = postsService;
  }

  async createPost(request: Request, response: Response): Promise<void> {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      response.status(400).json({
        status: 400,
        message: 'Bad request.',
        data: errors.array(),
      });
    } else {
      try {
        const { title, description, categories , usersVote } = request.body;

        const postData = {
          title,
          description,
          categories,
          usersVote,
          createdBy: request.userId,
        };

        const postResponse = await this.postsService.createPost(postData);

        response.status(postResponse.status).send({
          ...postResponse,
        });
      } catch (error) {
        response.status(500).json({
          status: 500,
          message: 'Internal server error',
          data: error
        });
      }
    }
  }

  async getPosts(request: Request, response: Response): Promise<void> {
    try {
      console.log('Category name');
      console.log(request.query.category);

      const postsResponse = await this.postsService.getPosts();

      response.status(postsResponse.status).send({
        ...postsResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      });
    }
  }

  async getCategories(request: Request, response: Response): Promise<void> {
    try {
      const categoriesResponse = await this.postsService.getCategories();

      response.status(categoriesResponse.status).send({
        ...categoriesResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      });
    }
  }

  async addCommentToPost(request: Request, response: Response): Promise<void> {
    const errors = validationResult(request);
  
    if (!errors.isEmpty()) {
      response.status(400).json({
        status: 400,
        message: 'Bad request.',
        data: errors.array(),
      });
    } else {
      try {
        const { description } = request.body;
        const postId = request.params.postId;
  
        if (!postId) {
          response.status(400).json({
            status: 400,
            message: 'Post ID is required.',
          });
          return;
        }
  
        const commentData = {
          description,
          createdBy: request.userId,
        };
  
        const commentResponse = await this.postsService.addCommentToPost(commentData, postId);
  
        response.status(commentResponse.status).send({
          ...commentResponse,
        });
      } catch (error) {
        response.status(500).json({
          status: 500,
          message: 'Internal server error',
          data: error,
        });
      }
    }
  }
  

  async getPostById(request: Request, response: Response): Promise<void> {
    try {
      if (request.params.id) {
        const postsResponse = await this.postsService.getPostById(request.params.id);

        response.status(postsResponse.status).send({
          ...postsResponse,
        });
      } else {
        response.status(404).json({
          status: 404,
          message: 'Post not found'
        });
      }
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      })
    }
  }

  async updatePost(request: Request, response: Response): Promise<void> {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      response.status(400).json({
        status: 400,
        message: 'Bad request. Validation errors.',
        data: errors.array(),
      });
      return;
    }

    try {
      const postId = request.params.id;
      const updateData = request.body;
      const userId = request.userId as string; 
      const userRole = request.userRole as string; 

      if (!userId || !userRole) {
        response.status(400).json({
          status: 400,
          message: 'User ID and role are required.',
        });
        return;
      }

      const postResponse = await this.postsService.updatePost(postId, updateData, userId, userRole);

      response.status(postResponse.status).send({
        ...postResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async deletePost(request: Request, response: Response): Promise<void> {
    try {
      const postId = request.params.id;
      const userId = request.userId as string; 
      const userRole = request.userRole as string; 

      if (!userId || !userRole) {
        response.status(400).json({
          status: 400,
          message: 'User ID and role are required.',
        });
        return;
      }

      const postResponse = await this.postsService.deletePost(postId, userId, userRole);

      response.status(postResponse.status).send({
        ...postResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async getAllPostsByUser(request: Request, response: Response): Promise<void> {
    try {
      const userId = request.params.userId;

      if (!userId) {
        response.status(400).json({
          status: 400,
          message: 'User ID is required.',
        });
        return;
      }

      const postsResponse = await this.postsService.getAllPostsByUser(userId);

      response.status(postsResponse.status).send({
        ...postsResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async getPostsByCategory(request: Request, response: Response): Promise<void> {
    try {
      const category = request.query.category as string;
  
      if (!category) {
        response.status(400).json({
          status: 400,
          message: 'Category is required.',
        });
        return;
      }
  
      console.log(`Category retrieved from query: ${category}`); // Log pour vérification
  
      const postsResponse = await this.postsService.getPostsByCategory(category);
  
      response.status(postsResponse.status).send({
        ...postsResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }
  ////
  async updownvote(request: Request, response: Response): Promise<void> {
    const postId = request.params.id;
    const userId = request.userId;

    try {
      const voteResponse = await this.postsService.updownvotePost(
        postId,
        userId as string,
      );

      response.status(voteResponse.status).send(voteResponse);
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: "Internal server error",
        data: error,
      });
    }
  }

  
  
}