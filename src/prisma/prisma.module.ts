import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() //makes this module available to all application
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
