import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import config from '../../config';
import { RegisterUserPayload } from './user.interface';

const registerUserIntoDatabase = async (payload: RegisterUserPayload) => {
  const { name, email, password, profilePhoto } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,

      // * another way to create profile with user creation:
      // profile: {
      //   create: {
      //     profilePhoto,
      //   },
      // },
    },
  });

  await prisma.profile.create({
    data: {
      userId: createdUser.id,
      profilePhoto,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email,
    },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });

  return user;
};

const getMyProfileFromDatabase = async (userId: string) => {
  const user = await prisma.user.findFirstOrThrow({
    where: { id: userId },
    omit: {
      password: true,
    },
    include: {
      profile: true,
      subscription: true,
    },
  });

  return user;
};

const updateMyProfileInDatabase = async (userId: string, payload: any) => {
  const { name, email, profilePhoto, bio } = payload;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      profile: {
        update: {
          profilePhoto,
          bio,
        },
      },
    },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });
  return updatedUser;
};
export const userService = {
  registerUserIntoDatabase,
  getMyProfileFromDatabase,
  updateMyProfileInDatabase,
};
