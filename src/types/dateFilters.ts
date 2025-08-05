// src/types/dateFilters.ts

export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

export type AnalysisPeriodType = 'current_month' | 'last_month' | 'last_12_months' | 'custom';
export type ComparisonPeriodType = 'previous_period' | 'same_period_last_year' | 'custom';

export interface AnalysisPeriod {
  readonly type: AnalysisPeriodType;
  readonly range: DateRange;
  readonly label: string;
}

export interface ComparisonPeriod {
  readonly type: ComparisonPeriodType;
  readonly range: DateRange;
  readonly label: string;
}

export interface DateFilterState {
  readonly analysisPeriod: AnalysisPeriod;
  readonly comparisonPeriod: ComparisonPeriod;
}

// Utilitaires pour calculs de dates
export const DateUtils = {
  getCurrentMonth(): DateRange {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
    };
  },

  getLastMonth(): DateRange {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0)
    };
  },

  getLast12Months(): DateRange {
    const now = new Date();
    return {
      start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      end: now
    };
  },

  getPreviousPeriod(analysisRange: DateRange): DateRange {
    const duration = analysisRange.end.getTime() - analysisRange.start.getTime();
    return {
      start: new Date(analysisRange.start.getTime() - duration),
      end: new Date(analysisRange.start.getTime() - 1)
    };
  },

  getSamePeriodLastYear(analysisRange: DateRange): DateRange {
    return {
      start: new Date(analysisRange.start.getFullYear() - 1, analysisRange.start.getMonth(), analysisRange.start.getDate()),
      end: new Date(analysisRange.end.getFullYear() - 1, analysisRange.end.getMonth(), analysisRange.end.getDate())
    };
  },

  formatRange(range: DateRange): string {
    const startMonth = range.start.toLocaleDateString('fr-FR', { 
      month: 'short', 
      year: 'numeric' 
    });
    const endMonth = range.end.toLocaleDateString('fr-FR', { 
      month: 'short', 
      year: 'numeric' 
    });

    if (startMonth === endMonth) {
      return startMonth;
    }

    if (range.start.getFullYear() === range.end.getFullYear()) {
      const startMonthOnly = range.start.toLocaleDateString('fr-FR', { month: 'short' });
      const endMonthOnly = range.end.toLocaleDateString('fr-FR', { month: 'short' });
      const year = range.start.getFullYear();
      return `${startMonthOnly} - ${endMonthOnly} ${year}`;
    }

    return `${startMonth} - ${endMonth}`;
  },

  formatComparison(analysis: AnalysisPeriod, comparison: ComparisonPeriod): string {
    // return `${analysis.label} vs ${comparison.label}`;
    return `${analysis.label}`;
  }
};