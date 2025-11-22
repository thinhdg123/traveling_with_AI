"use client";

import { useMemo, type CSSProperties } from "react";
import {
  DatePicker,
  type DatePickerType,
} from "@mantine/dates";
import {
  MantineProvider,
  Text,
  createTheme,
  type MantineColorScheme,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

export type CalendarValue = Date | null | [Date | null, Date | null] | Date[];

export interface CalendarProps {
  /** Calendar selection type */
  type?: DatePickerType;
  /** Controlled date value */
  value?: CalendarValue;
  /** Change handler for the selected value */
  onChange?: (value: CalendarValue) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Optional label rendered above the calendar */
  label?: string;
  /** Optional description rendered below the label */
  description?: string;
  /** Control the color scheme (defaults to light) */
  colorScheme?: MantineColorScheme;
  /** Additional className applied to the wrapper div */
  className?: string;
  /** Inline styles applied to the wrapper div */
  style?: CSSProperties;
}

const baseTheme = createTheme({
  fontFamily: "Roboto, 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  defaultRadius: "lg",
  primaryColor: "orange",
  primaryShade: { light: 6, dark: 4 },
});

const pickerStyles = {
  month: {
    borderRadius: "10px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    padding: "12px",
  },
  day: {
    fontWeight: 500,
  },
};

const Calendar = ({
  type = "default",
  value,
  onChange,
  minDate,
  maxDate,
  label,
  description,
  colorScheme = "light",
  className,
  style,
}: CalendarProps) => {
  const memoizedTheme = useMemo(() => baseTheme, []);
  const containerClassName = ["flex flex-col gap-1", className]
    .filter(Boolean)
    .join(" ");
  const mergedStyle: CSSProperties = {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "8px",
    ...style,
  };

  return (
    <MantineProvider theme={memoizedTheme} defaultColorScheme={colorScheme}>
      <div className={containerClassName} style={mergedStyle}>
        {label && (
          <Text component="label" fw={600} size="sm">
            {label}
          </Text>
        )}
        {description && (
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        )}
        <DatePicker
          type={type}
          value={value as never}
          onChange={(val: CalendarValue) => onChange?.(val)}
          minDate={minDate}
          maxDate={maxDate}
          weekendDays={[0]}
          allowDeselect
          allowSingleDateInRange
          classNames={{
            month: "mantine-month",
            day: "mantine-day",
          }}
          styles={pickerStyles}
        />
      </div>
    </MantineProvider>
  );
};

export default Calendar;
