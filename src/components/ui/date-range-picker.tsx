
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

interface DateRangePickerProps {
  value?: DateRange | undefined;
  onChange: (date: DateRange | undefined) => void;
  className?: string;
  align?: "center" | "end" | "start";
  calendarClassName?: string;
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  align = "start",
  calendarClassName,
  placeholder,
}: DateRangePickerProps) {
  const { t } = useTranslation();
  
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "PPP")} - {format(value.to, "PPP")}
                </>
              ) : (
                format(value.from, "PPP")
              )
            ) : (
              <span>{placeholder || t("common.selectDateRange") || "Selecionar período"}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            className={cn("rounded-md border pointer-events-auto", calendarClassName)}
          />
          <div className="flex items-center justify-between p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(undefined)}
              className="text-xs"
            >
              {t("common.clear") || "Limpar"}
            </Button>
            <Button
              size="sm"
              onClick={() => document.dispatchEvent(new MouseEvent("mousedown"))}
              className="text-xs"
            >
              {t("common.apply") || "Aplicar"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
