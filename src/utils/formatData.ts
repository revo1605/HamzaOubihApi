import { Post } from '../types/entities/Post';
import { User } from '../types/entities/User';

export const formatUserData = (userData?: User): Partial<User> => {
  if(userData) {
    const _user = { ...userData };

    delete _user.password;
    delete _user.createdAt;
    delete _user.updatedAt;

    return _user;
  }

  return {};
};

export const formatPostData = (postData: any): Post => {
  return {
    title: postData.title,
    description: postData.description,
    categories: postData.categories,
    createdBy: postData.createdBy,
    createdAt: postData.createdAt,
    updatedAt: postData.updatedAt,
  };
};