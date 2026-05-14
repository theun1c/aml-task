import { Module } from '@nestjs/common';
import { IssuesController } from './controllers/issues.controller';
import { IssuesRepository } from './repositories/issues.repository';
import { IssuesAccessService } from './services/issues-access.service';
import { IssuesPositionService } from './services/issues-position.service';
import { IssuesService } from './services/issues.service';
import { RabbitMQModule } from '../infrastructure/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [IssuesController],
  providers: [IssuesRepository, IssuesAccessService, IssuesPositionService, IssuesService],
})
export class IssuesModule {}
