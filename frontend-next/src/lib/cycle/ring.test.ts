import { describe, expect, it } from "vitest";
import { computeRingSegments } from "./ring";

describe("computeRingSegments", () => {
  it("produces four ordered segments spanning a full 360deg for a typical cycle", () => {
    const result = computeRingSegments({
      cycleStart: new Date("2026-01-01"),
      periodLengthDays: 4,
      cycleLengthDays: 28,
      fertileWindowStart: new Date("2026-01-10"),
      fertileWindowEnd: new Date("2026-01-16"),
      today: new Date("2026-01-01"),
    });

    expect(result.cycleLengthDays).toBe(28);
    expect(result.segments.map((s) => s.phase)).toEqual([
      "menstrual",
      "follicular",
      "fertile",
      "luteal",
    ]);

    // Contiguous: each segment's start matches the previous segment's end.
    for (let i = 1; i < result.segments.length; i++) {
      expect(result.segments[i].startAngle).toBeCloseTo(result.segments[i - 1].endAngle, 5);
    }
    expect(result.segments[0].startAngle).toBe(0);
    expect(result.segments[result.segments.length - 1].endAngle).toBe(360);
  });

  it("places day 1 at angle 0", () => {
    const result = computeRingSegments({
      cycleStart: new Date("2026-01-01"),
      periodLengthDays: 4,
      cycleLengthDays: 28,
      fertileWindowStart: new Date("2026-01-10"),
      fertileWindowEnd: new Date("2026-01-16"),
      today: new Date("2026-01-01"),
    });
    expect(result.currentAngle).toBe(0);
  });

  it("places the midpoint day at 180deg", () => {
    const result = computeRingSegments({
      cycleStart: new Date("2026-01-01"),
      periodLengthDays: 4,
      cycleLengthDays: 28,
      fertileWindowStart: new Date("2026-01-10"),
      fertileWindowEnd: new Date("2026-01-16"),
      today: new Date("2026-01-15"), // day 15 of 28 -> (14/28)*360 = 180
    });
    expect(result.currentAngle).toBe(180);
  });

  it("keeps a zero-width follicular segment when the fertile window starts right after the period", () => {
    const result = computeRingSegments({
      cycleStart: new Date("2026-01-01"),
      periodLengthDays: 4,
      cycleLengthDays: 21,
      fertileWindowStart: new Date("2026-01-05"), // day 5 — immediately after a 4-day period
      fertileWindowEnd: new Date("2026-01-09"),
      today: new Date("2026-01-01"),
    });
    expect(result.segments.map((s) => s.phase)).toEqual([
      "menstrual",
      "follicular",
      "fertile",
      "luteal",
    ]);
    const follicular = result.segments[1];
    expect(follicular.endAngle - follicular.startAngle).toBeCloseTo(0, 5);
  });

  it("falls back to a 28-day length and skips fertile/luteal split when there's no prediction yet", () => {
    const result = computeRingSegments({
      cycleStart: new Date("2026-01-01"),
      periodLengthDays: 4,
      cycleLengthDays: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      today: new Date("2026-01-01"),
    });
    expect(result.cycleLengthDays).toBe(28);
    expect(result.segments.map((s) => s.phase)).toEqual(["menstrual", "follicular"]);
    expect(result.segments[1].endAngle).toBe(360);
  });

  it("clamps today to the last day when it falls beyond the cycle length", () => {
    const result = computeRingSegments({
      cycleStart: new Date("2026-01-01"),
      periodLengthDays: 4,
      cycleLengthDays: 28,
      fertileWindowStart: new Date("2026-01-10"),
      fertileWindowEnd: new Date("2026-01-16"),
      today: new Date("2026-03-01"),
    });
    expect(result.currentAngle).toBeCloseTo(((28 - 1) / 28) * 360, 5);
  });
});
