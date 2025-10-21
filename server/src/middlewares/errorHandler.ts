import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (res.headersSent) {
    return res.end();
  }

  res.status(500).json({ error: true, message: 'Internal Server Error' });
};
