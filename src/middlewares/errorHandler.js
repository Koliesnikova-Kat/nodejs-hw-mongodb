import { HttpError } from 'http-errors';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.status,
      message: err.name,
      data: err,
    });
  }

  res.json({
    status: 500,
    message: 'Something went wrong',
    data: '',
  });
};
