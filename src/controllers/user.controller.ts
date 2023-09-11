import { NextFunction, Request, Response } from "express";
import UserService from "../services/user.service";

class UserController {
  public userService = new UserService();

  public getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { page, limit } = req.query;
      const { users, total } = await this.userService.getAllUsers(
        +page,
        +limit
      );
      res
        .status(201)
        .json({ users, total, message: "Tasks fetched successfully" });
    } catch (e) {
      next(e);
    }
  };
}

export default UserController;
