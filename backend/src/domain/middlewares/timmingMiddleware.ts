import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestMethod = req.method;
    const functionName = req.baseUrl;
    console.time(`[${requestMethod} ${functionName}]`);
    return new Promise<void>((resolve, reject) => {
      next(); // Call the next middleware or route handler
      res.once('finish', () => {
        console.timeEnd(`[${requestMethod} ${functionName}]`);
        resolve();
      });
    });
  }
}