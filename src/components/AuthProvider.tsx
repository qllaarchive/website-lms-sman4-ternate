"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      // Already signed in
    }
  }, [status]);

  return (
    <>
      {children}
      <button onClick={() => signIn("google")}>Login Google</button>
      <button onClick={() => signOut()}>Logout</button>
    </>
  );
}
