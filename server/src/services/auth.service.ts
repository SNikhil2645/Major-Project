import crypto from 'crypto';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { signAccessToken, signRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { sendEmail } from './email.service';

export async function registerUser(name: string, email: string, password: string) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const user = await User.create({ name, email, password });

  const verifyToken = crypto.randomBytes(32).toString('hex');
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verifyToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Verify your email - PlaceMentor AI',
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email. This link expires in 24 hours.</p>`,
  });

  return { user: user.toPublicJSON() };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account has been disabled', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload: TokenPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const hashedRefresh = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await RefreshToken.create({ userId: user._id, token: hashedRefresh, expiresAt });

  return {
    user: user.toPublicJSON(),
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(token: string) {
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const stored = await RefreshToken.findOne({ token: hashedToken, userId: payload.userId });
  if (!stored) {
    throw new AppError('Refresh token not found', 401);
  }

  const user = await User.findById(payload.userId);
  if (!user || !user.isActive) {
    throw new AppError('User not found or disabled', 401);
  }

  await RefreshToken.deleteOne({ _id: stored._id });

  const newPayload: TokenPayload = { userId: user._id.toString(), role: user.role };
  const newAccessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const hashedNew = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  await RefreshToken.create({ userId: user._id, token: hashedNew, expiresAt });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email });
  if (!user) {
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.set('resetPasswordToken', resetTokenHash);
  user.set('resetPasswordExpires', new Date(Date.now() + 60 * 60 * 1000));
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset - PlaceMentor AI',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
}

export async function resetPassword(token: string, password: string) {
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = password;
  user.set('resetPasswordToken', undefined);
  user.set('resetPasswordExpires', undefined);
  await user.save();
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; profile?: Record<string, unknown> },
) {
  const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user.toPublicJSON();
}
