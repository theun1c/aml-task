#!/usr/bin/env node

/**
 * RabbitMQ Consumer for aml_notifications queue
 * Слушает события с сервера и выводит их в консоль
 * 
 * Использование:
 * node test-rabbitmq-consumer.js
 */

const amqp = require('amqplib');
const colors = require('util').TextEncoder ? null : null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'aml_notifications';

async function start() {
  let connection = null;
  let channel = null;

  try {
    console.log('🚀 Connecting to RabbitMQ...');
    connection = await amqp.connect(RABBITMQ_URL);
    
    connection.on('error', (err) => {
      console.error('❌ Connection error:', err);
    });

    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME);

    console.log(`✅ Connected! Listening on queue: ${QUEUE_NAME}\n`);
    console.log('Waiting for messages (Ctrl+C to exit)...\n');

    await channel.consume(QUEUE_NAME, (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          
          // Форматируем вывод
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`📨 NEW EVENT: ${event.type}`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('Timestamp:', new Date().toISOString());
          console.log('Event Type:', event.type);
          console.log('User ID:', event.userId);
          console.log('Project ID:', event.projectId);
          console.log('Data:', JSON.stringify(event.data, null, 2));
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          
          // Подтверждаем что сообщение обработано
          channel.ack(msg);
        } catch (error) {
          console.error('❌ Error processing message:', error.message);
          channel.nack(msg, false, true); // Отправляем обратно в очередь
        }
      }
    });

    // Обработка Ctrl+C
    process.on('SIGINT', async () => {
      console.log('\n\n👋 Disconnecting...');
      if (channel) await channel.close();
      if (connection) await connection.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Ensure RabbitMQ is running at:', RABBITMQ_URL);
    process.exit(1);
  }
}

start();
