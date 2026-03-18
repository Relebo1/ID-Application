"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type StaffUser = {
  id: string; name: string; email: string;
  role: "officer" | "supervisor" | "admin" | "support";
  district: string;
};

export function useStaffAuth(requiredRole?: StaffUser["role"] | StaffUser["role"][]) {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("staff");
    if (!stored) { router.push("/staff/login"); return; }
    const user: StaffUser = JSON.parse(stored);
    if (requiredRole) {
      const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!allowed.includes(user.role)) { router.push("/staff/login"); return; }
    }
    setStaff(user);
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    localStorage.removeItem("staff");
    router.push("/staff/login");
  };

  return { staff, ready, logout };
}
