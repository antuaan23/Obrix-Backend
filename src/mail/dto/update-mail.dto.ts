import { PartialType } from '@nestjs/swagger';
import { SendMailDto } from './send-mail.dto';

export class UpdateMailDto extends PartialType(SendMailDto) {}
