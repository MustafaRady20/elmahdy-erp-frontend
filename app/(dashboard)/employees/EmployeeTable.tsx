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
import EditEmployeeForm from "./EditEmployeeForm";

type Employee = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  type: "fixed" | "variable";
  fixedSalary?: number;
};

interface EmployeesTableProps {
  employees: Employee[];
  onRefresh: () => void;
}

export default function EmployeesTable({ employees, onRefresh }: EmployeesTableProps) {
  const [search, setSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    setFilteredEmployees(
      employees.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, employees]);

  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^0-9]/g, ""); // remove '+' and spaces
  };

  return (
    <div>
      <Input
        placeholder="ابحث عن موظف..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-1/3"
      />

      <Table className="min-w-full border">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-[15%]">الاسم</TableHead>
            <TableHead className="text-center w-[15%]">رقم الهاتف</TableHead>
            <TableHead className="text-center w-[20%]">البريد الإلكتروني</TableHead>
            <TableHead className="text-center w-[10%]">الدور</TableHead>
            <TableHead className="text-center w-[10%]">نوع الراتب</TableHead>
            <TableHead className="text-center w-[15%]">الراتب الثابت</TableHead>
            <TableHead className="text-center w-[15%]">تعديل</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredEmployees.map((employee) => (
            <TableRow key={employee._id}>
              <TableCell className="text-center truncate">{employee.name}</TableCell>

              {/* WhatsApp click */}
              <TableCell className="text-center truncate">
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(employee.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {employee.phone}
                </a>
              </TableCell>

              <TableCell className="text-center truncate">
                {employee.email || "-"}
              </TableCell>

              <TableCell className="text-center truncate">
                {employee.role === "employee"
                  ? "موظف"
                  : employee.role === "manager"
                  ? "مدير"
                  : "مشرف"}
              </TableCell>

              <TableCell className="text-center truncate">
                {employee.type === "fixed" ? "ثابت" : "متغير"}
              </TableCell>

              <TableCell className="text-center truncate">
                {employee.fixedSalary || "-"}
              </TableCell>

              <TableCell className="text-center">
                <EditEmployeeForm employee={employee} onUpdated={onRefresh} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
