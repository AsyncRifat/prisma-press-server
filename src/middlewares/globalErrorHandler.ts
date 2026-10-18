import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Prisma } from '../../generated/prisma/client';

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Error ----- >>>>>>>', err);

  // prisma error handle globally:
  let statusCode;
  let errorMessage =
    err.message || 'An unexpected error occurred. Please try again later.';
  let errorName = err.name || 'Internal Server Error';

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST; //400
    errorMessage = 'You have provided incorrect field type or missing fields';
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = httpStatus.CONFLICT; //409
        errorMessage =
          'A record with the provided unique value already exists.';
        break;

      case 'P2003':
        statusCode = httpStatus.BAD_REQUEST; //400
        errorMessage = 'The operation violates a related record constraint.';
        break;

      case 'P2025':
        statusCode = httpStatus.NOT_FOUND; //404
        errorMessage = 'The requested record could not be found.';
        break;
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    switch (err.errorCode) {
      case 'P1000':
        statusCode = httpStatus.INTERNAL_SERVER_ERROR; //500
        errorMessage = 'Database authentication failed';
        break;

      case 'P1001':
        statusCode = httpStatus.SERVICE_UNAVAILABLE; //503
        errorMessage = 'Unable to connect to the database server';
        break;

      case 'P1002':
        statusCode = httpStatus.SERVICE_UNAVAILABLE; //503
        errorMessage = 'Database connection timed out';
        break;

      case 'P1003':
        statusCode = httpStatus.INTERNAL_SERVER_ERROR; //500
        errorMessage = 'The configured database does not exist';
        break;

      case 'P1010':
        statusCode = httpStatus.INTERNAL_SERVER_ERROR; //500
        errorMessage = 'Database access was denied';
        break;

      case 'P1011':
        statusCode = httpStatus.INTERNAL_SERVER_ERROR; //500
        errorMessage = 'A secure database connection could not be established';
        break;

      case 'P1013':
        statusCode = httpStatus.INTERNAL_SERVER_ERROR; //500
        errorMessage = 'The database connection string is invalid';
        break;

      case 'P1017':
        statusCode = httpStatus.SERVICE_UNAVAILABLE; //503
        errorMessage = 'The database server closed the connection';
        break;

      default:
        statusCode = httpStatus.INTERNAL_SERVER_ERROR; //500
        errorMessage = 'Failed to initialize the database connection';
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR; //500
    errorMessage =
      'The database operation could not be completed due to an unexpected error.';
  }

  // response :
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
    name: errorName,
    message: errorMessage,
    error: err.stack,
  });
};

export default globalErrorHandler;
