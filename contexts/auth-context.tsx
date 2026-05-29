"use client";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const supabase = createClient();

    useEffect(()=>{
    async function checkUser(){
        try {
            setLoading(true);

            //check for initial session
            const {data: {session}} = await supabase.auth.getSession();
            

            setUser(session?.user ?? null);

            console.log(session?.user);
            
            // this checks the user session after logged in, if the user signsOut after something happens or session is expired
            const {data: {subscription}} = supabase.auth.onAuthStateChange(async (event, session)=>{
                setUser(session?.user ?? null);
            });
            
            //this is helpfull because whenever we subscribe to anything on a react component inside a useeffect we need to make sure to clean that up, because if the component unmounts we dont want to keep the subscription active and cause any memory leaks
            return () => subscription.unsubscribe();
        } catch (error) {
            console.error(error);
        } finally{
            setLoading(false);
        }   
    }

    checkUser();
}, []);

async function signOut(){
    try{
       await supabase.auth.signOut();
    } catch (error){
        console.error("Error signing out: ",error);
    }
}

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = ()=>{
    const context = useContext(AuthContext);

    if(!context){
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}