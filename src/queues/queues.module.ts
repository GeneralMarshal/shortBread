import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'events',
    }),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
