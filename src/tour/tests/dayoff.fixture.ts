import { Dayoff } from '../../dayoff/entities/dayoff.entity';
import { DayoffType } from '../../dayoff/types/dayoff_type';
import { Tour } from '../entities/tour.entity';
import { createTourFixture } from './tour.fixture';

interface DayoffFixtureOptions {
  id?: number;
  type?: DayoffType;
  month?: number;
  date?: number;
  dayOfWeek?: number;
  tour?: Tour;
}

export function createDayoffFixture(
  options: DayoffFixtureOptions = {},
): Dayoff {
  const {
    id = 1,
    type = DayoffType.DATE,
    month = 3,
    date = 21, // 매달 21일
    dayOfWeek = 0, // 0은 일요일
    tour = createTourFixture(),
  } = options;

  const dayoff = new Dayoff();
  dayoff.id = id;
  dayoff.type = type;
  dayoff.month = month;
  dayoff.date = date;
  dayoff.dayOfWeek = dayOfWeek;
  dayoff.tour = tour;

  return dayoff;
}
