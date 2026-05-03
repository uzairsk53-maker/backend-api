exports.successResponse = (res, data, message = '') => {
  return res.status(200).json({
    success: true,
    data,
    message,
    error: null
  });
};

exports.errorResponse = (res, statusCode, message, error = null) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error
  });
};
