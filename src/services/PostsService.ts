import { Post } from '../types/entities/Post';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helpers';
import { Timestamp } from 'firebase/firestore';
import { categories } from '../constants/categories';
import { formatPostData, formatUserData } from '../utils/formatData';
import { firestore } from 'firebase-admin';

export class PostsService {
  private db: FirestoreCollections;

  constructor(db: FirestoreCollections) {
    this.db = db;
  }

  async createPost(postData: Post): Promise<IResBody> {
    const postRef = this.db.posts.doc();
    await postRef.set({
      ...postData,
      voteCount: 0,
      createdAt: firestoreTimestamp.now(),
      updatedAt: firestoreTimestamp.now(),
    });

    return {
      status: 201,
      message: 'Post created successfully!',
    };
  }

  async getPosts(): Promise<IResBody> {
    const posts: Post[] = [];
    const postsQuerySnapshot = await this.db.posts.get();

    for (const doc of postsQuerySnapshot.docs) {
      posts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
        updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
      });
    }

    return {
      status: 200,
      message: 'Posts retrieved successfully!',
      data: posts
    };
  }

  async getCategories(): Promise<IResBody> {
    return {
      status: 200,
      message: 'Categories retrieved successfully!',
      data: categories
    };
  }

  async addCommentToPost(commentData: any, postId: string): Promise<any> {
    try {
      
      const postRef = this.db.posts.doc(postId);
      const postDoc = await postRef.get();

      if (!postDoc.exists) {
        return {
          status: 404,
          message: 'Post not found',
        };
      }

      const commentRef = await postRef.collection('comments').add({
        ...commentData,
        createdAt: firestore.Timestamp.now(),
      });

      return {
        status: 201,
        message: 'Comment added successfully',
        data: { id: commentRef.id, ...commentData },
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Failed to add comment',
        data: error,
      };
    }
  }

  async getPostById(postId: string): Promise<IResBody> {
    const postDoc = await this.db.posts.doc(postId).get();

    if (!postDoc.exists) {
      return {
        status: 404,
        message: 'Post not found',
      };
    }

    const postData = {
      id: postDoc.id,
      ...postDoc.data(),
      createdAt: (postDoc.data()?.createdAt as Timestamp)?.toDate(),
      updatedAt: (postDoc.data()?.updatedAt as Timestamp)?.toDate(),
    };

    return {
      status: 200,
      message: 'Post retrieved successfully !',
      data:
        postData

    };
  }

  async updatePost(postId: string, updateData: Partial<Post>, userId: string, userRole: string): Promise<IResBody> {
    const postRef = this.db.posts.doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return {
        status: 404,
        message: 'Post not found',
      };
    }

    const postData = postDoc.data();

    if (postData?.createdBy !== userId && userRole !== 'admin') {
      return {
        status: 403,
        message: 'Forbidden! You do not have permission to update this post.',
      };
    }

    await postRef.update({
      ...updateData,
      updatedAt: firestoreTimestamp.now(),
    });

    return {
      status: 200,
      message: 'Post updated successfully!',
      data: {
        id: postId,
        ...updateData,
      },
    };
  }

  async deletePost(postId: string, userId: string, userRole: string): Promise<IResBody> {
    const postRef = this.db.posts.doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return {
        status: 404,
        message: 'Post not found',
      };
    }

    const postData = postDoc.data();

    if (postData?.createdBy !== userId && userRole !== 'admin') {
      return {
        status: 403,
        message: 'Forbidden! You do not have permission to delete this post.',
      };
    } else {

      await postRef.delete();

      return {
        status: 200,
        message: 'Post deleted successfully!',
      };
    }
  }

  async getAllPostsByUser(userId: string): Promise<IResBody> {
    const postsQuerySnapshot = await this.db.posts.where('createdBy', '==', userId).get();

    if (postsQuerySnapshot.empty) {
      return {
        status: 404,
        message: 'No posts found for this user',
      };
    }

    const posts: Post[] = [];

    for (const doc of postsQuerySnapshot.docs) {
      const formattedPost = formatPostData(doc.data());

      posts.push({
        id: doc.id,
        ...formattedPost,
      });
    }

    return {
      status: 200,
      message: 'Posts retrieved successfully!',
      data: posts,
    };
  }
  
  async getPostsByCategory(category: string): Promise<IResBody> {
    console.log(`category: ${category}`);
    
    const postsQuerySnapshot = await this.db.posts.where('categories', 'array-contains', category).get();

    if (postsQuerySnapshot.empty) {
      return {
        status: 404,
        message: 'No posts found for this category',
      };
    }

    const posts: Post[] = [];

    for (const doc of postsQuerySnapshot.docs) {
      const formattedPost = formatPostData(doc.data());

      posts.push({
        id: doc.id,
        ...formattedPost,
      });
    }

    return {
      status: 200,
      message: 'Posts retrieved successfully!',
      data: posts,
    };
  }

async updownvotePost(postId: string, userId: string): Promise<IResBody> {
  const postRef = this.db.posts.doc(postId);
  const postDoc = await postRef.get();

  if (!postDoc.exists) {
    return {
      status: 404,
      message: 'Post not found!',
      data: null,
    };
  }

  const postData = postDoc.data() as Post;

  if (!postData.usersVote) postData.usersVote = [];
  if (postData.voteCount === undefined) postData.voteCount = 0;

  const userHasVoted = postData.usersVote.includes(userId);

  if (userHasVoted) {
    postData.usersVote = postData.usersVote.filter((id: string) => id !== userId);
    postData.voteCount -= 1;
  } else {
    postData.usersVote.push(userId);
    postData.voteCount += 1;
  }

  await postRef.update({
    usersVote: postData.usersVote,
    voteCount: postData.voteCount,
    updatedAt: firestoreTimestamp.now(),
  });

  return {
    status: 200,
    message: 'Vote processed successfully!',
    data: {
      id: postId,
      title: postData.title,
      description: postData.description,
      categories: postData.categories,
      createdBy: postData.createdBy,
      createdAt: postData.createdAt instanceof Timestamp ? postData.createdAt.toDate() : postData.createdAt,
      updatedAt: firestoreTimestamp.now(),
      voteCount: postData.voteCount,
      usersVote: postData.usersVote,
    },
  };
}
}