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
            <MenuItem value="67fde0a05a0148bd6061706c">Dr. John Carter</MenuItem>
            <MenuItem value="67fde18e5a0148bd6061706f">Dr. Emily Richardson</MenuItem>
            <MenuItem value="67fde1ee5a0148bd60617072">Dr. Michael Tanaka</MenuItem>
            <MenuItem value="67fde2225a0148bd60617075">Dr. Sophia Patel</MenuItem>
            <MenuItem value="67fde24d5a0148bd60617078">Dr. David Lee</MenuItem>
            <MenuItem value="67fde2885a0148bd6061707b">Dr. Jessica Wong</MenuItem>
            <MenuItem value="67fde2b75a0148bd6061707e">Dr. Robert Sanchez</MenuItem>
            <MenuItem value="67fde2de5a0148bd60617081">Dr. Anna Müller</MenuItem>
            <MenuItem value="67fde3085a0148bd60617084">Dr. Benjamin Cooper</MenuItem>
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