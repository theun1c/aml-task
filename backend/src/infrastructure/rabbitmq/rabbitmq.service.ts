import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { PinoLoggerService } from '../logger/pino-logger.service';

export interface NotificationEvent {
  type: 'ISSUE_CREATED' | 'ISSUE_UPDATED' | 'ISSUE_ASSIGNED' | 'COMMENT_ADDED';
  userId: string;
  projectId: string;
  data: Record<string, any>;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: any = null;
  private channel: any = null;
  private readonly logger = new Logger(RabbitMQService.name);
  private readonly QUEUE_NAME = 'aml_notifications';

  constructor(private pinoLogger: PinoLoggerService) {}

  async onModuleInit() {
    try {
      await this.connect();
      this.pinoLogger.info('RabbitMQ connected');
    } catch (error) {
      this.pinoLogger.error('Failed to connect to RabbitMQ', error);
      // Не кидаем ошибку - RabbitMQ опциональный
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    const amqpUrl =
      process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

    try {
      const connection = await amqp.connect(amqpUrl);
      this.connection = connection;
      
      const channel = await connection.createChannel();
      this.channel = channel;
      
      await channel.assertQueue(this.QUEUE_NAME);
      this.logger.log('RabbitMQ connected successfully');
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error}`);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (error) {
      this.logger.error(`Error closing RabbitMQ connection: ${error}`);
    }
  }

  async publishNotification(event: NotificationEvent): Promise<void> {
    if (!this.channel) {
      this.pinoLogger.warn('RabbitMQ channel not available, skipping notification');
      return;
    }

    try {
      const message = JSON.stringify(event);
      this.channel.sendToQueue(this.QUEUE_NAME, Buffer.from(message), {
        persistent: true,
      });
      this.pinoLogger.info(`Notification published: ${event.type}`);
    } catch (error) {
      this.pinoLogger.error('Failed to publish notification', error);
    }
  }

  async consumeNotifications(
    callback: (event: NotificationEvent) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      this.pinoLogger.error('RabbitMQ channel not available');
      return;
    }

    try {
      await this.channel.consume(this.QUEUE_NAME, async (msg) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString()) as NotificationEvent;
            await callback(event);
            this.channel?.ack(msg);
          } catch (error) {
            this.pinoLogger.error('Error processing notification', error);
            this.channel?.nack(msg, false, true); // Requeue
          }
        }
      });
      this.pinoLogger.info('Started consuming notifications');
    } catch (error) {
      this.pinoLogger.error('Failed to consume notifications', error);
    }
  }
}
