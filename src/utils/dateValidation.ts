export interface DateValidationResult {
  isValid: boolean;
  errorMessage: string;
}

export const validateDates = (start: string, end: string): DateValidationResult => {
  if (start && end) {
    const start_date = new Date(start);
    const end_date = new Date(end);
    
    if (start_date > end_date) {
      return {
        isValid: false,
        errorMessage: 'Ngày kết thúc không thể trước ngày bắt đầu'
      };
    }
  }
  
  return {
    isValid: true,
    errorMessage: ''
  };
};

export const handleStartDateChange = (
  newStartDate: string, 
  endDate: string, 
  setStartDate: (value: string) => void,
  setDateError: (error: string) => void
) => {
  setStartDate(newStartDate);
  const result = validateDates(newStartDate, endDate);
  setDateError(result.errorMessage);
};

export const handleEndDateChange = (
  newEndDate: string, 
  startDate: string, 
  setEndDate: (value: string) => void,
  setDateError: (error: string) => void
) => {
  setEndDate(newEndDate);
  const result = validateDates(startDate, newEndDate);
  setDateError(result.errorMessage);
};
