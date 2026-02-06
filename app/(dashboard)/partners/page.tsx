"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";
import { BASE_URL } from "@/lib/constants";

interface Partner {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  _id: string;
  name: string;
}

interface PartnerProfit {
  _id: string;
  partner: Partner | string;
  activity: Activity | string;
  date: string;
  profit: number;
  createdAt: string;
}

export default function PartnersManagementPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profits, setProfits] = useState<PartnerProfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [profitDialogOpen, setProfitDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedProfit, setSelectedProfit] = useState<PartnerProfit | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "partner" | "profit";
    id: string;
    name: string;
  } | null>(null);

  const [partnerForm, setPartnerForm] = useState({ name: "" });
  const [profitForm, setProfitForm] = useState({
    partner: "",
    activity: "",
    profit: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: "success", message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [partnersRes, profitsRes, activitiesRes] = await Promise.all([
        fetch(`${BASE_URL}/partners`),
        fetch(`${BASE_URL}/partners/profits/all`),
        fetch(`${BASE_URL}/activities`),
      ]);

      const partnersData = await partnersRes.json();
      const profitsData = await profitsRes.json();
      const activitiesData = await activitiesRes.json();

      setPartners(partnersData);
      setProfits(profitsData);
      setActivities(activitiesData);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "فشل في تحميل البيانات",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartner = async () => {
    try {
      const res = await fetch(`${BASE_URL}/partners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partnerForm),
      });

      if (res.ok) {
        setNotification({
          show: true,
          type: "success",
          message: "تم إنشاء الشريك بنجاح",
        });
        setPartnerDialogOpen(false);
        setPartnerForm({ name: "" });
        fetchData();
      }
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "فشل في إنشاء الشريك",
      });
    }
  };

  const handleUpdatePartner = async () => {
    if (!selectedPartner) return;

    try {
      const res = await fetch(`${BASE_URL}/partners/${selectedPartner._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partnerForm),
      });

      if (res.ok) {
        setNotification({
          show: true,
          type: "success",
          message: "تم تحديث الشريك بنجاح",
        });
        setPartnerDialogOpen(false);
        setSelectedPartner(null);
        setPartnerForm({ name: "" });
        fetchData();
      }
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "فشل في تحديث الشريك",
      });
    }
  };

  const handleCreateProfit = async () => {
    try {
      const res = await fetch(`${BASE_URL}/partners/profits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profitForm,
          profit: parseFloat(profitForm.profit),
        }),
      });

      if (res.ok) {
        setNotification({
          show: true,
          type: "success",
          message: "تم إضافة الربح بنجاح",
        });
        setProfitDialogOpen(false);
        setProfitForm({
          partner: "",
          activity: "",
          profit: "",
          date: new Date().toISOString().split("T")[0],
        });
        fetchData();
      }
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "فشل في إضافة الربح",
      });
    }
  };

  const handleUpdateProfit = async () => {
    if (!selectedProfit) return;

    try {
      const res = await fetch(
        `${BASE_URL}/partners/profits/${selectedProfit._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...profitForm,
            profit: parseFloat(profitForm.profit),
          }),
        }
      );

      if (res.ok) {
        setNotification({
          show: true,
          type: "success",
          message: "تم تحديث الربح بنجاح",
        });
        setProfitDialogOpen(false);
        setSelectedProfit(null);
        setProfitForm({
          partner: "",
          activity: "",
          profit: "",
          date: new Date().toISOString().split("T")[0],
        });
        fetchData();
      }
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "فشل في تحديث الربح",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const url =
        deleteTarget.type === "partner"
          ? `${BASE_URL}/partners/${deleteTarget.id}`
          : `${BASE_URL}/partners/profits/${deleteTarget.id}`;

      const res = await fetch(url, { method: "DELETE" });

      if (res.ok) {
        setNotification({
          show: true,
          type: "success",
          message: `تم حذف ${deleteTarget.type === "partner" ? "الشريك" : "الربح"} بنجاح`,
        });
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
        fetchData();
      }
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "فشل في الحذف",
      });
    }
  };

  const openPartnerDialog = (partner?: Partner) => {
    if (partner) {
      setSelectedPartner(partner);
      setPartnerForm({ name: partner.name });
    } else {
      setSelectedPartner(null);
      setPartnerForm({ name: "" });
    }
    setPartnerDialogOpen(true);
  };

  const openProfitDialog = (profit?: PartnerProfit) => {
    if (profit) {
      setSelectedProfit(profit);
      setProfitForm({
        partner:
          typeof profit.partner === "string"
            ? profit.partner
            : profit.partner._id,
        activity:
          typeof profit.activity === "string"
            ? profit.activity
            : profit.activity?._id || "",
        profit: profit.profit.toString(),
        date: new Date(profit.date).toISOString().split("T")[0],
      });
    } else {
      setSelectedProfit(null);
      setProfitForm({
        partner: "",
        activity: "",
        profit: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
    setProfitDialogOpen(true);
  };

  const openDeleteDialog = (
    type: "partner" | "profit",
    id: string,
    name: string
  ) => {
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const getTotalProfit = (partnerId: string) => {
    return profits
      .filter(
        (p) =>
          (typeof p.partner === "string" ? p.partner : p.partner._id) ===
          partnerId
      )
      .reduce((sum, p) => sum + p.profit, 0);
  };

  const getPartnerName = (partnerId: string | Partner) => {
    if (typeof partnerId === "object") return partnerId.name;
    const partner = partners.find((p) => p._id === partnerId);
    return partner?.name || "غير معروف";
  };

  const getActivityName = (activityId: string | Activity) => {
    if (typeof activityId === "object") return activityId.name;
    const activity = activities.find((a) => a._id === activityId);
    return activity?.name || "غير محدد";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      {notification.show && (
        <div
          className={`fixed top-4 left-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <p>{notification.message}</p>
            <button
              onClick={() =>
                setNotification({ show: false, type: "success", message: "" })
              }
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">إدارة الشركاء</h1>
        <p className="text-muted-foreground">إدارة الشركاء وتتبع أرباحهم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي الشركاء
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profits.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي الارباح
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profits.reduce((sum, p) => sum + p.profit, 0).toFixed(2)} ج.م
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="partners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="partners">الشركاء</TabsTrigger>
          <TabsTrigger value="profits">الأرباح</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">الشركاء</h2>
            <Button onClick={() => openPartnerDialog()}>
              <Plus className="ml-2 h-4 w-4" /> إضافة شريك
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الإجراءات</TableHead>
                    <TableHead className="text-right">إجمالي الربح</TableHead>
                  
                    <TableHead className="text-right">الاسم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner._id}>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openPartnerDialog(partner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            openDeleteDialog("partner", partner._id, partner.name)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          {getTotalProfit(partner._id).toFixed(2)} ج.م
                        </Badge>
                      </TableCell>
                     
                       <TableCell className="font-medium text-right">
                        {partner.name}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profits" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">الأرباح</h2>
            <Button onClick={() => openProfitDialog()}>
              <Plus className="ml-2 h-4 w-4" /> إضافة ربح
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الإجراءات</TableHead>
                    <TableHead className="text-right">الربح</TableHead>
                    <TableHead className="text-right">النشاط</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الشريك</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profits.map((profit) => (
                    <TableRow key={profit._id}>
                      
                     
                     
                     
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openProfitDialog(profit)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            openDeleteDialog(
                              "profit",
                              profit._id,
                              `${getPartnerName(profit.partner)} - ${profit.profit.toFixed(2)} ج.م`
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                       <TableCell className="text-right">
                        <Badge
                          variant={profit.profit > 0 ? "default" : "destructive"}
                        >
                          {profit.profit.toFixed(2)} ج.م
                        </Badge>
                      </TableCell>
                       <TableCell className="text-right"> 
                        <Badge variant="outline">
                          {getActivityName(profit.activity)}
                        </Badge>
                      </TableCell>
                       <TableCell className="text-right">
                        {new Date(profit.date).toLocaleDateString("ar-EG")}
                      </TableCell>
                      <TableCell className="font-medium text-right">
                        {getPartnerName(profit.partner)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPartner ? "تعديل شريك" : "إضافة شريك"}
            </DialogTitle>
            <DialogDescription>
              {selectedPartner ? "تحديث معلومات الشريك" : "إنشاء شريك جديد"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                value={partnerForm.name}
                onChange={(e) =>
                  setPartnerForm({ ...partnerForm, name: e.target.value })
                }
                placeholder="اسم الشريك"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPartnerDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={
                selectedPartner ? handleUpdatePartner : handleCreatePartner
              }
            >
              {selectedPartner ? "تحديث" : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={profitDialogOpen} onOpenChange={setProfitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProfit ? "تعديل ربح" : "إضافة ربح"}
            </DialogTitle>
            <DialogDescription>
              {selectedProfit
                ? "تحديث معلومات الربح"
                : "إضافة سجل ربح جديد"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="partner">الشريك *</Label>
              <select
                id="partner"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={profitForm.partner}
                onChange={(e) =>
                  setProfitForm({ ...profitForm, partner: e.target.value })
                }
                required
              >
                <option value="">اختر شريك</option>
                {partners.map((partner) => (
                  <option key={partner._id} value={partner._id}>
                    {partner.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="activity">النشاط *</Label>
              <select
                id="activity"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={profitForm.activity}
                onChange={(e) =>
                  setProfitForm({ ...profitForm, activity: e.target.value })
                }
                required
              >
                <option value="">اختر النشاط</option>
                {activities.map((activity) => (
                  <option key={activity._id} value={activity._id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profit">مبلغ الربح *</Label>
              <Input
                id="profit"
                type="number"
                step="0.01"
                value={profitForm.profit}
                onChange={(e) =>
                  setProfitForm({ ...profitForm, profit: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">التاريخ *</Label>
              <Input
                id="date"
                type="date"
                value={profitForm.date}
                onChange={(e) =>
                  setProfitForm({ ...profitForm, date: e.target.value })
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProfitDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={selectedProfit ? handleUpdateProfit : handleCreateProfit}
            >
              {selectedProfit ? "تحديث" : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>هل أنت متأكد؟</DialogTitle>
            <DialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف{" "}
              <strong>{deleteTarget?.name}</strong>
              {deleteTarget?.type === "partner" &&
                " وجميع سجلات الأرباح المرتبطة به"}
              {" "}
              نهائياً.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}