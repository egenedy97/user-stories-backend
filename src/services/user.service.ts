import { HttpException } from "../exceptions/HttpException";
import { prisma } from "../database";

class UserService {
  public users = prisma.user;
  public async getAllUsers(
    page: number,
    limit: number
  ): Promise<{ users: { id: number; username: string }[]; total: number }> {
    try {
      const skip = page ? (page - 1) * limit : 0;
      const users = await this.users.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
        },
      });
      const total = await this.users.count();
      return { users, total };
    } catch (e) {
      throw new HttpException(500, "Unable to get Users");
    }
  }
}

export default UserService;
