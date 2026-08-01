import { describe, expect, it } from "vitest";
import { cycleDayNumber, determinePhase } from "./phase";
import type { Cycle } from "../types/api";

function makeCycle(overrides: Partial<Cycle>): Cycle {
  return {
    cycle_number: 1,
    start_date: "2026-01-01",
    end_date: "2026-01-28",
    period_length_days: 4,
    cycle_length_days: 28,
    is_ongoing: false,
    is_irregular: false,
    ...overrides,
  };
}

describe("determinePhase", () => {
  it("returns unknown for a date before any cycle history", () => {
    const cycles = [makeCycle({})];
    expect(determinePhase(new Date("2025-12-01"), cycles)).toBe("unknown");
  });

  it("classifies period days as menstrual", () => {
    const cycles = [makeCycle({})];
    expect(determinePhase(new Date("2026-01-01T12:00:00"), cycles)).toBe("menstrual");
    expect(determinePhase(new Date("2026-01-04T12:00:00"), cycles)).toBe("menstrual");
  });

  it("classifies the day after the period as follicular", () => {
    const cycles = [makeCycle({})];
    expect(determinePhase(new Date("2026-01-05T12:00:00"), cycles)).toBe("follicular");
  });

  it("classifies the window around ovulation as fertile", () => {
    // 28-day cycle: ovulation at day 14 (Jan 15), fertile window Jan 10-16.
    const cycles = [makeCycle({})];
    expect(determinePhase(new Date("2026-01-15T12:00:00"), cycles)).toBe("fertile");
  });

  it("classifies the days after the fertile window as luteal", () => {
    const cycles = [makeCycle({})];
    expect(determinePhase(new Date("2026-01-25T12:00:00"), cycles)).toBe("luteal");
  });

  it("estimates phase for an ongoing cycle using the average of completed cycles", () => {
    const cycles = [
      makeCycle({ cycle_number: 1, start_date: "2026-01-01", end_date: "2026-01-28", cycle_length_days: 28 }),
      makeCycle({
        cycle_number: 2,
        start_date: "2026-01-29",
        end_date: null,
        cycle_length_days: null,
        is_ongoing: true,
      }),
    ];
    // Ongoing cycle started Jan 29; with a 28-day average, ovulation ~Feb 12.
    expect(determinePhase(new Date("2026-02-12T12:00:00"), cycles)).toBe("fertile");
  });
});

describe("cycleDayNumber", () => {
  it("returns null when the date falls outside any cycle", () => {
    const cycles = [makeCycle({})];
    expect(cycleDayNumber(new Date("2025-12-01"), cycles)).toBeNull();
  });

  it("returns 1 for the first day of a cycle", () => {
    const cycles = [makeCycle({})];
    expect(cycleDayNumber(new Date("2026-01-01T12:00:00"), cycles)).toBe(1);
  });

  it("counts cycle days correctly mid-cycle", () => {
    const cycles = [makeCycle({})];
    expect(cycleDayNumber(new Date("2026-01-10T12:00:00"), cycles)).toBe(10);
  });
});
