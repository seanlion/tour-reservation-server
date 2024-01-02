import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SellerModule } from './seller/seller.module';
import { TourModule } from './tour/tour.module';
import { DayoffModule } from './dayoff/dayoff.module';
import { ReservationModule } from './reservation/reservation.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';

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
        host: 'localhost',
        port: parseInt(config.get('DATABASE_PORT') ?? '3306'),
        username: 'zoom',
        password: 'root',
        database: 'tour',
        entities: [__dirname + '/**/*.entity.{js,ts}'],
        synchronize: true,
        logging: true,
      }),
    }),
    // RedisModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     host: 'localhost',
    //     port: 6379,
    //     password: 'zoom',
    //     readyLog: true,
    //   }),
    // }),
    RedisModule.forRoot({
      readyLog: true,
      config: {
        host: 'localhost',
        port: 6379,
        password: 'zoom',
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
