import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  serverTimestamp,
  Timestamp,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Schedule, ScheduleFormData } from "@/types/schedule";

const COLLECTION_NAME = "schedules";

// Helper function to convert Firestore document to Schedule
const convertScheduleDoc = (doc: any): Schedule => {
  const data = doc.data();
  return {
    id: doc.id,
    specialistId: data.specialistId || "",
    specialistName: data.specialistName || "",
    date:
      data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
    startTime: data.startTime || "",
    endTime: data.endTime || "",
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Get all schedules
export const getAllSchedules = async (): Promise<Schedule[]> => {
  try {
    const schedulesQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy("date", "asc"),
    );

    const querySnapshot = await getDocs(schedulesQuery);
    const schedules: Schedule[] = [];

    querySnapshot.forEach((doc) => {
      schedules.push(convertScheduleDoc(doc));
    });

    return schedules;
  } catch (error) {
    console.error("Error getting schedules:", error);
    throw error;
  }
};

// Get schedules by specialist ID
export const getSchedulesBySpecialistId = async (
  specialistId: string,
): Promise<Schedule[]> => {
  try {
    const schedulesQuery = query(
      collection(db, COLLECTION_NAME),
      where("specialistId", "==", specialistId),
      orderBy("date", "asc"),
    );

    const querySnapshot = await getDocs(schedulesQuery);
    const schedules: Schedule[] = [];

    querySnapshot.forEach((doc) => {
      schedules.push(convertScheduleDoc(doc));
    });

    return schedules;
  } catch (error) {
    console.error("Error getting schedules by specialist:", error);
    throw error;
  }
};

// Get schedule by ID
export const getScheduleById = async (id: string): Promise<Schedule | null> => {
  try {
    const scheduleDoc = await getDoc(doc(db, COLLECTION_NAME, id));

    if (scheduleDoc.exists()) {
      return convertScheduleDoc(scheduleDoc);
    }

    return null;
  } catch (error) {
    console.error("Error getting schedule:", error);
    throw error;
  }
};

// Create a new schedule
export const createSchedule = async (
  scheduleData: ScheduleFormData,
): Promise<Schedule> => {
  try {
    // Ensure the date is set to noon UTC to avoid timezone issues
    const date = new Date(scheduleData.date);
    date.setUTCHours(12, 0, 0, 0);

    // Add timestamps
    const newScheduleData = {
      ...scheduleData,
      date: date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Save the schedule to Firestore
    const docRef = await addDoc(
      collection(db, COLLECTION_NAME),
      newScheduleData,
    );

    // Create the schedule object to return
    const newSchedule: Schedule = {
      id: docRef.id,
      ...scheduleData,
      date: date,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newSchedule;
  } catch (error) {
    console.error("Error creating schedule:", error);
    throw error;
  }
};

// Update an existing schedule
export const updateSchedule = async (
  id: string,
  scheduleData: Partial<ScheduleFormData>,
): Promise<void> => {
  try {
    // Create update data with timestamp
    const updateData = {
      ...scheduleData,
      updatedAt: serverTimestamp(),
    };

    // Update the schedule in Firestore
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
  } catch (error) {
    console.error("Error updating schedule:", error);
    throw error;
  }
};

// Delete a schedule
export const deleteSchedule = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
};
