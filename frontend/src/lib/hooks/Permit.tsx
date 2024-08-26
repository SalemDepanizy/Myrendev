import React from "react";
import { User } from "src/components/auth/protect";
import { useAuth } from "./auth";

function Permit({
  children,
  roles,
}: {
  children?: React.ReactNode;
  roles: User["type"][];
}) {
  const { user, isLoading, error } = useAuth();

  if (isLoading) return <>...loading</>;
  if (error) return <>...error</>;
  if (!user) return <>...loading</>;
  if (!roles || roles.length === 0) return <>{children}</>;
  if (!roles.includes(user.type)) return <></>;
  return <>{children}</>;
}

export default Permit;
