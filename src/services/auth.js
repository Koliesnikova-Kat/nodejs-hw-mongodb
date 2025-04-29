import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/User.js';
import bcrypt from 'bcrypt';
import { SessionsCollection } from '../db/models/Session.js';
import { randomBytes } from 'crypto';
import { FIFTEEN_MINUTES, ONE_DAY, SMTP } from '../constants/auth.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendMail } from '../utils/sendMail.js';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import { TEMPLATES_DIR } from '../constants/index.js';

export const findSession = (query) => SessionsCollection.findOne(query);

export const findUser = (query) => UsersCollection.findOne(query);

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};

const verifyEmailPath = path.join(TEMPLATES_DIR, 'verify-email.html');

export const registerUser = async (payload) => {
  const { email, password } = payload;
  const user = await findUser({ email });
  if (user) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(password, 10);

  const newUser = await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });

  const token = jwt.sign({ email }, getEnvVar('JWT_SECRET'), {
    expiresIn: '5m',
  });

  const templateSource = (await fs.readFile(verifyEmailPath)).toString();

  const template = handlebars.compile(templateSource);

  const html = template({
    link: `${getEnvVar('APP_DOMAIN')}/verify?token=${token}`,
  });

  const verifyEmail = {
    from: getEnvVar(SMTP.SMTP_FROM),
    to: payload.email,
    subject: 'Verify email',
    html,
  };

  try {
    await sendMail(verifyEmail);
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  return newUser;
};

export const verifyUser = (token) => {
  try {
    const { email } = jwt.verify(token, getEnvVar('JWT_SECRET'));
    return UsersCollection.findOneAndUpdate({ email }, { verify: true });
  } catch (error) {
    throw createHttpError(401, error.message);
  }
};

export const loginUser = async (payload) => {
  const { email, password } = payload;
  const user = await findUser({ email });
  if (!user) throw createHttpError(401, 'User not found');

  if (!user.verify) throw createHttpError(401, 'Email is not verified');

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) throw createHttpError(401, 'Unauthorized');

  await SessionsCollection.deleteOne({ userId: user._id });

  const session = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...session,
  });
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await findSession({
    _id: sessionId,
    refreshToken,
  });

  if (!session) throw createHttpError(401, 'Session not found');

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired)
    throw createHttpError(401, 'Session token expired');

  const newSession = createSession();

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const requestResetToken = async (email) => {
  const user = await findUser({ email });
  if (!user) throw createHttpError(404, 'User not found');

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    { expiresIn: '5m' },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  try {
    await sendMail({
      from: getEnvVar(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (error) {
    if (error)
      throw createHttpError(
        500,
        'Failed to send the email, please try again later.',
      );
  }
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await findUser({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) throw createHttpError(404, 'User not found');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );

  await SessionsCollection.deleteMany({ userId: user._id });
};
