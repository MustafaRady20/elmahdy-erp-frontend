"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import CheckIn from "./checkin";
import AttendanceTable from "./attendanceTable";
import Cookies from "js-cookie";
import { useCurrentUser } from "@/hooks/current-user";
import { BASE_URL } from "@/lib/constants";

type AttendanceRecord = {
  employeeId: { _id: string; name: string };
  checkInTime: string;
  checkOutTime: string | null;
  totalHours: number;
};

export default function EmployeeAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [message, setMessage] = useState<string>("");
  const {role} = useCurrentUser();
  const fetchTodayAttendance = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/attendance/today`
      );
      setAttendance(data);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "");
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);
  if (!role) return <div>Loading...</div>;

  return role === "employee" ? (
    <CheckIn attendance={attendance || []} />
  ) : (
    <AttendanceTable attendance={attendance || []} />
  );
}
