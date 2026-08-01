"""Derives cycle boundaries from raw period-day logs.

Pure, DB-free logic: takes a list of dates a user logged as period days and groups
them into cycles. Kept separate from prediction_service so cycle derivation and
statistical forecasting can each be tested in isolation.
"""

from dataclasses import dataclass
from datetime import date, timedelta

IRREGULAR_MIN_LENGTH_DAYS = 21
IRREGULAR_MAX_LENGTH_DAYS = 35


@dataclass(frozen=True)
class Cycle:
    cycle_number: int
    start_date: date
    end_date: date | None  # day before the next cycle starts; None if this cycle is ongoing
    period_length_days: int
    cycle_length_days: int | None  # None for the most recent (ongoing) cycle
    is_ongoing: bool
    is_irregular: bool


def _group_into_periods(sorted_dates: list[date]) -> list[list[date]]:
    """Group period-day dates into contiguous bleeding stretches.

    Allows a single skipped day between logged dates (e.g. spotting either side of a
    lighter day) to still count as the same period; a gap of 2+ unlogged days starts a
    new period/cycle. Assumes the caller logs (most) days of bleeding.
    """
    if not sorted_dates:
        return []

    max_gap = timedelta(days=2)
    groups: list[list[date]] = [[sorted_dates[0]]]
    for current in sorted_dates[1:]:
        previous = groups[-1][-1]
        if (current - previous) <= max_gap:
            groups[-1].append(current)
        else:
            groups.append([current])
    return groups


def derive_cycles(period_dates: list[date]) -> list[Cycle]:
    """Build the chronological list of cycles from a user's logged period days."""
    unique_sorted_dates = sorted(set(period_dates))
    period_groups = _group_into_periods(unique_sorted_dates)

    cycles: list[Cycle] = []
    for index, group in enumerate(period_groups):
        start_date = group[0]
        period_length_days = len(group)
        is_ongoing = index == len(period_groups) - 1

        if is_ongoing:
            cycle_length_days = None
            end_date = None
        else:
            next_start = period_groups[index + 1][0]
            cycle_length_days = (next_start - start_date).days
            end_date = next_start - timedelta(days=1)

        is_irregular = cycle_length_days is not None and (
            cycle_length_days < IRREGULAR_MIN_LENGTH_DAYS
            or cycle_length_days > IRREGULAR_MAX_LENGTH_DAYS
        )

        cycles.append(
            Cycle(
                cycle_number=index + 1,
                start_date=start_date,
                end_date=end_date,
                period_length_days=period_length_days,
                cycle_length_days=cycle_length_days,
                is_ongoing=is_ongoing,
                is_irregular=is_irregular,
            )
        )

    return cycles


def completed_cycle_lengths(cycles: list[Cycle], limit: int | None = None) -> list[int]:
    """Lengths of cycles with a known length, most recent last. `limit` keeps only the last N."""
    lengths = [c.cycle_length_days for c in cycles if c.cycle_length_days is not None]
    if limit is not None:
        lengths = lengths[-limit:]
    return lengths
