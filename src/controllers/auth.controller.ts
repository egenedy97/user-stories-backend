import { NextFunction, Request, Response } from "express";
import AuthService from "../services/auth.service";
import { User } from "@prisma/client";

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: {
        email: string;
        name: string;
        username: string;
        password: string;
      } = req.body;

      const signUpUserData: User = await this.authService.signup(userData);

      res.status(201).json({ data: signUpUserData, message: "signup" });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: {
        email: string;
        password: string;
      } = req.body;
      const { token, findUser } = await this.authService.login(userData);

      res.status(200).json({ data: findUser, token, message: "login" });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
