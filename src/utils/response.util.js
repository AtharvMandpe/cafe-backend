
const respondSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const respondError = (res, error, statusCode = 400) => {
  const message = error?.message || 'Something went wrong';
  const errors = error?.errors || null;

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export { respondSuccess, respondError };
