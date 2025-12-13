"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "react-select";
import { BASE_URL } from "@/lib/constants";

interface EmployeeRevenue {
  _id: string;
  total: number;
  employee: {
    _id: string;
    name: string;
  };
}

interface EmployeeRevenueDetail {
  _id: string;
  activity: { _id: string; name: string };
  amount: number;
  date: string;
}

interface Employee {
  _id: string;
  name: string;
}

interface Activity {
  _id: string;
  name: string;
}

export default function RevenuePage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [data, setData] = useState<EmployeeRevenue[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRevenue | null>(null);
  const [details, setDetails] = useState<EmployeeRevenueDetail[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;
  const [loadingDetails, setLoadingDetails] = useState(false);

  // For new revenue popup
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newEmployee, setNewEmployee] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const darkSelectStyles = {
    control: (styles: any) => ({
      ...styles,
      backgroundColor: "#1f2937",
      color: "white",
    }),
    menu: (styles: any) => ({
      ...styles,
      backgroundColor: "#1f2937",
      color: "white",
    }),
    singleValue: (styles: any) => ({
      ...styles,
      color: "white",
    }),
    option: (styles: any, { isSelected, isFocused }: any) => ({
      ...styles,
      backgroundColor: isSelected
        ? "#2563eb"
        : isFocused
        ? "#374151"
        : "#1f2937",
      color: "white",
    }),
    input: (styles: any) => ({
      ...styles,
      color: "white",
    }),
    placeholder: (styles: any) => ({
      ...styles,
      color: "#9ca3af",
    }),
  };

  // fetch main employee revenue
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/emp-revenue/report?period=${period}`);
      setData(res.data.revenueByEmployee || []);
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (employeeId: string, pageNum: number) => {
    setLoadingDetails(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/emp-revenue/employee/${employeeId}?page=${pageNum}&limit=${limit}`
      );
      setDetails(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("خطأ في جلب التفاصيل:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchEmployeesAndActivities = async () => {
    try {
      const [empRes, actRes] = await Promise.all([
        axios.get(`${BASE_URL}/employees`),
        axios.get(`${BASE_URL}/activities`),
      ]);
      setEmployees(empRes.data || []);
      setActivities(actRes.data || []);
    } catch (error) {
      console.error("خطأ في جلب الموظفين أو الأنشطة:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchEmployeesAndActivities();
  }, [period]);

  const openEmployeeDetails = (emp: EmployeeRevenue) => {
    setSelectedEmployee(emp);
    setPage(1);
    fetchDetails(emp.employee._id, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (!selectedEmployee) return;
    setPage(newPage);
    fetchDetails(selectedEmployee.employee._id, newPage);
  };

  const handleSaveNewRevenue = async () => {
    if (!newEmployee || !newActivity || !newAmount) return;
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/emp-revenue`, {
        employee: newEmployee,
        activity: newActivity,
        amount: newAmount,
      });
      setNewEmployee(null);
      setNewActivity(null);
      setNewAmount(0);
      fetchData(); // refresh main table
      alert("تم إضافة الإيراد بنجاح");
    } catch (error) {
      console.error("خطأ في حفظ الإيراد:", error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        {/* اختيار الفترة */}
        <div className="flex items-center gap-4">
          <span>اختر الفترة:</span>
          <Select
            options={[
              { value: "daily", label: "يومي" },
              { value: "weekly", label: "أسبوعي" },
              { value: "monthly", label: "شهري" },
              { value: "yearly", label: "سنوي" },
            ]}
            value={{ value: period, label: period }}
            onChange={(val: any) => setPeriod(val.value)}
            styles={darkSelectStyles}
          />
        </div>

        {/* زر إضافة إيراد جديد */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>إضافة إيراد جديد</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة إيراد جديد</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-4">
              {/* Employee Select */}
              <Select
                options={employees.map((e) => ({ value: e._id, label: e.name }))}
                value={newEmployee ? { value: newEmployee, label: employees.find((e) => e._id === newEmployee)?.name } : null}
                onChange={(val: any) => setNewEmployee(val.value)}
                placeholder="اختر الموظف"
                styles={darkSelectStyles}
                isSearchable
              />

              {/* Activity Select */}
              <Select
                options={activities.map((a) => ({ value: a._id, label: a.name }))}
                value={newActivity ? { value: newActivity, label: activities.find((a) => a._id === newActivity)?.name } : null}
                onChange={(val: any) => setNewActivity(val.value)}
                placeholder="اختر النشاط"
                styles={darkSelectStyles}
                isSearchable
              />

              <Input
                type="number"
                placeholder="المبلغ"
                value={newAmount}
                onChange={(e) => setNewAmount(Number(e.target.value))}
              />

              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">إلغاء</Button>
                </DialogClose>
                <Button onClick={handleSaveNewRevenue} disabled={saving}>
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* جدول الموظفين */}
      <div className="overflow-x-auto">
        <Table className="table-auto text-center">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">الموظف</TableHead>
              <TableHead className="text-center">إجمالي الإيرادات</TableHead>
              <TableHead className="text-center">الإجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  لا توجد بيانات
                </TableCell>
              </TableRow>
            ) : (
              data.map((emp) => (
                <TableRow key={emp._id}>
                  <TableCell>{emp.employee.name}</TableCell>
                  <TableCell>{emp.total}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => openEmployeeDetails(emp)}>
                          عرض التفاصيل
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>
                            تفاصيل الإيرادات - {emp.employee.name}
                          </DialogTitle>
                        </DialogHeader>

                        {loadingDetails ? (
                          <p className="text-center mt-4">جاري التحميل...</p>
                        ) : details.length === 0 ? (
                          <p className="text-center mt-4">لا توجد تفاصيل</p>
                        ) : (
                          <>
                            <div className="overflow-x-auto">
                              <Table className="table-auto text-center">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-center">التاريخ</TableHead>
                                    <TableHead className="text-center">النشاط</TableHead>
                                    <TableHead className="text-center">المبلغ</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {details.map((d) => (
                                    <TableRow key={d._id}>
                                      <TableCell>
                                        {new Date(d.date).toLocaleDateString("ar-EG")}
                                      </TableCell>
                                      <TableCell>{d.activity.name}</TableCell>
                                      <TableCell>{d.amount}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-center gap-2 mt-4">
                              <Button
                                disabled={page === 1}
                                onClick={() => handlePageChange(page - 1)}
                              >
                                السابق
                              </Button>
                              <span>
                                الصفحة {page} من {totalPages}
                              </span>
                              <Button
                                disabled={page === totalPages}
                                onClick={() => handlePageChange(page + 1)}
                              >
                                التالي
                              </Button>
                            </div>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
