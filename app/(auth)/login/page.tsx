"use client";

import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/constants";

type FormData = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ defaultValues: { username: "", password: "" } });

  async function onSubmit(data: FormData) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        phone: data.username,
        password: data.password,
      });

      const result = response.data;

      console.log(result);
      
      if (result.firstLogin) {
        router.push(`/reset-password?phone=${data.username}`);
        return;
      }

      Cookies.set("token", result.token, { expires: 7 });
      Cookies.set("user", JSON.stringify({
        role: result.employee.role,
        empId: result.employee._id
      }), { expires: 7 });

      if (result.employee.role === "employee") {
        router.push("/attendance");
      } else if (result.employee.role === "manager") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "خطأ في تسجيل الدخول");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-2xl">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">مرحباً بك</h1>
          <p className="text-blue-200 text-lg">سجل دخولك للمتابعة</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Phone Input */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-blue-100">
                رقم الهاتف
              </Label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none">
                  <Mail className="w-5 h-5" />
                </div>
                <Input
                  id="username"
                  {...register("username", { required: "رقم الهاتف مطلوب" })}
                  placeholder="أدخل رقم الهاتف"
                  className="pr-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-300 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                  dir="rtl"
                />
              </div>
              {errors.username && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.username.message}</span>
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-blue-100">
                كلمة المرور
              </Label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password", { required: "كلمة المرور مطلوبة" })}
                  placeholder="أدخل كلمة المرور"
                  className="pr-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-300 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                  dir="rtl"
                />
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-300 hover:text-blue-200 font-medium transition-colors"
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed group transform hover:scale-105"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري التحميل...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-blue-200 mt-6">
          محمي بواسطة تشفير من الدرجة المصرفية 🔒
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full opacity-20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl pointer-events-none"></div>
    </div>
  );
}