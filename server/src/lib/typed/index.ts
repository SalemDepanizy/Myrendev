import { Request, Response } from "express";
import { z } from "zod";

export class ApiResponse {
  data: {
    [key: string]: any;
  } = {};
  constructor(
    data: {
      [key: string]: any;
    },
    public status: number = 200
  ) {
    this.data = data;
  }
}

export class ApiError extends Error {
  constructor(public message: string, public status: number = 500) {
    super(message);
  }
}

export function typed<
  InputSchema extends z.ZodObject<any> = never,
  ParamsSchema extends z.ZodObject<any> = never,
  ReturnType extends Record<string, any> = never
>(config: {
  schemas?: {
    input?: InputSchema;
    params?: ParamsSchema;
  };
  context?: (props: {
    req: Request;
    res: Response;
  }) => ReturnType | Promise<ReturnType>;
  handler: (props: {
    input: z.infer<InputSchema>;
    params: z.infer<ParamsSchema>;
    req: Request;
    res: Response;
    ctx: ReturnType;
  }) => Promise<ApiResponse | ApiError> | ApiResponse | ApiError;
}) {
  return async (req: Request, res: Response) => {
    try {
      const input: z.infer<InputSchema> =
        config.schemas?.input?.parse(req.body) ?? ({} as never);
      const params: z.infer<ParamsSchema> =
        config.schemas?.params?.parse(req.params) ?? ({} as never);

      const context = config.context
        ? await config.context({ req, res })
        : ({} as never);

      const result = await config.handler({
        input,
        params,
        req,
        res,
        ctx: context,
      });
      if (result instanceof ApiResponse) {
        res.status(result.status).json(result.data);
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else if (
        error instanceof z.ZodError ||
        (error instanceof Error && error.name === "ZodError")
      ) {
        res.status(400).send(error);
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  };
}
