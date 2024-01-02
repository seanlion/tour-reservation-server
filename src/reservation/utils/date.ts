export const parseDateFromDateString = (input: string): Date => {
  const parts = input.split('-');
  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2]),
  );
  return date;
};

export function getCurrentOnlyDateFormat(): Date {
  const currentDate = new Date();
  return new Date(
    `${currentDate.getFullYear()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getDate()}`,
  );
}

export function calculateDateDiff(currentDate: Date, targetDate: Date): number {
  return Math.floor(
    (targetDate.getTime() - currentDate.getTime()) / (24 * 3600 * 1000),
  );
}
