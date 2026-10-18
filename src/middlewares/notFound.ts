import { Request, Response } from 'express';

const notFount = (req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found!',
    path: req.originalUrl,
    date: new Date(),
  });
};

export default notFount;
