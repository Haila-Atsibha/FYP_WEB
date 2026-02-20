"use client";

import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, roles }) {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    } else if (roles && !roles.includes(user.role)) {
      // unauthorized
      router.push("/");
    }
  }, [user]);

  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;
  return children;
}
