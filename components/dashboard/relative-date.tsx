"use client";

import React, { useEffect, useState } from "react";
import { Calendar, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow, isBefore, parseISO, differenceInDays } from "date-fns";

interface RelativeDateProps {
  deadline: string | null;
}

export function RelativeDate({ deadline }: RelativeDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <Clock className="w-3.5 h-3.5" />
        Rolling Deadline
      </span>
    );
  }

  // Fallback representation to prevent hydration mismatch prior to client-side mounting
  if (!mounted) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <Calendar className="w-3.5 h-3.5" />
        {deadline}
      </span>
    );
  }

  try {
    const deadlineDate = parseISO(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPast = isBefore(deadlineDate, today);
    const daysRemaining = differenceInDays(deadlineDate, today);

    if (isPast) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-red-100 text-red-700 text-xs font-semibold border border-red-200">
          <AlertCircle className="w-3.5 h-3.5" />
          Closed
        </span>
      );
    }

    if (daysRemaining <= 7) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" />
          Closes in {daysRemaining} {daysRemaining === 1 ? "day" : "days"}!
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#e9eee8] text-[#102b2b] text-xs font-semibold border border-[#ccd4cb]">
        <Calendar className="w-3.5 h-3.5" />
        {formatDistanceToNow(deadlineDate, { addSuffix: true })}
      </span>
    );
  } catch (err) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <Calendar className="w-3.5 h-3.5" />
        {deadline}
      </span>
    );
  }
}
