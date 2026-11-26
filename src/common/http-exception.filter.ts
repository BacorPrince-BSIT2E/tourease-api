import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// Formats every HTTP error into the TourEase API error response.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (!(exception instanceof HttpException)) {
      const error =
        exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(error.message, error.stack);
    }

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
      const exceptionErrors =
        'errors' in exceptionResponse && Array.isArray(exceptionResponse.errors)
          ? exceptionResponse.errors.map(String)
          : undefined;

      if (Array.isArray(exceptionMessage)) {
        errors = exceptionErrors ?? exceptionMessage.map(String);
        message = errors[0] ?? 'Request failed';
      } else if (typeof exceptionMessage === 'string') {
        message = exceptionMessage;
        errors = exceptionErrors ?? [message];
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
