import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../database";
import { HttpException } from "../exceptions/HttpException";

import {
  RequestWithUser,
  DataStoredInToken,
} from "../interfaces/auth.interface";
const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const Authorization =
      req.body.token || req.query.token || req.headers["authorization"];
    if (Authorization) {
      const secretKey: string = process.env.SECRET_KEY;
      const verificationResponse = (await jwt.verify(
        Authorization,
        secretKey
      )) as DataStoredInToken;
      const userId = verificationResponse.id;
      const findUser = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, "Wrong authentication token"));
      }
    } else {
      next(new HttpException(404, "Authentication token missing"));
    }
  } catch (error) {
    next(new HttpException(401, "Wrong authentication token"));
  }
};

export default authMiddleware;
