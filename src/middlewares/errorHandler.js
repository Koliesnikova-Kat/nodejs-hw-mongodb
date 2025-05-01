import { HttpError } from 'http-errors';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      status: err.status,
      message: err.name,
      data: {
        message: err.message,
      },
    });
  }

  return res.status(500).json({
    status: 500,
    message: 'InternalServerError',
    data: {
      message: 'Something went wrong',
    },
  });
};
