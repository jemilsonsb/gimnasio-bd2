export function successResponse(res, statusCode, message, data = null, meta = undefined) {
  const response = { success: true, message, data };

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

export function errorResponse(res, statusCode, message, code, details = undefined) {
  const response = {
    success: false,
    message,
    error: { code }
  };

  if (details !== undefined) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
}
