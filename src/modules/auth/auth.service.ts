import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { LoginUserPayload } from './auth.interface';
import { JwtPayload, SignOptions } from 'jsonwebtoken';
import config from '../../config';
import { jwtUtils } from '../../utils/jwt';

const loginUser = async (payload: LoginUserPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });

  if (user?.activeStatus === 'BLOCKED') {
    throw new Error('Your account has been blocked. Please contact support.');
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  // console.log('Matched:', isPasswordMatched);

  if (!isPasswordMatched) {
    throw new Error('Invalid email or password');
  }

  const userWithoutPassword = await prisma.user.findUnique({
    where: { id: user.id },
    omit: { password: true },
    include: { profile: true },
  });

  const jwtPayload = {
    id: userWithoutPassword?.id,
    email: userWithoutPassword?.email,
    role: userWithoutPassword?.role,
    name: userWithoutPassword?.name,
  };
  // console.log(jwtPayload);

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success) {
    throw new Error(verifiedRefreshToken.error);
  }

  const { id } = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findFirstOrThrow({
    where: { id },
  });

  if (user?.activeStatus === 'BLOCKED') {
    throw new Error('User is blocked');
  }

  const jwtPayload = {
    id,
    email: user?.email,
    role: user?.role,
    name: user?.name,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  return {
    accessToken,
  };
};

export const authService = {
  loginUser,
  refreshToken,
};
