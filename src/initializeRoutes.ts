import * as controllers from './controllers';
import * as routes from './routes';
import * as services from './services';

export function initializeRoutes() {
  const usersService = new services.UsersService();
  const userController = new controllers.UserController(usersService);
  const usersRoute = new routes.UsersRoute(userController);

  return {
    usersRoute,
  };
}
