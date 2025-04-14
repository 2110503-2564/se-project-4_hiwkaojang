"use client";
import { DateTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import { Select, MenuItem } from "@mui/material";

export default function DentistDateReserve({
  onDateChange,
  onDentistChange,
  selectedDentist,
  selectedDate = null
}: {
  onDateChange: Function;
  onDentistChange: Function;
  selectedDentist: string;
  selectedDate?: Dayjs | null;
}) {
  const [reserveDate, setReserveDate] = useState<Dayjs | null>(selectedDate || null);
  const [dentist, setDentist] = useState<string>(selectedDentist || '');

  useEffect(() => {
    if (selectedDentist) {
      setDentist(selectedDentist);
    }
    if (selectedDate) {
      setReserveDate(selectedDate);
    }
  }, [selectedDentist, selectedDate]);

  return (
    <div className="bg-slate-100 rounded-lg p-8 flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
      <div className="w-full flex flex-col items-center space-y-4">
        <div className="w-full max-w-xs">
          <p className="text-sm font-medium text-gray-700 mb-2">Choose Dentist</p>
          <Select
            fullWidth
            variant="outlined"
            name="dentist"
            id="dentist"
            value={dentist}
            onChange={(e) => {
              setDentist(e.target.value);
              onDentistChange(e.target.value);
            }}
            className="h-12"
          >
            <MenuItem value="67de5e972e209b32c9dc2c3e">Dr. John Carter</MenuItem>
            <MenuItem value="67de5ea92e209b32c9dc2c41">Dr. Emily Richardson</MenuItem>
            <MenuItem value="67de5eb22e209b32c9dc2c44">Dr. Michael Tanaka</MenuItem>
            <MenuItem value="67de5ebd2e209b32c9dc2c47">Dr. Sophia Patel</MenuItem>
            <MenuItem value="67de5ec92e209b32c9dc2c4a">Dr. David Lee</MenuItem>
            <MenuItem value="67de5ed32e209b32c9dc2c4d">Dr. Jessica Wong</MenuItem>
            <MenuItem value="67de5edd2e209b32c9dc2c50">Dr. Robert Sanchez</MenuItem>
            <MenuItem value="67de5ee72e209b32c9dc2c53">Dr. Anna Müller</MenuItem>
            <MenuItem value="67dfec958ec43a236dead153">Dr. Benjamin Cooper</MenuItem>
          </Select>
        </div>

        <div className="w-full max-w-xs">
          <p className="text-sm font-medium text-gray-700 mb-2">Choose Date and Time</p>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              className="w-full"
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  variant: 'outlined'
                } 
              }}
              value={reserveDate}
              onChange={(value) => {
                setReserveDate(value);
                onDateChange(value);
              }}
            />
          </LocalizationProvider>
        </div>
      </div>
    </div>
  );
}