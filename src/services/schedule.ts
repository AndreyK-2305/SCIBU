import { Schedule, ScheduleFormData } from "@/types/schedule";

import {
  getSchedulesFromStorage,
  saveSchedulesToStorage,
} from "./localStorage";

// Get all schedules
export const getAllSchedules = async (): Promise<Schedule[]> => {
  return getSchedulesFromStorage();
};

// Get schedules by date
export const getSchedulesByDate = async (date: Date): Promise<Schedule[]> => {
  const schedules = getSchedulesFromStorage();
  return schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.date);
    return (
      scheduleDate.getDate() === date.getDate() &&
      scheduleDate.getMonth() === date.getMonth() &&
      scheduleDate.getFullYear() === date.getFullYear()
    );
  });
};

// Get schedules by specialist
export const getSchedulesBySpecialist = async (
  specialistId: string,
): Promise<Schedule[]> => {
  const schedules = getSchedulesFromStorage();
  return schedules.filter((schedule) => schedule.specialistId === specialistId);
};

// Create a new schedule
export const createSchedule = async (
  scheduleData: ScheduleFormData,
): Promise<Schedule> => {
  const schedules = getSchedulesFromStorage();

  const newSchedule: Schedule = {
    ...scheduleData,
    id: `schedule${schedules.length + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedSchedules = [...schedules, newSchedule];
  saveSchedulesToStorage(updatedSchedules);

  return newSchedule;
};

// Update a schedule
export const updateSchedule = async (
  id: string,
  scheduleData: Partial<ScheduleFormData>,
): Promise<Schedule> => {
  const schedules = getSchedulesFromStorage();
  const scheduleIndex = schedules.findIndex((s) => s.id === id);

  if (scheduleIndex === -1) {
    throw new Error(`Schedule with ID ${id} not found`);
  }

  const updatedSchedule: Schedule = {
    ...schedules[scheduleIndex],
    ...scheduleData,
    updatedAt: new Date(),
  };

  schedules[scheduleIndex] = updatedSchedule;
  saveSchedulesToStorage(schedules);

  return updatedSchedule;
};

// Delete a schedule
export const deleteSchedule = async (id: string): Promise<void> => {
  const schedules = getSchedulesFromStorage();
  const updatedSchedules = schedules.filter((s) => s.id !== id);
  saveSchedulesToStorage(updatedSchedules);
};
