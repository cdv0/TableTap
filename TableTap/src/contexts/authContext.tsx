import {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../supabaseClient";

interface Session {
  user: {
    id: string;
    email: string;
  };
  access_token: string;
  error: any;
}
interface AuthContextType {
  session: Session | null;
  signUpUser: ({ email, password }: { email: string, password: string }) => Promise<any>;
  SignInUser: (email: string, password: string) => Promise<any>;
  SignOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {

  const [session, setSession] = useState<Session | null>(null);

  // SIGN UP USER
  const signUpUser = async ( {email, password}: {email: string, password: string}) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw error;
    }
    return data;
  };

  // Sign IN USER
  const SignInUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    console.log(data);
    return data;
  };

  // SIGN OUT USER
  const SignOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session as Session | null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as Session | null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, signUpUser, SignInUser, SignOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
