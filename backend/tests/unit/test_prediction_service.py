from datetime import date, timedelta

import pytest

from app.services.cycle_service import derive_cycles
from app.services.prediction_service import (
    cycle_regularity,
    determine_phase,
    predict_fertile_window,
    predict_next_period,
    weighted_mean_and_std,
)


def _periods_from_starts(starts: list[date], period_length: int = 4) -> list[date]:
    """Flat list of period-day dates a `period_length`-day period at each start would produce."""
    dates = []
    for start in starts:
        dates.extend(start + timedelta(days=i) for i in range(period_length))
    return dates


class TestWeightedMeanAndStd:
    def test_single_value_has_zero_std(self) -> None:
        mean, std = weighted_mean_and_std([28.0])
        assert mean == 28.0
        assert std == 0.0

    def test_identical_values_have_zero_std(self) -> None:
        mean, std = weighted_mean_and_std([28.0, 28.0, 28.0])
        assert mean == pytest.approx(28.0)
        assert std == pytest.approx(0.0, abs=1e-9)

    def test_recent_values_weighted_more_heavily(self) -> None:
        # A big jump at the END should move the mean more than the same jump at the START.
        mean_recent_jump, _ = weighted_mean_and_std([28.0, 28.0, 40.0])
        mean_early_jump, _ = weighted_mean_and_std([40.0, 28.0, 28.0])
        assert mean_recent_jump > mean_early_jump

    def test_empty_input_raises(self) -> None:
        with pytest.raises(ValueError):
            weighted_mean_and_std([])


class TestPredictNextPeriod:
    def test_no_cycles_returns_no_prediction(self) -> None:
        result = predict_next_period([])
        assert result.predicted_date is None
        assert result.confidence_level == "low"
        assert result.based_on_cycles == 0

    def test_single_logged_period_uses_default_estimate(self) -> None:
        cycles = derive_cycles(_periods_from_starts([date(2026, 1, 1)]))
        result = predict_next_period(cycles)

        assert result.predicted_date == date(2026, 1, 1) + timedelta(days=28)
        assert result.confidence_level == "low"
        assert result.based_on_cycles == 0
        assert result.average_cycle_length_days is None

    def test_perfectly_regular_cycles_yield_high_confidence(self) -> None:
        starts = [date(2026, 1, 1) + timedelta(days=28 * i) for i in range(6)]
        cycles = derive_cycles(_periods_from_starts(starts))
        result = predict_next_period(cycles)

        last_start = starts[-1]
        assert result.predicted_date == last_start + timedelta(days=28)
        assert result.confidence_level == "high"
        assert result.confidence_range is not None
        # Confidence range should be narrow for a perfectly consistent cycler.
        assert (result.confidence_range.latest - result.confidence_range.earliest).days <= 4

    def test_irregular_cycles_yield_low_confidence_and_wide_range(self) -> None:
        # Lengths bouncing between 21 and 35 days.
        starts = [date(2026, 1, 1)]
        for length in [21, 35, 22, 34, 23]:
            starts.append(starts[-1] + timedelta(days=length))
        cycles = derive_cycles(_periods_from_starts(starts))
        result = predict_next_period(cycles)

        assert result.confidence_level == "low"
        assert result.confidence_range is not None
        assert (result.confidence_range.latest - result.confidence_range.earliest).days > 4

    def test_single_outlier_cycle_skews_average_but_is_dampened_by_weighting(self) -> None:
        # Five regular 28-day cycles, then one anomalous 60-day cycle just before the ongoing one.
        starts = [date(2026, 1, 1) + timedelta(days=28 * i) for i in range(5)]
        starts.append(starts[-1] + timedelta(days=60))
        cycles = derive_cycles(_periods_from_starts(starts))
        result = predict_next_period(cycles)

        # The prediction should sit between the regular length and the outlier, but
        # recency-weighting pulls it toward the outlier without matching it exactly.
        assert result.average_cycle_length_days is not None
        assert 28 < result.average_cycle_length_days < 60

    def test_respects_max_cycles_window(self) -> None:
        # 10 cycles at 28 days, then a single 40-day outlier at the very start; with a
        # window of 6 the outlier should fall outside the averaging window entirely.
        starts = [date(2025, 1, 1)]
        starts.append(starts[-1] + timedelta(days=40))
        for _ in range(8):
            starts.append(starts[-1] + timedelta(days=28))
        cycles = derive_cycles(_periods_from_starts(starts))

        result = predict_next_period(cycles, max_cycles=6)
        assert result.average_cycle_length_days == pytest.approx(28.0)


