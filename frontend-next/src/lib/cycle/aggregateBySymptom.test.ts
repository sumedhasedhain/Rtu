import { describe, expect, it } from "vitest";
import { aggregateBySymptom } from "./aggregateBySymptom";

describe("aggregateBySymptom", () => {
  it("returns an empty array for no entries", () => {
    expect(aggregateBySymptom([])).toEqual([]);
  });

  it("pivots phase counts into one row per symptom", () => {
    const result = aggregateBySymptom([
      { symptom_name: "cramps", phase: "menstrual", count: 3 },
      { symptom_name: "cramps", phase: "luteal", count: 1 },
      { symptom_name: "headache", phase: "menstrual", count: 2 },
    ]);

    expect(result).toEqual([
      { symptom_name: "cramps", menstrual: 3, luteal: 1 },
      { symptom_name: "headache", menstrual: 2 },
    ]);
  });
});
