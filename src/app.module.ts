import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SellerModule } from './seller/seller.module';
import { TourModule } from './tour/tour.module';
import { DayoffModule } from './dayoff/dayoff.module';
import { ReservationModule } from './reservation/reservation.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'staging'
          ? './.env'
          : './.prod.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DATABASE_HOST'),
        port: parseInt(config.get('DATABASE_PORT') ?? '3306'),
        username: config.get<string>('DATABASE_USERNAME'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity.{js,ts}'],
        synchronize: true,
        logging: true,
      }),
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (
        config: ConfigService,
      ): Promise<RedisModuleOptions> => {
        return {
          config: {
            host: config.get<string>('REDIS_HOST'),
            port: parseInt(config.get<string>('REDIS_PORT')),
            password: config.get<string>('REDIS_PASSWORD'),
          },
          readyLog: true,
        };
      },
    }),
    SellerModule,
    TourModule,
    DayoffModule,
    ReservationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
