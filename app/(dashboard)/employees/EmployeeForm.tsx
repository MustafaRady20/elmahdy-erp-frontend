"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";

interface AddEmployeeFormProps {
  onAdded: () => void;
}

export default function AddEmployeeForm({ onAdded }: AddEmployeeFormProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "employee",
    type: "fixed" as "fixed" | "variable",
    fixedSalary: 0,
    birthdate: "",
    nationalId: "",
    address: "",
    status: "active",
    permitStartDate: "",
    permitEndDate: "",
  });

  const [images, setImages] = useState<{
    profileImage?: File;
    nationalIdImage?: File;
    militaryServiceCertificateImage?: File;
    permitImage?: File;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
          data.append(key, value as string);
      });

      Object.entries(images).forEach(([key, file]) => {
        if (file) data.append(key, file);
      });

      await axios.post(`${BASE_URL}/employees`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOpen(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        role: "employee",
        type: "fixed",
        fixedSalary: 0,
        birthdate: "",
        nationalId: "",
        address: "",
        status: "active",
        permitStartDate: "",
        permitEndDate: "",
      });
      setImages({});
      onAdded();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          إضافة موظف
        </Button>
      </DialogTrigger>
      <DialogContent
        className="
    max-w-3xl w-[95vw]
    max-h-[90vh]
    overflow-y-auto
    p-4
  "
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            إضافة موظف جديد
          </DialogTitle>
        </DialogHeader>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
          onSubmit={handleSubmit}
        >
          {/* Basic Info */}
          <div className="flex flex-col">
            <Label>الاسم</Label>
            <Input
              placeholder="أدخل الاسم"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col">
            <Label>رقم الهاتف</Label>
            <Input
              placeholder="أدخل رقم الهاتف"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col">
            <Label>البريد الإلكتروني</Label>
            <Input
              placeholder="أدخل البريد الإلكتروني"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col">
            <Label>تاريخ الميلاد</Label>
            <Input
              type="date"
              value={formData.birthdate}
              onChange={(e) =>
                setFormData({ ...formData, birthdate: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col">
            <Label>الرقم القومي</Label>
            <Input
              placeholder="أدخل الرقم القومي"
              value={formData.nationalId}
              onChange={(e) =>
                setFormData({ ...formData, nationalId: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col">
            <Label>العنوان</Label>
            <Input
              placeholder="أدخل العنوان"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          {/* Role and Salary */}
          <div className="flex flex-col">
            <Label>الدور الوظيفي</Label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="p-2 border rounded-md"
            >
              <option value="employee">موظف</option>
              <option value="manager">مدير</option>
              <option value="supervisor">مشرف</option>
            </select>
          </div>

          <div className="flex flex-col">
            <Label>نوع الراتب</Label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "fixed" | "variable",
                })
              }
              className="p-2 border rounded-md"
            >
              <option value="fixed">ثابت</option>
              <option value="variable">متغير</option>
            </select>
          </div>

          {formData.type === "fixed" && (
            <div className="flex flex-col">
              <Label>الراتب الثابت</Label>
              <Input
                type="number"
                placeholder="أدخل الراتب الثابت"
                value={formData.fixedSalary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fixedSalary: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          )}

          <div className="flex flex-col">
            <Label>الحالة</Label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="p-2 border rounded-md"
            >
              <option value="active">نشط</option>
              <option value="inActive">غير نشط</option>
            </select>
          </div>

          {/* File Uploads */}
          {[
            { label: "الصورة الشخصية", key: "profileImage" },
            { label: "صورة الرقم القومي", key: "nationalIdImage" },
            {
              label: "صورة شهادة الخدمة العسكرية",
              key: "militaryServiceCertificateImage",
            },
            { label: "تصريح العمل - الصورة", key: "permitImage" },
          ].map(({ label, key }) => (
            <div key={key} className="flex flex-col">
              <Label>{label}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImages({ ...images, [key]: e.target.files?.[0] })
                }
              />
            </div>
          ))}

          {/* Permit Dates */}
          <div className="flex flex-col">
            <Label>تصريح العمل - تاريخ البداية</Label>
            <Input
              type="date"
              value={formData.permitStartDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, permitStartDate: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col">
            <Label>تصريح العمل - تاريخ النهاية</Label>
            <Input
              type="date"
              value={formData.permitEndDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, permitEndDate: e.target.value })
              }
            />
          </div>

          {/* Submit */}
          <div className="col-span-1 md:col-span-2">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
