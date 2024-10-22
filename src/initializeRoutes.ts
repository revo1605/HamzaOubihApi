import * as controllers from './controllers';
import * as routes from './routes';
import * as services from './services';
import { FirestoreCollections } from './types/firestore';

export function initializeRoutes(db: FirestoreCollections) {
  const usersService = new services.UsersService(db);
  const userController = new controllers.UserController(usersService);
  const usersRoute = new routes.UsersRoute(userController);

  return {
    usersRoute,
  };
}
