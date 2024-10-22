import { Request, Response } from 'express';
import { UsersService } from '../services';

export class UserController {
  private usersService: UsersService;

  constructor(usersService: UsersService) {
    this.usersService = usersService;
  }

  async createUser(request: Request, response: Response): Promise<void> {
    await this.usersService.createUser();

    response.status(201).send({
      message: 'testooooooo'
    });
  }
}
