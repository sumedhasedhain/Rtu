"""Cycle prediction algorithm: next period, fertile window, regularity, and phase-by-date.

Pure functions over `Cycle` objects (see cycle_service.py) — no DB or HTTP dependency,
so the algorithm can be unit-tested directly against synthetic cycle histories.

Method:
- Next period date = last period start + a weighted average of recent cycle lengths,
  weighting more recent cycles higher (exponential decay) since cycles drift over time.
- Confidence range = +/- the weighted standard deviation of those lengths: tight for a
  consistent cycler, wide for an irregular one. Confidence collapses to "low" whenever
  there isn't enough history to trust the statistics.
- Ovulation day = predicted next period date minus a luteal-phase estimate (default 14
  days, the relatively fixed part of the cycle); fertile window = 5 days before that
  through 1 day after.
"""

import math
from dataclasses import dataclass
from datetime import date, timedelta

from app.services.cycle_service import Cycle, completed_cycle_lengths

DEFAULT_CYCLE_LENGTH_DAYS = 28
DEFAULT_LUTEAL_PHASE_DAYS = 14
MAX_CYCLES_FOR_WEIGHTING = 6
RECENCY_DECAY = 0.85
FERTILE_WINDOW_DAYS_BEFORE_OVULATION = 5
FERTILE_WINDOW_DAYS_AFTER_OVULATION = 1
IRREGULAR_STD_THRESHOLD_DAYS = 7.0

ConfidenceLevel = str  # "low" | "medium" | "high"
Phase = str  # "menstrual" | "follicular" | "fertile" | "luteal" | "unknown"


@dataclass(frozen=True)
class DateRange:
    earliest: date
    latest: date


@dataclass(frozen=True)
class NextPeriodPrediction:
    predicted_date: date | None
    confidence_range: DateRange | None
    confidence_level: ConfidenceLevel
    based_on_cycles: int
    average_cycle_length_days: float | None
    message: str | None = None


@dataclass(frozen=True)
class FertileWindowPrediction:
    ovulation_date: date | None
    fertile_window_start: date | None
    fertile_window_end: date | None
    confidence_level: ConfidenceLevel
    based_on_cycles: int
    message: str | None = None


def weighted_mean_and_std(values: list[float], decay: float = RECENCY_DECAY) -> tuple[float, float]:
    """Weighted mean/population-std of `values`, where the LAST element is weighted highest.

    Weight of element i (0-indexed) is decay ** (n - 1 - i), so the most recent value has
    weight 1 and older values decay geometrically. With one value, std is 0 by construction —
    callers should treat n < 2 as low-confidence regardless of this std.
    """
    n = len(values)
    if n == 0:
        raise ValueError("weighted_mean_and_std requires at least one value")

    weights = [decay ** (n - 1 - i) for i in range(n)]
    total_weight = sum(weights)
    mean = sum(w * v for w, v in zip(weights, values, strict=False)) / total_weight
    variance = (
        sum(w * (v - mean) ** 2 for w, v in zip(weights, values, strict=False)) / total_weight
    )
    return mean, math.sqrt(variance)


def _confidence_level(std_days: float, sample_size: int) -> ConfidenceLevel:
    if sample_size < 2:
        return "low"
    if std_days <= 2:
        return "high"
    if std_days <= 5:
        return "medium"
    return "low"


def predict_next_period(
    cycles: list[Cycle], max_cycles: int = MAX_CYCLES_FOR_WEIGHTING
) -> NextPeriodPrediction:
    if not cycles:
        return NextPeriodPrediction(
            predicted_date=None,
            confidence_range=None,
            confidence_level="low",
            based_on_cycles=0,
            average_cycle_length_days=None,
            message="No periods logged yet.",
        )

    last_period_start = cycles[-1].start_date
    lengths = completed_cycle_lengths(cycles, limit=max_cycles)
    n = len(lengths)

    if n == 0:
        predicted_date = last_period_start + timedelta(days=DEFAULT_CYCLE_LENGTH_DAYS)
        return NextPeriodPrediction(
            predicted_date=predicted_date,
            confidence_range=DateRange(
                predicted_date - timedelta(days=7), predicted_date + timedelta(days=7)
            ),
            confidence_level="low",
            based_on_cycles=0,
            average_cycle_length_days=None,
            message="Only one period logged so far; using a default 28-day cycle estimate.",
        )

    mean_length, std_length = weighted_mean_and_std([float(x) for x in lengths])
    predicted_date = last_period_start + timedelta(days=round(mean_length))
    confidence_level = _confidence_level(std_length, n)
    range_days = max(1, round(std_length)) if n >= 2 else 5

    message = None
    if n == 1:
        message = "Based on a single completed cycle; prediction will improve with more history."

    return NextPeriodPrediction(
        predicted_date=predicted_date,
        confidence_range=DateRange(
            predicted_date - timedelta(days=range_days), predicted_date + timedelta(days=range_days)
        ),
        confidence_level=confidence_level,
        based_on_cycles=n,
        average_cycle_length_days=mean_length,
        message=message,
    )


