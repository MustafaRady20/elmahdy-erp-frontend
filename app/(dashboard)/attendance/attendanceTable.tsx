"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

type Attendance = {
  employeeId: {
    name:string;
    _id: string;
  };
  checkInTime: string;
  checkOutTime: string | null;
  totalHours: number;
};

interface AttendanceTableProps {
  attendance: Attendance[];
}

export default function AttendanceTable({ attendance }: AttendanceTableProps) {
  const [search, setSearch] = useState("");
  const [filteredAttendance, setFilteredAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    if (attendance.length) {
      setFilteredAttendance(
        attendance.filter((e) =>
          e.employeeId.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, attendance]);

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    const date = new Date(time);
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full">
      <Input
        placeholder="ابحث عن موظف..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full sm:w-1/3 border-gray-300 dark:border-gray-700"
      />

      <div className="rounded-xl border bg-white dark:bg-gray-900 shadow-md overflow-hidden">
        <Table className="text-center">
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-gray-800">
              <TableHead className="font-semibold">الاسم</TableHead>
              <TableHead className="font-semibold">وقت الدخول</TableHead>
              <TableHead className="font-semibold">وقت الخروج</TableHead>
              <TableHead className="font-semibold">إجمالي الساعات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAttendance?.length > 0 ? (
              filteredAttendance.map((item, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {item.employeeId.name}
                  </TableCell>

                  <TableCell>{formatTime(item.checkInTime)}</TableCell>
                  <TableCell>{formatTime(item.checkOutTime)}</TableCell>

                  <TableCell>
                    {item.totalHours ? `${item.totalHours} ساعة` : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-gray-500 dark:text-gray-400"
                >
                  لا توجد نتائج مطابقة للبحث
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
