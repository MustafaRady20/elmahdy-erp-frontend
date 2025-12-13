"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
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

export default function EditEmployeeForm({
  employee,
  onUpdated,
}: {
  employee: Employee;
  onUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Employee>(employee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch(`${BASE_URL}/employees/${employee._id}`, formData);
      setOpen(false);
      onUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">تعديل</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الموظف</DialogTitle>
        </DialogHeader>

        <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
          <div>
            <Label>الاسم</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label>رقم الهاتف</Label>
            <Input
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <Label>البريد الإلكتروني</Label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label>الدور الوظيفي</Label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="employee">موظف</option>
              <option value="manager">مدير</option>
              <option value="supervisor">مشرف</option>
            </select>
          </div>

          <div>
            <Label>نوع الراتب</Label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as "fixed" | "variable" })
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="fixed">ثابت</option>
              <option value="variable">متغير</option>
            </select>
          </div>

          {formData.type === "fixed" && (
            <div>
              <Label>الراتب الثابت</Label>
              <Input
                type="number"
                value={formData.fixedSalary || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fixedSalary: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          )}

          <Button type="submit">تحديث</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
