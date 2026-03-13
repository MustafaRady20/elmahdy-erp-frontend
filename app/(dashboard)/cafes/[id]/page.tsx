"use client";

import { BASE_URL } from "@/lib/constants";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coffee, 
  Building2, 
  Loader2, 
  ArrowRight, 
  TrendingUp, 
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import AddPurchaseDialog from "./AddPurchaseDialog";
import AddRevenueDialog from "./AddRevenueDialog";
import PurchasesList from "./PurchasesList";
import RevenueList from "./RevenueList";

type Cafe = {
  _id: string;
  name: string;
  branch: {
    _id: string;
    name: string;
  };
  description?: string;
};

type CafeStatistics = {
  totalPurchases: number;
  totalSpent: number;
  totalQuantity: number;
  averageOrderValue: number;
  lastPurchaseDate: string | null;
  topCategories: Array<{
    category: { _id: string; name: string };
    totalSpent: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    totalCost: number;
    count: number;
  }>;
};

type RevenueData = {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
};

export default function CafeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const cafeId = unwrappedParams.id;

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [statistics, setStatistics] = useState<CafeStatistics | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch cafe details
      const cafeRes = await fetch(`${BASE_URL}/cafes/${cafeId}`);
      const cafeData = await cafeRes.json();
      setCafe(cafeData);

      // Fetch statistics
      const statsRes = await fetch(
        `${BASE_URL}/purchases/statistics/cafe/${cafeId}`
      );
      const statsData = await statsRes.json();
      setStatistics(statsData);
      setStatsLoading(false);

      // Fetch revenue data
      await fetchRevenue();
    } catch (err) {
      console.error("Failed to load cafe data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenue = async () => {
    setRevenueLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [dailyRes, weeklyRes, monthlyRes, yearlyRes] = await Promise.all([
        fetch(`${BASE_URL}/revenue/daily/${cafeId}/${today}`),
        fetch(`${BASE_URL}/revenue/weekly/${cafeId}`),
        fetch(`${BASE_URL}/revenue/monthly/${cafeId}`),
        fetch(`${BASE_URL}/revenue/yearly/${cafeId}`),
      ]);

      const [dailyData, weeklyData, monthlyData, yearlyData] = await Promise.all([
        dailyRes.json(),
        weeklyRes.json(),
        monthlyRes.json(),
        yearlyRes.json(),
      ]);

      console.log("Revenue data:", { dailyData, weeklyData, monthlyData, yearlyData });

      setRevenue({
        daily: dailyData[0]?.totalRevenue || 0,
        weekly: weeklyData[0]?.totalRevenue || 0,
        monthly: monthlyData[0]?.totalRevenue || 0,
        yearly: yearlyData[0]?.totalRevenue || 0,
      });

     
    } catch (err) {
      console.error("Failed to load revenue", err);
    } finally {
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cafeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">جاري تحميل بيانات المقهى...</p>
        </div>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Coffee className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              المقهى غير موجود
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              لم نتمكن من العثور على المقهى المطلوب
            </p>
            <Link href="/cafes">
              <Button variant="outline">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة للمقاهي
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "لا يوجد";
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const profit = (revenue?.monthly || 0) - (statistics?.totalSpent || 0);
  const profitMargin = revenue?.monthly ? ((profit / revenue.monthly) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/cafes">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة للمقاهي
            </Button>
          </Link>
        </div>

        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Coffee className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl mb-2">{cafe.name}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{cafe.branch?.name}</span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm">
                نشط
              </Badge>
            </div>
            {cafe.description && (
              <>
                <Separator className="my-4" />
                <CardDescription className="text-base">
                  {cafe.description}
                </CardDescription>
              </>
            )}
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <AddPurchaseDialog 
            cafeId={cafeId} 
            branchId={cafe.branch._id}
            onAdded={fetchData} 
          />
          <AddRevenueDialog 
            cafeId={cafeId} 
            onAdded={fetchRevenue} 
          />
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الإيرادات اليومية
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(revenue?.daily || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    اليوم
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الإيرادات الأسبوعية
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(revenue?.weekly || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    آخر 7 أيام
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الإيرادات الشهرية
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(revenue?.monthly || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    هذا الشهر
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الإيرادات السنوية
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(revenue?.yearly || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    هذا العام
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profit Card */}
        <Card className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
              صافي الربح (شهري)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(profit)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  هامش الربح: {profitMargin}%
                </p>
              </div>
              <div className="text-left text-sm text-muted-foreground">
                <p>الإيرادات: {formatCurrency(revenue?.monthly || 0)}</p>
                <p>المصروفات: {formatCurrency(statistics?.totalSpent || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="purchases">المشتريات</TabsTrigger>
            <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
            <TabsTrigger value="categories">التصنيفات</TabsTrigger>
            <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {statsLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">جاري تحميل الإحصائيات...</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        إجمالي المشتريات
                      </CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {statistics?.totalPurchases || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        عملية شراء
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        إجمالي المصروفات
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(statistics?.totalSpent || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        إجمالي التكلفة
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        إجمالي الكمية
                      </CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {statistics?.totalQuantity || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        وحدة مشتراة
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        متوسط قيمة الطلب
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(statistics?.averageOrderValue || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        لكل عملية شراء
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Last Purchase */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      آخر عملية شراء
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">
                      {formatDate(statistics?.lastPurchaseDate || null)}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="purchases">
            <PurchasesList cafeId={cafeId} />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueList cafeId={cafeId} />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  أعلى التصنيفات
                </CardTitle>
                <CardDescription>
                  التصنيفات الأكثر إنفاقاً
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </div>
                ) : statistics?.topCategories && statistics.topCategories.length > 0 ? (
                  <div className="space-y-4">
                    {statistics.topCategories.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{item.category?.name || "غير محدد"}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.count} عملية شراء
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-lg">
                            {formatCurrency(item.totalSpent)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد بيانات متاحة
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  الاتجاه الشهري
                </CardTitle>
                <CardDescription>
                  المشتريات والمصروفات خلال الأشهر الماضية
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </div>
                ) : statistics?.monthlyTrend && statistics.monthlyTrend.length > 0 ? (
                  <div className="space-y-3">
                    {statistics.monthlyTrend.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div>
                          <p className="font-semibold">{item.month}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.count} عملية شراء
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-lg">
                            {formatCurrency(item.totalCost)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد بيانات متاحة
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}