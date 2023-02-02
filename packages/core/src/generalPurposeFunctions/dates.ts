export function getTimeStamp(date = new Date()): string {
  const year = date.getUTCFullYear().toString();
  const month = date.getUTCMonth().toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');

  const timeStamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

  return timeStamp;
}
