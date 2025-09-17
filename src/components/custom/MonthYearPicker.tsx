import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface MonthYearPickerProps {
  date: Date;
  onChange: (newDate: Date) => void;
}

export function MonthYearPicker({ date, onChange }: MonthYearPickerProps) {
  const [year, setYear] = useState(date.getFullYear());
  const months = Array.from({ length: 12 }, (_, i) => i);

  const handleMonthSelect = (monthIndex: number) => {
    onChange(new Date(year, monthIndex, 1));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => setYear(y => y - 1)}>
          <ChevronLeft />
        </Button>
        <div className="font-bold">{year}</div>
        <Button variant="ghost" size="icon" onClick={() => setYear(y => y + 1)}>
          <ChevronRight />
        </Button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {months.map((m) => (
          <Button
            key={m}
            variant={date.getFullYear() === year && date.getMonth() === m ? "default" : "outline"}
            onClick={() => handleMonthSelect(m)}
          >
            Thg {m + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}