import {
  Catch,
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    switch ((exception as any)?.code) {
      case 'P2025':
        super.catch(new NotFoundException(), host);
        return;
      default:
        super.catch(exception, host);
        return;
    }
  }
}