class TestPredictFertileWindow:
    def test_no_cycles_returns_no_prediction(self) -> None:
        result = predict_fertile_window([])
        assert result.ovulation_date is None
        assert result.fertile_window_start is None
        assert result.fertile_window_end is None

    def test_regular_cycles_yield_ovulation_and_window_around_luteal_phase(self) -> None:
        starts = [date(2026, 1, 1) + timedelta(days=28 * i) for i in range(4)]
        cycles = derive_cycles(_periods_from_starts(starts))
        result = predict_fertile_window(cycles)

        expected_next_period = starts[-1] + timedelta(days=28)
        expected_ovulation = expected_next_period - timedelta(days=14)
        assert result.ovulation_date == expected_ovulation
        assert result.fertile_window_start == expected_ovulation - timedelta(days=5)
        assert result.fertile_window_end == expected_ovulation + timedelta(days=1)
        assert result.fertile_window_start < result.ovulation_date < result.fertile_window_end


class TestCycleRegularity:
    def test_insufficient_data_with_fewer_than_two_completed_cycles(self) -> None:
        cycles = derive_cycles(_periods_from_starts([date(2026, 1, 1)]))
        assert cycle_regularity(cycles) == "insufficient_data"

    def test_regular_cycles_flagged_regular(self) -> None:
        starts = [date(2026, 1, 1) + timedelta(days=28 * i) for i in range(4)]
        cycles = derive_cycles(_periods_from_starts(starts))
        assert cycle_regularity(cycles) == "regular"

    def test_high_variance_cycles_flagged_irregular(self) -> None:
        starts = [date(2026, 1, 1)]
        for length in [18, 38, 19, 37]:
            starts.append(starts[-1] + timedelta(days=length))
        cycles = derive_cycles(_periods_from_starts(starts))
        assert cycle_regularity(cycles) == "irregular"

    def test_out_of_range_single_cycle_flagged_irregular_even_with_low_variance(self) -> None:
        # Two consistently short (but consistent with each other) cycles: low std, but
        # both fall outside the medically-typical 21-35 day range.
        starts = [date(2026, 1, 1), date(2026, 1, 15), date(2026, 1, 29)]
        cycles = derive_cycles(_periods_from_starts(starts))
        assert cycle_regularity(cycles) == "irregular"


class TestDeterminePhase:
    def test_date_before_history_is_unknown(self) -> None:
        cycles = derive_cycles(_periods_from_starts([date(2026, 2, 1)]))
        assert determine_phase(date(2026, 1, 1), cycles) == "unknown"

    def test_period_days_are_menstrual(self) -> None:
        cycles = derive_cycles(_periods_from_starts([date(2026, 1, 1)], period_length=4))
        assert determine_phase(date(2026, 1, 1), cycles) == "menstrual"
        assert determine_phase(date(2026, 1, 4), cycles) == "menstrual"

    def test_day_after_period_is_follicular(self) -> None:
        cycles = derive_cycles(_periods_from_starts([date(2026, 1, 1)], period_length=4))
        assert determine_phase(date(2026, 1, 5), cycles) == "follicular"

    def test_around_ovulation_is_fertile(self) -> None:
        # Completed 28-day cycle: ovulation at day 14 (Jan 15), fertile window Jan 10-16.
        starts = [date(2026, 1, 1), date(2026, 1, 29)]
        cycles = derive_cycles(_periods_from_starts(starts))
        assert determine_phase(date(2026, 1, 15), cycles) == "fertile"

    def test_after_fertile_window_is_luteal(self) -> None:
        starts = [date(2026, 1, 1), date(2026, 1, 29)]
        cycles = derive_cycles(_periods_from_starts(starts))
        assert determine_phase(date(2026, 1, 25), cycles) == "luteal"
