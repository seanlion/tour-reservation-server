import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { SellerModule } from './seller/seller.module';
import { TourModule } from './tour/tour.module';
import { DayoffModule } from './dayoff/dayoff.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'staging'
          ? './.env'
          : './.prod.env',
    }),
    DatabaseModule,
    SellerModule,
    TourModule,
    DayoffModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
