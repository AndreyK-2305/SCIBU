import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";

import { auth } from "@/lib/firebase";

export default function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [token, setToken] = useState<string>();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setToken(await currentUser?.getIdToken());
    });

    return () => unsubscribe();
  }, []);

  // Enhanced logout function that handles redirection
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      // Clear any auth-related state or localStorage items if needed

      // Redirect to login page
      navigate("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [navigate]);

  return { user, auth, token, logout };
}
