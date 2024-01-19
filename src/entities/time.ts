export const SEC_IN_MS = 1000;
export const MIN_IN_MS = SEC_IN_MS * 60;

export function fromMilliToTime(delta: number): TimeValues {
  const rawMinutes = delta / MIN_IN_MS;
  const minutes = Math.floor(rawMinutes);
  const minutesInMilli = minutes * MIN_IN_MS;
  const rawSeconds = (delta - minutesInMilli) / SEC_IN_MS;
  const seconds = Math.floor(rawSeconds);
  const secondsInMilli = seconds * SEC_IN_MS;
  const millis = Math.floor((delta - minutesInMilli - secondsInMilli) / 10);

  return {
    minutes,
    seconds,
    millis,
  };
}

export type TimeValues = {
  minutes: number;
  seconds: number;
  millis: number;
};
