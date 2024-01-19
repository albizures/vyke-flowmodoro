import type { Result } from "@vyke/results";
import {
  type SavedItem,
  savedStartTime,
  savedStatus,
  savedBreakTimeRatio,
  savedBreakTime,
  savedAutoStartBreak,
  savedAutoStartFocus,
} from "./localStorage";

function unwrapOr<TValue, TError>(
  result: Result<TValue, TError>,
  defaultValue: TValue
): TValue {
  if (result.ok) {
    return result.value;
  }

  return defaultValue;
}

function createValue<TType>(defaultValue: TType, savedItem: SavedItem<TType>) {
  let current = unwrapOr(savedItem.get(), defaultValue);
  return {
    get value() {
      return current;
    },
    set value(value: TType) {
      current = value;
      savedItem.save(value);
    },
  };
}

export const startTime = createValue(0, savedStartTime);
export const breakTime = createValue(0, savedBreakTime);
export const status = createValue("stopped-break", savedStatus);
export const breakTimeRatio = createValue(5, savedBreakTimeRatio);
export const autoStartBreak = createValue(false, savedAutoStartBreak);
export const autoStartFocus = createValue(false, savedAutoStartFocus);
