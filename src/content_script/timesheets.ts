const CLASS_RED = "workcloud-plus-red";
const SHORTAGE_TIME_SELECTORS = {
  en: "Shortage of time",
  ja: "不足時間",
};
const SHORTAGE_TIME_HEADING_SELECTOR = "fieldset.dashboard_stat_7 h6";
const HOLIDAY_SELECTOR = "td.holiday_name";
const ENTRY_ROW_SELECTOR = "tr.entry_row";
const DATE_CELL_SELECTOR = "td.date";
const TIME_CELL_SELECTOR = "td.time span.time";
const TIME_COLUMN_SELECTOR = "td.time";

type Time = {
  hours: number;
  minutes: number;
};

const getElements = <T extends Element>(selector: string): T[] =>
  Array.from(document.querySelectorAll<T>(selector));

const parseTime = (timeString: string): Time => {
  const [hours, minutes] = timeString.trim().split(":");
  return {
    hours: parseFloat(hours),
    minutes: parseFloat(minutes),
  };
};

const getShortageTime = (): number => {
  const shortageTimeElement = getElements<HTMLHeadingElement>(
    SHORTAGE_TIME_HEADING_SELECTOR
  ).find((element) =>
    Object.values(SHORTAGE_TIME_SELECTORS).some((text) =>
      element.textContent?.includes(text)
    )
  );

  if (shortageTimeElement?.nextElementSibling?.textContent) {
    const { hours, minutes } = parseTime(
      shortageTimeElement.nextElementSibling.textContent
    );
    return hours + minutes / 60;
  }

  return 0;
};

const isHoliday = (row: Element): boolean =>
  row.querySelector(HOLIDAY_SELECTOR) !== null;

const getRemainingWorkdays = (): number => {
  const rows = getElements<HTMLTableRowElement>(ENTRY_ROW_SELECTOR);
  return rows.filter((row) => {
    const dateCell = row.querySelector(DATE_CELL_SELECTOR);
    const timeCell = row.querySelector(TIME_CELL_SELECTOR);
    return (
      dateCell && !isHoliday(row) && (!timeCell || timeCell.textContent === "")
    );
  }).length;
};

const createShortageTimeSpan = (shortageTime: number): HTMLSpanElement => {
  const span = document.createElement("span");
  span.textContent = shortageTime.toFixed(2);
  span.className = CLASS_RED;
  span.title = "Shortage of time per day";
  return span;
};

export const calculateAndDisplayShortageTime = (): void => {
  const totalShortageTime = getShortageTime();
  const remainingWorkdays = getRemainingWorkdays();

  if (totalShortageTime <= 0 || remainingWorkdays <= 0) return;

  const shortageTimePerDay = totalShortageTime / remainingWorkdays;
  const rows = getElements<HTMLTableRowElement>(ENTRY_ROW_SELECTOR);

  const shortageTimeSpan = createShortageTimeSpan(shortageTimePerDay);

  rows.forEach((row) => {
    const timeCell = row.querySelector(TIME_CELL_SELECTOR);

    if (isHoliday(row) || (timeCell && timeCell.textContent !== "")) return;

    const clonedSpan = shortageTimeSpan.cloneNode(true) as HTMLSpanElement;
    row.querySelector(TIME_COLUMN_SELECTOR)?.appendChild(clonedSpan);
  });
};
