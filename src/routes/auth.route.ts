import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { Routes } from "../interfaces/route.interface";

class AuthRoute implements Routes {
  public path = "/auth";
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/signup`, this.authController.signUp);
    this.router.post(`${this.path}/login`, this.authController.logIn);
  }
}

export default AuthRoute;