def predict_fertile_window(
    cycles: list[Cycle],
    luteal_phase_days: int = DEFAULT_LUTEAL_PHASE_DAYS,
    max_cycles: int = MAX_CYCLES_FOR_WEIGHTING,
) -> FertileWindowPrediction:
    next_period = predict_next_period(cycles, max_cycles=max_cycles)
    if next_period.predicted_date is None:
        return FertileWindowPrediction(
            ovulation_date=None,
            fertile_window_start=None,
            fertile_window_end=None,
            confidence_level=next_period.confidence_level,
            based_on_cycles=0,
            message=next_period.message,
        )

    ovulation_date = next_period.predicted_date - timedelta(days=luteal_phase_days)
    return FertileWindowPrediction(
        ovulation_date=ovulation_date,
        fertile_window_start=ovulation_date - timedelta(days=FERTILE_WINDOW_DAYS_BEFORE_OVULATION),
        fertile_window_end=ovulation_date + timedelta(days=FERTILE_WINDOW_DAYS_AFTER_OVULATION),
        confidence_level=next_period.confidence_level,
        based_on_cycles=next_period.based_on_cycles,
        message=next_period.message,
    )


def cycle_regularity(cycles: list[Cycle], max_cycles: int = MAX_CYCLES_FOR_WEIGHTING) -> str:
    """Returns 'regular' | 'irregular' | 'insufficient_data'."""
    lengths = completed_cycle_lengths(cycles, limit=max_cycles)
    if len(lengths) < 2:
        return "insufficient_data"

    _, std_length = weighted_mean_and_std([float(x) for x in lengths])
    any_out_of_typical_range = any(
        c.is_irregular for c in cycles if c.cycle_length_days is not None
    )
    if std_length > IRREGULAR_STD_THRESHOLD_DAYS or any_out_of_typical_range:
        return "irregular"
    return "regular"


def _ovulation_date_for_cycle(cycle: Cycle, cycles: list[Cycle], luteal_phase_days: int) -> date:
    if cycle.cycle_length_days is not None:
        return cycle.start_date + timedelta(days=cycle.cycle_length_days - luteal_phase_days)
    # Ongoing cycle: fall back to the same weighted prediction used for next-period forecasts.
    prediction = predict_next_period(cycles)
    if prediction.predicted_date is not None:
        return prediction.predicted_date - timedelta(days=luteal_phase_days)
    return cycle.start_date + timedelta(days=DEFAULT_CYCLE_LENGTH_DAYS - luteal_phase_days)


def determine_phase(
    target_date: date, cycles: list[Cycle], luteal_phase_days: int = DEFAULT_LUTEAL_PHASE_DAYS
) -> Phase:
    """Which cycle phase `target_date` falls in, based on the cycle history it belongs to."""
    for cycle in cycles:
        cycle_end = cycle.end_date if cycle.end_date is not None else date.max
        if not (cycle.start_date <= target_date <= cycle_end):
            continue

        period_end = cycle.start_date + timedelta(days=cycle.period_length_days - 1)
        if target_date <= period_end:
            return "menstrual"

        ovulation_date = _ovulation_date_for_cycle(cycle, cycles, luteal_phase_days)
        fertile_start = ovulation_date - timedelta(days=FERTILE_WINDOW_DAYS_BEFORE_OVULATION)
        fertile_end = ovulation_date + timedelta(days=FERTILE_WINDOW_DAYS_AFTER_OVULATION)

        if fertile_start <= target_date <= fertile_end:
            return "fertile"
        if target_date < fertile_start:
            return "follicular"
        return "luteal"

    return "unknown"
