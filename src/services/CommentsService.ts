import { Post } from '../types/entities/Post';
import { Comment } from '../types/entities/Comment';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helpers';
import { Timestamp } from 'firebase/firestore';
import { categories } from '../constants/categories';


export class CommentsService {
    private db: FirestoreCollections;
  
    constructor(db: FirestoreCollections) {
      this.db = db;
    }

//ADD A COMMENT TO A POST 

      async createComment(commentData: any): Promise<IResBody> {
        const commentRef = this.db.comments.doc();
        await commentRef.set({
          ...commentData,
          voteCount: 0,
          createdAt: firestoreTimestamp.now(),
          updatedAt: firestoreTimestamp.now(),
        });
    
        return {
          status: 201,
          message: 'Comment created successfully!',
        };
      }




      async getComments(): Promise<IResBody> {
        const comments: Comment[] = [];
        const postsQuerySnapshot = await this.db.comments.get();
    
        for (const doc of postsQuerySnapshot.docs) {
            comments.push({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
            updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
          });
        }
    
        return {
          status: 200,
          message: 'Comments retrieved successfully!',
          data: comments
        };
      }

      
    async getAllCommentsPost(postId: string): Promise<any> {
        const Comments: Comment[] = [];
        
        // Query the comments collection to find all posts created by the post 
        const postsQuerySnapshot = await this.db.comments.where('postId', '==', postId).get();
      
        // Check if there are any posts found
        if (postsQuerySnapshot.empty) {
            return {
                status: 404,
                message: 'No comments found for this post.',
                data: [],
            };
        }

         // Iterate through the documents and push them to the Comments array
        for (const doc of postsQuerySnapshot.docs) {
            Comments.push({
                id: doc.id,
                ...doc.data(),
                createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
                updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
            });
        }

        return {
            status: 200,
            message: 'Comments retrieved successfully!',
            data: Comments
        };
    }
    


    async getCommentById(commentId: string): Promise<IResBody> {
        // Get the post document by ID
        const commentDoc = await this.db.comments.doc(commentId).get();
    
        // Check if the post document exists
        if (!commentDoc.exists) {
            return {
                status: 404,
                message: 'Post not found!',
                data: null,
            };
        }
    
        // Return the comment data
        const commentData = {
            id: commentDoc.id,
            ...commentDoc.data(),
            createdAt: (commentDoc.data()?.createdAt as Timestamp)?.toDate(),
            updatedAt: (commentDoc.data()?.updatedAt as Timestamp)?.toDate(),
        };
    
        return {
            status: 200,
            message: 'Comment retrieved successfully!',
            data: commentData
        };
    }




    async updateComment(commentId: string, updateData: Partial<Post>): Promise<IResBody> {
        const commentRef = this.db.posts.doc(commentId);
      
        // Check if the posts exists before trying to update
        const commentDoc = await commentRef.get();
        if (!commentDoc.exists) {
    
          return {
            status: 404,
            message: 'comment not found',
          };
        }
      
        // Update the post data
        await commentRef.update({
          ...updateData,
          updatedAt: firestoreTimestamp.now(), // Update the timestamp
        });
      
        return {
          status: 200,
          message: 'commentupdated successfully!',
          data: {
            id: commentId, // Return the updated comment ID
            ...updateData, // Include the updated fields
          },
        };
      }

    
  async deleteComment(commentID: string): Promise<IResBody> {
    const commentRef = this.db.comments.doc(commentID);
    
    commentRef.delete() ; 

    return {
      status: 200,
      message: 'comment Deleted Successfuly',
    };
  }

  async updownvoteComment(commentsId: string, userId: string): Promise<IResBody> {
    const commentRef = this.db.posts.doc(commentsId);
    const commentDoc = await commentRef.get();

    // Check if the post document exists
    if (!commentDoc.exists) {
      return {
        status: 404,
        message: 'comment not found!',
        data: null,
      };
    }

    const commentData = commentDoc.data() as Post;

    // Initialize usersVote and voteCount if they are undefined
    if (!commentData.usersVote) commentData.usersVote = [];
    if (commentData.voteCount === undefined) commentData.voteCount = 0;

    // Check if the user has already voted on this post
    const userHasVoted = commentData.usersVote.includes(userId);

    if (userHasVoted) {
      // User is removing their vote
      commentData.usersVote = commentData.usersVote.filter((id: string) => id !== userId);
      commentData.voteCount -= 1; // Decrement vote count
    } else {
      // User is adding their vote
      commentData.usersVote.push(userId);
      commentData.voteCount += 1; // Increment vote count
    }

    // Update the comment document in Firestore
    await commentRef.update({
      usersVote: commentData.usersVote,
      voteCount: commentData.voteCount,
      updatedAt: firestoreTimestamp.now(), // Ensure to update the timestamp
    });

    return {
      status: 200,
      message: 'Vote processed successfully!',
      data: {
        id: commentsId,
        title: commentData.title,
        description: commentData.description,
        categories: commentData.categories,
        createdBy: commentData.createdBy,
        createdAt: commentData.createdAt instanceof Timestamp ? commentData.createdAt.toDate() : commentData.createdAt,
        updatedAt: firestoreTimestamp.now(),
        voteCount: commentData.voteCount,
        usersVote: commentData.usersVote,
      },
    };
  }

}