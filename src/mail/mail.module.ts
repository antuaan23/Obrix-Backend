import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailTemplateService } from './mail-template.servide';

@Module({
  controllers: [MailController],
  providers: [MailService, MailTemplateService],
  exports: [MailService],
})
export class MailModule {}
