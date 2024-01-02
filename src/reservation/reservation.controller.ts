import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ReservationApproveDto,
  ReservationCancelDto,
  ReservationCheckDto,
  ReservationRegisterDto,
  ReservationStatusDto,
  ReservationUpdateDto,
} from './dto/reservation.dto';
import { ReservationService } from './reservation.service';

@Controller('/reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('/:tourId/register')
  async registerReservation(
    @Param('tourId') tourId: number,
    @Body() registerDto: ReservationRegisterDto,
  ): Promise<ReservationStatusDto> {
    return await this.reservationService.registerReservation(
      tourId,
      registerDto,
    );
  }

  @Post('/:tourId/:reservationId/approve')
  async approveReservation(
    @Param('reservationId') reservationId: number,
    @Body() approveDto: ReservationApproveDto,
  ): Promise<ReservationStatusDto> {
    return await this.reservationService.approveReservation(
      reservationId,
      approveDto,
    );
  }

  @Post('/:tourId/:reservationId/cancel')
  async cancelReservation(
    @Param('reservationId') reservationId: number,
    @Body() cancelDto: ReservationCancelDto,
  ): Promise<boolean> {
    return await this.reservationService.cancelReservation(
      reservationId,
      cancelDto,
    );
  }

  @Post('/check')
  async fetchReservationByToken(
    @Body() checkDto: ReservationCheckDto,
  ): Promise<ReservationCheckDto> {
    return await this.reservationService.fetchReservationByToken(checkDto);
  }

  @Post('/:tourId/:reservationId/update')
  async updateReservation(
    @Param('tourId') tourId: number,
    @Body() updateDto: ReservationUpdateDto,
  ): Promise<boolean> {
    return await this.reservationService.updateReservation(tourId, updateDto);
  }
}
