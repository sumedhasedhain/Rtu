import { addDays, differenceInCalendarDays, parseISO, startOfDay } from "date-fns";
import type { Cycle, CyclePhase } from "@/types/api";

const DEFAULT_LUTEAL_PHASE_DAYS = 14;
const DEFAULT_CYCLE_LENGTH_DAYS = 28;
const FERTILE_WINDOW_DAYS_BEFORE_OVULATION = 5;
const FERTILE_WINDOW_DAYS_AFTER_OVULATION = 1;

/**
 * Client-side mirror of the backend's `determine_phase` (app/services/prediction_service.py),
 * used to color-code the calendar/dashboard without a network round trip per visible day.
 *
 * Backend `date` values carry no time component, so every comparison here is done on
 * start-of-day boundaries — otherwise a `target` with a non-midnight time (e.g. "now")
 * would compare as later than a same-day boundary computed from a bare date.
 */
export function determinePhase(target: Date, cycles: Cycle[]): CyclePhase {
  const targetDay = startOfDay(target);

  for (const cycle of cycles) {
    const start = startOfDay(parseISO(cycle.start_date));
    const end = cycle.end_date ? startOfDay(parseISO(cycle.end_date)) : null;

    if (targetDay < start || (end && targetDay > end)) continue;

    const periodEnd = addDays(start, cycle.period_length_days - 1);
    if (targetDay <= periodEnd) return "menstrual";

    const ovulationDate = ovulationDateForCycle(cycle, cycles);
    const fertileStart = addDays(ovulationDate, -FERTILE_WINDOW_DAYS_BEFORE_OVULATION);
    const fertileEnd = addDays(ovulationDate, FERTILE_WINDOW_DAYS_AFTER_OVULATION);

    if (targetDay >= fertileStart && targetDay <= fertileEnd) return "fertile";
    if (targetDay < fertileStart) return "follicular";
    return "luteal";
  }

  return "unknown";
}

function ovulationDateForCycle(cycle: Cycle, cycles: Cycle[]): Date {
  const start = parseISO(cycle.start_date);
  if (cycle.cycle_length_days !== null) {
    return addDays(start, cycle.cycle_length_days - DEFAULT_LUTEAL_PHASE_DAYS);
  }

  const completedLengths = cycles
    .map((c) => c.cycle_length_days)
    .filter((length): length is number => length !== null);

  const averageLength =
    completedLengths.length > 0
      ? completedLengths.reduce((sum, l) => sum + l, 0) / completedLengths.length
      : DEFAULT_CYCLE_LENGTH_DAYS;

  return addDays(start, Math.round(averageLength) - DEFAULT_LUTEAL_PHASE_DAYS);
}

export function cycleDayNumber(target: Date, cycles: Cycle[]): number | null {
  const targetDay = startOfDay(target);
  const currentCycle = [...cycles]
    .reverse()
    .find(
      (c) =>
        targetDay >= startOfDay(parseISO(c.start_date)) &&
        (!c.end_date || targetDay <= startOfDay(parseISO(c.end_date))),
    );
  if (!currentCycle) return null;
  return differenceInCalendarDays(targetDay, parseISO(currentCycle.start_date)) + 1;
}
