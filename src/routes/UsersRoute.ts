import { Router } from 'express';
import { UserController } from '../controllers';
import { validateCreateUser, validateLoginUser, validateChangePassword } from '../middlewares/dataValidator';
import authJwt from '../middlewares/authJwt';

export class UsersRoute {
  private userController: UserController;

  constructor(userController: UserController) {
    this.userController = userController;
  }

  createRouter(): Router {
    const router = Router();

    router.post('/users', validateCreateUser, this.userController.createUser.bind(this.userController));


    router.get('/users', this.userController.getUsers.bind(this.userController));

    router.get('/users/:id', authJwt.verifyToken, this.userController.getUserById.bind(this.userController));

    router.post('/auth/login', validateLoginUser, this.userController.login.bind(this.userController));

    router.put('/users/:id', validateCreateUser, this.userController.updateUser.bind(this.userController));

    router.put('/usersMe', validateCreateUser, authJwt.verifyToken,this.userController.updateconnectedUser.bind(this.userController));

    router.delete('/users/:id', validateCreateUser, this.userController.deleteUser.bind(this.userController));

    router.patch('/users/password', authJwt.verifyToken, validateChangePassword, this.userController.changePassword.bind(this.userController));



    return router;
  }
}
