from datetime import date

from app.services.cycle_service import completed_cycle_lengths, derive_cycles


def test_no_period_dates_yields_no_cycles() -> None:
    assert derive_cycles([]) == []


def test_single_period_yields_one_ongoing_cycle() -> None:
    dates = [date(2026, 1, 1), date(2026, 1, 2), date(2026, 1, 3)]
    cycles = derive_cycles(dates)

    assert len(cycles) == 1
    cycle = cycles[0]
    assert cycle.cycle_number == 1
    assert cycle.start_date == date(2026, 1, 1)
    assert cycle.period_length_days == 3
    assert cycle.cycle_length_days is None
    assert cycle.end_date is None
    assert cycle.is_ongoing is True
    assert cycle.is_irregular is False


def test_two_periods_yields_one_completed_and_one_ongoing_cycle() -> None:
    dates = [
        date(2026, 1, 1),
        date(2026, 1, 2),
        date(2026, 1, 3),
        date(2026, 1, 4),
        date(2026, 1, 29),
        date(2026, 1, 30),
        date(2026, 1, 31),
    ]
    cycles = derive_cycles(dates)

    assert len(cycles) == 2
    first, second = cycles

    assert first.start_date == date(2026, 1, 1)
    assert first.period_length_days == 4
    assert first.cycle_length_days == 28
    assert first.end_date == date(2026, 1, 28)
    assert first.is_ongoing is False

    assert second.start_date == date(2026, 1, 29)
    assert second.cycle_length_days is None
    assert second.is_ongoing is True


def test_regular_cycles_are_not_flagged_irregular() -> None:
    dates = [date(2026, 1, 1), date(2026, 1, 29), date(2026, 2, 26)]
    cycles = derive_cycles(dates)

    assert cycles[0].cycle_length_days == 28
    assert cycles[0].is_irregular is False
    assert cycles[1].cycle_length_days == 28
    assert cycles[1].is_irregular is False


def test_very_short_cycle_flagged_irregular() -> None:
    dates = [date(2026, 1, 1), date(2026, 1, 10), date(2026, 2, 7)]
    cycles = derive_cycles(dates)

    assert cycles[0].cycle_length_days == 9
    assert cycles[0].is_irregular is True


def test_very_long_cycle_flagged_irregular() -> None:
    dates = [date(2026, 1, 1), date(2026, 3, 1), date(2026, 3, 29)]
    cycles = derive_cycles(dates)

    assert cycles[0].cycle_length_days == 59
    assert cycles[0].is_irregular is True


def test_unordered_and_duplicate_dates_are_normalized() -> None:
    dates = [date(2026, 1, 3), date(2026, 1, 1), date(2026, 1, 2), date(2026, 1, 2)]
    cycles = derive_cycles(dates)

    assert len(cycles) == 1
    assert cycles[0].period_length_days == 3


def test_one_day_gap_still_counts_as_same_period() -> None:
    # e.g. spotting on day 1 and 2, then a gap, then flow resumes on day 4 (1-day gap).
    dates = [date(2026, 1, 1), date(2026, 1, 2), date(2026, 1, 4)]
    cycles = derive_cycles(dates)

    assert len(cycles) == 1
    assert cycles[0].period_length_days == 3


def test_two_day_gap_starts_a_new_cycle() -> None:
    dates = [date(2026, 1, 1), date(2026, 1, 2), date(2026, 1, 5)]
    cycles = derive_cycles(dates)

    assert len(cycles) == 2
    assert cycles[0].period_length_days == 2
    assert cycles[1].start_date == date(2026, 1, 5)


def test_completed_cycle_lengths_excludes_ongoing_cycle() -> None:
    dates = [date(2026, 1, 1), date(2026, 1, 29), date(2026, 2, 26)]
    cycles = derive_cycles(dates)

    assert completed_cycle_lengths(cycles) == [28, 28]


def test_completed_cycle_lengths_respects_limit() -> None:
    dates = [date(2026, 1, 1), date(2026, 1, 29), date(2026, 2, 26), date(2026, 3, 26)]
    cycles = derive_cycles(dates)

    assert completed_cycle_lengths(cycles, limit=1) == [28]
