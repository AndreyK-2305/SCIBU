import { Edit, Trash2 } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Schedule } from "@/types/schedule";

interface ScheduleItemProps {
  schedule: Schedule;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ScheduleItem({
  schedule,
  onEdit,
  onDelete,
}: ScheduleItemProps) {
  const { specialistName, startTime, endTime } = schedule;

  // Format the time display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return date.toLocaleTimeString("es-ES", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="mb-2 rounded-lg border p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-md bg-green-100 p-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 6.5C12.83 6.5 13.5 7.17 13.5 8C13.5 8.83 12.83 9.5 12 9.5C11.17 9.5 10.5 8.83 10.5 8C10.5 7.17 11.17 6.5 12 6.5ZM12 12.5C13.6 12.5 15.45 13.15 15.5 13.5V14H8.5V13.5C8.55 13.15 10.4 12.5 12 12.5ZM12 4.5C10.07 4.5 8.5 6.07 8.5 8C8.5 9.93 10.07 11.5 12 11.5C13.93 11.5 15.5 9.93 15.5 8C15.5 6.07 13.93 4.5 12 4.5ZM12 10.5C9.66 10.5 5 11.68 5 14V16H19V14C19 11.68 14.34 10.5 12 10.5Z"
                fill="#10B981"
              />
            </svg>
          </div>
          <div>
            <div className="font-medium text-gray-700">
              {`${formatTime(startTime)} - ${formatTime(endTime)}`}
            </div>
            <div className="text-sm text-gray-500">Dr. {specialistName}</div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={onEdit}
            className="h-8 w-8 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
          >
            <Edit size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
