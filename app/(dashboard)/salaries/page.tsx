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
import { BASE_URL } from "@/lib/constants";

export default function SalaryPage() {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await axios.get(`${BASE_URL}/salary`);
      setSalaries(res.data);
      setFiltered(res.data);
    } catch (error) {
      console.error(error);
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value);

    if (!value) {
      setFiltered(salaries);
      return;
    }

    setFiltered(
      salaries.filter((s) =>
        s.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            🧾 قائمة الرواتب الشهرية
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Input
            placeholder="🔍 ابحث باسم الموظف..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="mb-4 text-right"
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right font-bold">الموظف</TableHead>
                  <TableHead className="text-right font-bold">نوع المرتب</TableHead>
                  <TableHead className="text-right font-bold">المرتب</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((item) => (
                    <TableRow key={item.employeeId}>
                      <TableCell className="text-right">{item.name}</TableCell>
                      <TableCell className="text-right">
                        {item.type === "fixed" ? "ثابت" : "متغير"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.salary.toLocaleString("ar-EG")} ج.م
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      لا توجد نتائج مطابقة 🔍
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
