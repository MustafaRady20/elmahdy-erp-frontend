"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BASE_URL } from "@/lib/constants";
import { Label } from "@/components/ui/label";

// ─── Salaries Tab ────────────────────────────────────────────────────────────

function SalariesTab() {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  async function fetchData() {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get(`${BASE_URL}/salary`, { params });
      setSalaries(res.data);
      setFiltered(res.data);
    } catch (error) {
      console.error(error);
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value);
    setFiltered(
      !value
        ? salaries
        : salaries.filter((s) =>
            s.name.toLowerCase().includes(value.toLowerCase())
          )
    );
  };

  return (
    <div className="space-y-4">
    {/* Date Filters */}
<div className="flex gap-4 flex-wrap">
    {/* إلى */}
  <div className="flex flex-1 flex-col gap-1 w-full sm:w-auto">
    <Label className="text-right text-end ">إلى</Label>
    <Input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="text-right"
    />
  </div>
  {/* من */}
  <div className="flex flex-1 flex-col gap-1 w-full sm:w-auto">
    <Label className="text-right">من</Label>
    <Input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="text-right"
    />
  </div>


</div>

      {/* Search */}
      <Input
        placeholder="🔍 ابحث باسم الموظف..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="text-right"
      />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right font-bold">نوع المرتب</TableHead>
              <TableHead className="text-right font-bold">المرتب</TableHead>
              <TableHead className="text-right font-bold">الموظف</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <TableRow key={item.employeeId}>
                  <TableCell className="text-right">
                    {item.type === "fixed" ? "ثابت" : "متغير"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.salary.toLocaleString("ar-EG")} ج.م
                  </TableCell>
                  <TableCell className="text-right">{item.name}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  لا توجد نتائج 🔍
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Commissions Tab ─────────────────────────────────────────────────────────

function CommissionsTab() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const currentDate = new Date();
  const [month, setMonth] = useState<string>(
    String(currentDate.getMonth() + 1)
  );
  const [year, setYear] = useState<string>(String(currentDate.getFullYear()));

  useEffect(() => {
    fetchData();
  }, [month, year]);

  async function fetchData() {
     try {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;

    const res = await axios.get(`${BASE_URL}/commissions`, {
      params,
    });

    setCommissions(res.data);
    setFiltered(res.data);
  } catch (error) {
    console.error(error);
  }
  }

  const handleSearch = (value: string) => {
    setSearch(value);
    setFiltered(
      !value
        ? commissions
        : commissions.filter((c) =>
            c.name?.toLowerCase().includes(value.toLowerCase())
          )
    );
  };

  const months = [
    { value: "1", label: "يناير" },
    { value: "2", label: "فبراير" },
    { value: "3", label: "مارس" },
    { value: "4", label: "أبريل" },
    { value: "5", label: "مايو" },
    { value: "6", label: "يونيو" },
    { value: "7", label: "يوليو" },
    { value: "8", label: "أغسطس" },
    { value: "9", label: "سبتمبر" },
    { value: "10", label: "أكتوبر" },
    { value: "11", label: "نوفمبر" },
    { value: "12", label: "ديسمبر" },
  ];

  const years = Array.from({ length: 5 }, (_, i) =>
    String(currentDate.getFullYear() - i)
  );

  return (
    <div className="space-y-4">
      {/* Month & Year Filters */}
      <div className="flex gap-4">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <Input
        placeholder="🔍 ابحث باسم الموظف..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="text-right"
      />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right font-bold">العمولة</TableHead>
              <TableHead className="text-right font-bold">الموظف</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <TableRow key={item._id ?? idx}>
                 
                  <TableCell className="text-right font-medium">
                    {item.totalAmount.toLocaleString("ar-EG")} ج.م
                  </TableCell>
                  <TableCell className="text-right">
                    {item.name ?? item.userId.name}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  لا توجد نتائج 🔍
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalaryPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            🧾 الرواتب والعمولات
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="salaries">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="salaries" className="flex-1">
                💰 الرواتب
              </TabsTrigger>
              <TabsTrigger value="commissions" className="flex-1">
                📈 العمولات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="salaries">
              <SalariesTab />
            </TabsContent>

            <TabsContent value="commissions">
              <CommissionsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}