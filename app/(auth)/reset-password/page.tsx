"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { useState } from "react";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/constants";

type FormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const phone = params.get("phone");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  async function onSubmit(data: FormData) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/set-password`, {
        phone,
        newPassword: data.password,
      });

      const result = response.data;
      
      // Store in cookies instead of localStorage
      Cookies.set("token", result.token, { expires: 7 });
      
      if (result.employee) {
        Cookies.set("user", JSON.stringify({
          role: result.employee.role,
          empId: result.employee._id
        }), { expires: 7 });

        // Redirect based on role
        if (result.employee.role === "employee") {
          router.push("/attendance");
        } else if (result.employee.role === "manager") {
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "حدث خطأ");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl mb-6 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">إنشاء كلمة مرور جديدة</h1>
          <p className="text-purple-200 text-lg">قم بإنشاء كلمة مرور آمنة لحسابك</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-purple-100">
                كلمة المرور الجديدة
              </Label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "كلمة المرور مطلوبة",
                  })}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="pr-10 pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-purple-100 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {errors.password && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-purple-100">
                تأكيد كلمة المرور
              </Label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "تأكيد كلمة المرور مطلوب",
                    validate: (value) =>
                      value === password || "كلمتا المرور غير متطابقتين",
                  })}
                  placeholder="أعد إدخال كلمة المرور"
                  className="pr-10 pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-purple-100 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {errors.confirmPassword && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.confirmPassword.message}</span>
                </div>
              )}

              {!errors.confirmPassword && confirmPassword && confirmPassword === password && (
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>كلمتا المرور متطابقتان</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>حفظ كلمة المرور</span>
                </div>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-purple-200 mt-6">
          ستتمكن من تسجيل الدخول فوراً بعد إنشاء كلمة المرور 🔐
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
    </div>
  );
}