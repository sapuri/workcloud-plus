const CLASS_RED = "workcloud-plus-red";

const SHORTAGE_TIME_TEXTS = {
  en: "Shortage of time",
  ja: "不足時間",
};

const SELECTORS = {
  SHORTAGE_TIME_HEADING: "fieldset.dashboard_stat_7 h6",
  HOLIDAY: "td.holiday_name",
  ENTRY_ROW: "tr.entry_row",
  DATE_CELL: "td.date",
  TIME_CELL: "td.time span.time",
  TIME_COLUMN: "td.time",
  END_TIME_INPUT: "input.end_time",
};

type Time = {
  hours: number;
  minutes: number;
};

const getElements = <T extends Element>(selector: string): T[] =>
  Array.from(document.querySelectorAll<T>(selector));

const parseTime = (timeStr: string): Time => {
  const [hours, minutes] = timeStr.trim().split(":");
  return {
    hours: parseInt(hours, 10),
    minutes: parseInt(minutes, 10),
  };
};

const formatTime = (time: Time): string => {
  const hours = Math.floor(time.hours);
  const minutes = Math.round(time.minutes);
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

const timeToDecimal = (time: Time): number => time.hours + time.minutes / 60;

const decimalToTime = (decimal: number): Time => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return { hours, minutes };
};

const getShortageTime = (): number => {
  const shortageTimeElement = getElements<HTMLHeadingElement>(
    SELECTORS.SHORTAGE_TIME_HEADING
  ).find((element) =>
    Object.values(SHORTAGE_TIME_TEXTS).some((text) =>
      element.textContent?.includes(text)
    )
  );

  if (shortageTimeElement?.nextElementSibling?.textContent) {
    return timeToDecimal(
      parseTime(shortageTimeElement.nextElementSibling.textContent)
    );
  }

  return 0;
};

const isHoliday = (row: Element): boolean =>
  row.querySelector(SELECTORS.HOLIDAY) !== null;

const getRemainingWorkdays = (): number =>
  getElements<HTMLTableRowElement>(SELECTORS.ENTRY_ROW).filter((row) => {
    const dateCell = row.querySelector(SELECTORS.DATE_CELL);
    const endTimeInput = row.querySelector<HTMLInputElement>(
      SELECTORS.END_TIME_INPUT
    );
    return (
      dateCell &&
      !isHoliday(row) &&
      (!endTimeInput || endTimeInput.value.trim() === "")
    );
  }).length;

const createShortageTimeSpan = (shortageTime: Time): HTMLSpanElement => {
  const span = document.createElement("span");
  span.textContent = formatTime(shortageTime);
  span.className = CLASS_RED;
  span.title = "Shortage of time per day";
  return span;
};

export const calculateAndDisplayShortageTime = (): void => {
  const totalShortageTime = getShortageTime();
  const remainingWorkdays = getRemainingWorkdays();

  if (totalShortageTime <= 0 || remainingWorkdays <= 0) return;

  const shortageTimePerDay = decimalToTime(
    totalShortageTime / remainingWorkdays
  );

  const shortageTimeSpan = createShortageTimeSpan(shortageTimePerDay);

  getElements<HTMLTableRowElement>(SELECTORS.ENTRY_ROW).forEach((row) => {
    const timeCell = row.querySelector(SELECTORS.TIME_CELL);

    if (isHoliday(row) || (timeCell && timeCell.textContent !== "")) return;

    const clonedSpan = shortageTimeSpan.cloneNode(true) as HTMLSpanElement;
    row.querySelector(SELECTORS.TIME_COLUMN)?.appendChild(clonedSpan);
  });
};
