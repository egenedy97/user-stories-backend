import { Router } from "express";
import UserController from "../controllers/user.controller";
import { Routes } from "../interfaces/route.interface";
import authMiddleware from "../middlewares/auth.middleware";

class UserRoute implements Routes {
  public path = "/users";
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      authMiddleware,
      this.userController.getAllUsers
    );
  }
}

export default UserRoute;
