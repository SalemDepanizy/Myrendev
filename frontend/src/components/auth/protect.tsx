import React, { useEffect, useMemo } from "react";
import { Navigate } from 'react-router-dom';
import { fetcher } from "../../axios";
import useSWR from "swr";
import { Loader } from "lucide-react";
import { tokenAtom } from "../../lib/atoms/auth";
import { useAuth } from "../../lib/hooks/auth";
const Spinner = () => {
  return <Loader className="spin" />;
};

export interface User {
  id: string;
  name: string;
  name_entreprise?: string;
  name_manager?: string; 
  lastname: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  heure: number | null;
  heuresup: number | null;
  image?: string;
  type: "STUDENTS" | "MONITOR" | "ADMIN" |"COMMERCIAL" |"ENTREPRISE";
  forfaitId: string | null;
}
export function RequireAuth({
  children,
  redirect = "/login",
}: {
  children: React.ReactNode;
  redirect?: string;
}) {
  // console.log("render");
  const { data, error, isLoading } = useSWR("token", async () => {
    const token = tokenAtom.snapshot();
    // console.log(token);
    if (!token) throw Error("Token Invalide");
    const tokenData = (
      await fetcher.post(`/auth/verify`, {
        token,
      })
    ).data as {
      data: { user: User };
    };
    return tokenData;
  });
  
  // console.log(data, error, isLoading);
  useEffect(() => {
    if (isLoading) return;
    if (error || !data) {
      if (!redirect) return;
      window.location.href = redirect;
    }
  }, [error, isLoading, data]);
  if (isLoading) return <></>;
  if (error) return <></>;
  if (!data) {
    return <Navigate to={redirect}></Navigate>
  }
  return <>{children}</>;
}
export function RequireNonAuth({
  children,
  redirect = "/",
}: {
  children: React.ReactNode;
  redirect?: string;
}) {
  const { data, error, isLoading } = useSWR("token", async () => {
    const token = tokenAtom.snapshot();
    if (!token) throw Error("Token Invalide");
    const tokenData = (
      await fetcher.post(`/auth/verify`, {
        token,
      })
    ).data as {
      data: User;
    };
    return tokenData;
  });

  const memo = useMemo(() => {
    return children;
  }, []);

  if (isLoading) return <></>;
  if (error) return <>{memo}</>;
  if (!data) {
    return <>{memo}</>;
  }
  window.location.href = redirect;
  return <Navigate to={redirect}></Navigate>
}
export function RequireRole({
  children,
  role,
  redirect = "/",
}: {
  children: React.ReactNode;
  role: User["type"];
  redirect?: string;
}) {
const {user, isLoading} = useAuth();
if(isLoading) return <Spinner/>
if(!user){
  return <Navigate to={redirect}></Navigate>
}
if(user.type !== role ) return <Navigate to={redirect}></Navigate>

return <>{children}</>
}
