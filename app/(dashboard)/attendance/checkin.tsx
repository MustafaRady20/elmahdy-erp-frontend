"use client";

import { useState, useEffect, useReducer } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  MapPin,
  Calendar,
  LogIn,
  LogOut,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { BASE_URL } from "@/lib/constants";
import { useCurrentUser } from "@/hooks/current-user";

type Attendance = {
  employeeId: {
    _id: string;
  };
  checkInTime: string;
  checkOutTime: string | null;
  totalHours: number;
};

interface AttendanceTableProps {
  attendance: Attendance[];
}

export default function CheckIn({attendance}:AttendanceTableProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const {empId} = useCurrentUser()
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);



const isCheckedIn = Array.isArray(attendance)
  ? attendance.find((emp) => emp.employeeId?._id == empId)
  : null;

  const handleAttendance = async (type: "checkIn" | "checkOut") => {
    if (!navigator.geolocation) {
      setMessage({ text: "Geolocation غير مدعوم في متصفحك.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`${BASE_URL}/attendance/${type}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              employeeId: empId,
              lat: latitude,
              lng: longitude,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "حدث خطأ أثناء العملية");
          }

          setMessage({
            text:
              type === "checkIn"
                ? "تم تسجيل الدخول بنجاح"
                : "تم تسجيل الخروج بنجاح",
            type: "success",
          });
        } catch (err: any) {
          setMessage({
            text: err.message || "حدث خطأ أثناء العملية",
            type: "error",
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setMessage({
          text: "تعذر الحصول على الموقع الحالي. تأكد من السماح بالوصول إلى الموقع.",
          type: "error",
        });
        setLoading(false);
      }
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen  p-4 md:p-8">
      {/* Header Card */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              نظام الحضور
            </CardTitle>
            <Clock className="w-8 h-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lg md:text-xl font-semibold">
              <Clock className="w-5 h-5" />
              <span>{formatTime(currentTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base opacity-90">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(currentTime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Action Card */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center text-gray-800">
            تسجيل الحضور والانصراف
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleAttendance("checkIn")}
              disabled={
                loading || (isCheckedIn) ? true : false
              }
              className="h-20 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري التسجيل...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <LogIn className="w-6 h-6" />
                  <span>تسجيل الدخول</span>
                </div>
              )}
            </Button>

           {isCheckedIn &&  <Button
              onClick={() => handleAttendance("checkOut")}
              disabled={loading || !isCheckedIn}
              className="h-20 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري التسجيل...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <LogOut className="w-6 h-6" />
                  <span>تسجيل الخروج</span>
                </div>
              )}
            </Button>}
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm md:text-base ${
                  message.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Location Notice */}
          <div className="flex items-start gap-2 text-xs md:text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
            <p>
              سيتم استخدام موقعك الجغرافي الحالي لتسجيل الحضور. تأكد من تفعيل
              خدمات تحديد الموقع.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
