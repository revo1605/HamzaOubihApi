import { Timestamp } from 'firebase/firestore';

export interface Comment {
  id?: string;
  description?: string;
  voteCount?: number;
  usersVote?: string[] ; 
  postId?: string ; 
  createdBy?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}