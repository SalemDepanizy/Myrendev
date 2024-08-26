import { Request, Response } from "express";
import { ApiError } from "./typed";
import jwt from "jsonwebtoken";
import { AccountType, user } from "@prisma/client";
import { client } from "@/prisma";

export function protect(...roles: AccountType[]) {
  return async ({ req, res }: { req: Request; res: Response }) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError("Unauthorized", 401);
    }
    const [_, token] = authHeader.trim().split(" ");
    if (!token) {
      throw new ApiError("Unauthorized", 401);
    }
    try {
      const payload = jwt.verify(token, process.env.SECRET ?? "");
      if (typeof payload === "string") {
        throw new ApiError("Unauthorized", 401);
      }
      if (!payload.user.id) {
        throw new ApiError("Unauthorized", 401);
      }
      const tokenData = { id: payload.user.id as string };
      const user = await client.user.findFirst({ where: tokenData });
      if (roles.length > 0) {
        if (!user) {
          throw new ApiError("Unauthorized", 401);
        }
        if (!roles.includes(user?.type)) {
          throw new ApiError("Unauthorized", 401);
        }
        return user as user;
      }
      return user as user;
    } catch (error) {
      throw new ApiError("Unauthorized", 401);
    }
  };
}
