"use client"
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export function useCurrentUser() {
  const [role, setRole] = useState<string | null>(null);
  const [empId,setEmpId] = useState<string | null>(null);
  useEffect(() => {
    const user = Cookies.get("user");
    if (user) {
      setRole(JSON.parse(user).role);
      setEmpId(JSON.parse(user).empId)
    }
  }, []);

  return {role,empId};
}
