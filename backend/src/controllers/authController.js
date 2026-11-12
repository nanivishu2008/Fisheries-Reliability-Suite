import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAuditEvent } from '../utils/auditLogger.js';

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = loginSchema.parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      await logAuditEvent({
        req,
        action: 'LOGIN_FAILURE',
        entityName: 'User',
        outcome: 'FAILURE',
        details: `Failed login attempt for unknown email: ${email}`,
      });
      return sendError(res, 'Invalid email or password credentials', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account deactivated. Please contact your system administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logAuditEvent({
        req,
        action: 'LOGIN_FAILURE',
        entityName: 'User',
        entityId: user._id,
        outcome: 'FAILURE',
        details: `Incorrect password provided for user: ${email}`,
      });
      return sendError(res, 'Invalid email or password credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: rememberMe ? '30d' : config.jwtExpiresIn }
    );

    req.user = user;
    await logAuditEvent({
      req,
      action: 'LOGIN_SUCCESS',
      entityName: 'User',
      entityId: user._id,
      outcome: 'SUCCESS',
      details: `Successful login as ${user.role}`,
    });

    return sendSuccess(res, { token, user: user.toJSON() }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    return sendSuccess(res, { user: req.user.toJSON() }, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email address is required', 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success even if user not found for security enumeration prevention
      return sendSuccess(res, {}, 'If that email address exists in the registry, password reset instructions have been dispatched.');
    }

    await logAuditEvent({
      req,
      action: 'PASSWORD_RESET_REQUESTED',
      entityName: 'User',
      entityId: user._id,
      details: `Password reset requested for: ${email}`,
    });

    return sendSuccess(res, {}, 'Password reset instructions dispatched to registered email.');
  } catch (err) {
    next(err);
  }
};
