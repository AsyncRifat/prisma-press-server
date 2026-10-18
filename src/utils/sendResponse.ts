import { Response } from 'express';

type TypeMeta = {
  page: number;
  limit: number;
  total: number;
};

type TypeResponseData<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: TypeMeta;
};

export const sendResponse = <T>(res: Response, data: TypeResponseData<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta || undefined,
  });
};
