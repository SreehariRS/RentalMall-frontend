import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Add useRouter
import { loginAdmin } from "../../services/adminApi";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    setIsAuthenticated(!!accessToken);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginAdmin(email, password);
    if (!result.error) {
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    router.push("/admin");
    router.refresh(); 
  };

  return { isAuthenticated, loading, login, logout };
};