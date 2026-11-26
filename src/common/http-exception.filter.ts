import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

// Formats every HTTP error into the TourEase API error response.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    let message = 'Internal server error';
    let errors = [message];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      errors = [message];
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const exceptionMessage = exceptionResponse.message;
      if (Array.isArray(exceptionMessage)) {
        errors = exceptionMessage.map(String);
        message = errors[0] ?? 'Request failed';
      } else if (typeof exceptionMessage === 'string') {
        message = exceptionMessage;
        errors = [message];
      }
    } else if (exception instanceof HttpException) {
      message = exception.message;
      errors = [message];
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
