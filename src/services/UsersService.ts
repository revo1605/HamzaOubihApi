import { User } from '../types/entities/User';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helpers';
import { encryptPassword } from '../utils/password';
import { Timestamp } from 'firebase/firestore';
import { formatUserData } from '../utils/formatData';

export class UsersService {
  private db: FirestoreCollections;

  constructor(db: FirestoreCollections) {
    this.db = db;
  }

  async createUser(userData: User): Promise<IResBody> {
    const usersQuerySnapshot = await this.db
      .users.where('email', '==', userData.email).get();

    if (usersQuerySnapshot.empty) {
      const userRef = this.db.users.doc();
      await userRef.set({
        ...userData,
        password: encryptPassword(userData.password as string),
        role: 'member',
        createdAt: firestoreTimestamp.now(),
        updatedAt: firestoreTimestamp.now(),
      });

      return {
        status: 201,
        message: 'User created successfully!',
      };
    } else {
      return {
        status: 409,
        message: 'User already exists',
      }
    }
  }

  async getUsers(): Promise<IResBody> {
    const users: User[] = [];
    const usersQuerySnapshot = await this.db.users.get();

    for (const doc of usersQuerySnapshot.docs) {
      const formattedUser = formatUserData(doc.data());

      users.push({
        id: doc.id,
        ...formattedUser,
      });
    }

    return {
      status: 200,
      message: 'Users retrieved successfully!',
      data: users
    };
  }
}
