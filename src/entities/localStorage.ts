import { Err, Ok, type Result } from "@vyke/results";

export type SavedItemConfig<TType> = {
  key: `vyke:${string}`;
  parse: (value: string) => Result<TType, Error>;
};

export type SavedItem<TType> = {
  get: () => Result<TType, Error>;
  save: (value: TType) => void;
};

const keys = new Set<string>();

function createSavedItem<const TType>(
  config: SavedItemConfig<TType>
): SavedItem<TType> {
  const { key, parse } = config;

  if (keys.has(key)) {
    throw new Error("duplicated saved item key");
  }

  keys.add(key);

  return {
    get() {
      const value = localStorage.getItem(key);

      if (!value) {
        return Err(new Error("no delta saved was found"));
      }

      return parse(value);
    },
    save(value: TType) {
      localStorage.setItem(key, JSON.stringify(value));
    },
  };
}

function parseJSON(value: string) {
  try {
    return Ok(JSON.parse(value));
  } catch (error) {
    return Err(new Error(`Invalid string value: ${value}`));
  }
}

function createParseNumber(name: string) {
  return (value: string) => {
    const result = parseJSON(value);

    if (!result.ok) {
      return result;
    }

    if (typeof result.value !== "number") {
      return Err(new Error(`Invalid data found as ${name}`));
    }

    return Ok(result.value);
  };
}
function createParseBoolean(name: string) {
  return (value: string) => {
    const result = parseJSON(value);

    if (!result.ok) {
      return result;
    }

    if (typeof result.value === "boolean") {
      return Ok(result.value);
    }

    return Err(new Error(`Invalid data found as ${name}`));
  };
}

export const savedStartTime = createSavedItem({
  key: "vyke:start-time",
  parse: createParseNumber("start time"),
});

export type Status = "stopped-focus" | "stopped-break" | "focus" | "break";

export const savedStatus = createSavedItem<Status>({
  key: "vyke:status",
  parse(value) {
    const result = parseJSON(value);

    if (!result.ok) {
      return result;
    }

    if (
      ["stopped-focus", "stopped-break", "focus", "break"].includes(
        result.value
      )
    ) {
      return Ok(result.value);
    }

    return Err(new Error(`Invalid data found as status`));
  },
});

export const savedBreakTime = createSavedItem({
  key: "vyke:break-time",
  parse: createParseNumber("break time"),
});

export const savedBreakTimeRatio = createSavedItem({
  key: "vyke:break-time-ratio",
  parse: createParseNumber("break time ratio"),
});

export const savedAutoStartBreak = createSavedItem({
  key: "vyke:auto-start-break",
  parse: createParseBoolean("auto start break"),
});

export const savedAutoStartFocus = createSavedItem({
  key: "vyke:auto-start-focus",
  parse: createParseBoolean("auto start focus"),
});
