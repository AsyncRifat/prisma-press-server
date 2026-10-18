import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { userService } from './user.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

// const registerUser = async (req: Request, res: Response) => {
//   try {
//     const payload = req.body;
//     const user = await userService.registerUserIntoDatabase(payload);

//     res.status(HttpStatus.CREATED).json({
//       success: true,
//       statusCode: HttpStatus.CREATED,
//       message: 'User registered successfully',
//       data: user,
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(HttpStatus.BAD_REQUEST).json({
//       success: false,
//       statusCode: HttpStatus.BAD_REQUEST,
//       message: 'Failed to register user',
//       error: (error as Error).message,
//       data: null,
//     });
//   }
// };

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await userService.registerUserIntoDatabase(payload);

    // res.status(HttpStatus.CREATED).json({
    //   success: true,
    //   statusCode: HttpStatus.CREATED,
    //   message: 'User registered successfully',
    //   data: user,
    // });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'User registered successfully',
      data: {
        user,
      },
    });
  },
);

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.user, 'From USER CONTROLLER');

    const profile = await userService.getMyProfileFromDatabase(
      req.user?.id as string,
    );

    // res.send('Get my Profile');

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User profile fetched successfully',
      data: { profile },
    });
  },
);

const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const payload = req.body;

    const updatedProfile = await userService.updateMyProfileInDatabase(
      userId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User profile update successfully',
      data: { updatedProfile },
    });
  },
);

export const userController = {
  registerUser,
  getMyProfile,
  updateMyProfile,
};
