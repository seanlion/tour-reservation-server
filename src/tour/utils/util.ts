export function getAllDatesInGivenMonth(year: number, month: number) {
  return Array.from(
    { length: new Date(year, month, 0).getDate() },
    (_, idx) => new Date(year, month - 1, idx + 1),
  );
}
