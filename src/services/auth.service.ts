import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { HttpException } from "../exceptions/HttpException";
import { DataStoredInToken, TokenData } from "../interfaces/auth.interface";
import { prisma } from "../database";
import { User } from "@prisma/client";

class AuthService {
  public users = prisma.user;

  public async signup(userData: {
    email: string;
    name: string;
    username: string;
    password: string;
  }): Promise<User> {
    const findUser: User = await this.users.findFirst({
      where: {
        OR: [{ email: userData.email }, { username: userData.username }],
      },
    });
    if (findUser)
      throw new HttpException(
        409,
        `You're email ${userData.email} or username ${userData.username} already exists`
      );

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const createUserData: User = await this.users.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    return createUserData;
  }

  public async login(userData: {
    email: string;
    password: string;
  }): Promise<{ token: string; findUser: User }> {
    const findUser: User = await this.users.findFirst({
      where: {
        email: userData.email,
      },
    });
    if (!findUser)
      throw new HttpException(409, `You're email ${userData.email} not found`);

    const isPasswordMatching: boolean = await bcrypt.compare(
      userData.password,
      findUser.password
    );

    if (!isPasswordMatching)
      throw new HttpException(409, "You're password not matching");

    const { token } = this.createToken(findUser);

    return { token, findUser };
  }

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id };
    const secretKey: string = process.env.SECRET_KEY;
    const expiresIn: number = 4 * 60 * 60 * 1000;

    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }),
    };
  }
}

export default AuthService;
