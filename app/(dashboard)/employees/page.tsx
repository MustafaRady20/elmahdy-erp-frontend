"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import AddEmployeeForm from "./EmployeeForm";
import EmployeesTable from "./EmployeeTable";
import { BASE_URL } from "@/lib/constants";

type Employee = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  type: "fixed" | "variable";
  fixedSalary?: number;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/employees`);
      setEmployees(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <AddEmployeeForm onAdded={fetchEmployees} />
      </div>

      <EmployeesTable employees={employees} onRefresh={fetchEmployees} />

    </div>
  );
}
