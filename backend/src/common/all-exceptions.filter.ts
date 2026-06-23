import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let messages: string[] = ['Internal server error'];
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        messages = [res];
        error = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        const msg = r.message;
        if (Array.isArray(msg)) {
          messages = msg.map((m) => String(m));
        } else if (typeof msg === 'string') {
          messages = [msg];
        } else if (msg !== undefined && msg !== null) {
          messages = [String(msg)];
        }
        error = typeof r.error === 'string' ? r.error : exception.name;
      }

      error = this.labelFor(statusCode, error);
    } else {
      const detail =
        exception instanceof Error
          ? `${exception.name}: ${exception.message}`
          : String(exception);
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}: ${detail}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    if (statusCode >= 500) {
      messages = ['Internal server error'];
      error = 'Internal Server Error';
    }

    response.status(statusCode).json({ statusCode, message: messages, error });
  }

  private labelFor(status: number, fallback: string): string {
    const labels: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };
    return labels[status] ?? fallback;
  }
}
