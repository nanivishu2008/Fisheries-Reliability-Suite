import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Resource not found with specified identifier: ${err.value}`, 404);
  }

  // Mongoose Duplicate Key Error (e.g. unique email or assetCode)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `Duplicate entry for ${field}: '${err.keyValue?.[field]}' already exists.`, 409);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 'Database validation failure', 400, errors);
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    const issues = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    return sendError(res, 'Input validation failed', 400, issues);
  }

  return sendError(res, err.message || 'Internal Server Error', err.statusCode || 500);
};
