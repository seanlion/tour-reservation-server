import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DATABASE_HOST'),
        port: parseInt(config.get('DATABASE_PORT') ?? '3306'),
        username: config.get('DATABASE_USERNAME'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities: [],
        synchronize: false,
        logging: true,
      }),
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get<string>('REDIS_HOST'),
        port: parseInt(config.get<string>('REDIS_PORT')),
        password: config.get<string>('REDIS_PASSWORD'),
        readyLog: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
