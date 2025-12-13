"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { BASE_URL } from "@/lib/constants";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/dashboard`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );

  const getActivityColor = (index: number) => {
    const colors = [
      "from-emerald-400 to-emerald-600",
      "from-teal-400 to-teal-600",
      "from-cyan-400 to-cyan-600"
    ];
    return colors[index % colors.length];
  };

  const getMedalEmoji = (index: number) => {
    const medals = ["🥇", "🥈", "🥉"];
    return medals[index] || "🏅";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2">
            📊 لوحة التحكم
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">نظرة شاملة على الأداء المالي</p>
        </div>

        {/* Main Stats Card */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-800 border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 dark:text-blue-200 text-lg mb-2 font-medium">إجمالي الإيرادات</p>
                  <p className="text-5xl md:text-6xl font-extrabold text-white">
                    {data.totalRevenue.toLocaleString("ar-EG")}
                    <span className="text-2xl mr-2">ج.م</span>
                  </p>
                </div>
                <div className="bg-white/20 dark:bg-white/10 p-4 rounded-full">
                  <DollarSign className="w-16 h-16 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Revenue & Top Employees */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue by Activity */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 dark:bg-green-600 p-2 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  الإيرادات حسب النشاط
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {data.activityRevenue.map((act: any, index: number) => (
                  <div key={act.activity} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {act.activity}
                      </span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {act.total.toLocaleString("ar-EG")} ج.م
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute h-full bg-gradient-to-r ${getActivityColor(index)} rounded-full transition-all duration-1000 ease-out`}
                        style={{
                          width: `${(act.total / data.totalRevenue) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {((act.total / data.totalRevenue) * 100).toFixed(1)}% من الإجمالي
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Employees */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 dark:bg-yellow-600 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  أعلى 3 موظفين
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {data.topEmployees.map((e: any, i: number) => (
                  <div
                    key={e.employeeId}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{getMedalEmoji(i)}</span>
                      <div>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{e.name}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400">
                        {e.totalRevenue.toLocaleString("ar-EG")}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ج.م</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">عدد الأنشطة</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{data.activityRevenue.length}</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                  <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">متوسط الإيراد</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {(data.totalRevenue / data.activityRevenue.length).toFixed(0)}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">أفضل موظف</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {data.topEmployees[0]?.name.split(" ")[0]}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}