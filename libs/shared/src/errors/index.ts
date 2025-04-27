import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
// import { environment } from '../environment';
// import { logger } from '../utils/logger.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      // Handle explicitly thrown exceptions
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Extract message and details from the exception
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || message;
        errorDetails = responseObj.errors || responseObj.errors || null;
      }
    } else if (exception instanceof Error) {
      // Handle unknown runtime errors
      message = exception.message;
      errorDetails = exception.stack;

      // Log only 5xx errors and uncaught exceptions to file
      // logger.error({
      //   message,
      //   statusCode,
      //   timestamp: new Date().toISOString(),
      //   stack: errorDetails,
      // });
    }

    // Send a standardized error response.
    response.status(statusCode).json({
      statusCode,
      message,
      error: errorDetails, // environment.app.node_env !== 'production' ? errorDetails : null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
