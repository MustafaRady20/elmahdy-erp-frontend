"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
export default function Home() {
  const router = useRouter()

 const [isRedirecting, setIsRedirecting] = useState(false);
  const [user, setUser] = useState<{ role: "employee" | "manager" } | null>(null);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    }
  }, []);
  const handleEnter = () => {
    setIsRedirecting(true);

    // Simulate navigation delay
    setTimeout(() => {
      if (user) {
        // Redirect based on role
        if (user.role === "employee") {
          router.replace("/attendance");
        } else if (user.role === "manager") {
          router.replace("/dashboard");
        } 
      } else {
        // console.log("Redirecting to: /login");
        router.push("/login");
      }
      
      // Reset button state after redirect
      setTimeout(() => setIsRedirecting(false), 1000);
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" dir="rtl">
      <div className="text-center px-4">
        {/* Logo with animated glow */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-30 animate-pulse"></div>
          <div className="relative w-28 h-28 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <svg 
              className="w-16 h-16 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
              />
            </svg>
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-6xl font-bold mb-6 text-white">
          مرحباً بك في شركة المهدي للمقاولات 
        </h1>
        <p className="mb-12 text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed">
          نظام متكامل لإدارة المهام والحضور والتقارير في مكان واحد
        </p>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          disabled={isRedirecting}
          className="px-12 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-bold rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-2xl"
        >
          {isRedirecting ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  fill="none"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              جاري التحميل...
            </span>
          ) : (
            "ادخل الآن"
          )}
        </button>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
      </div>
    </div>
  );
}