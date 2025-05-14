export interface Schedule {
  id: string;
  specialistId: string;
  specialistName: string;
  date: Date;
  startTime: string;
  endTime: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ScheduleFormData {
  specialistId: string;
  specialistName: string;
  date: Date;
  startTime: string;
  endTime: string;
}
