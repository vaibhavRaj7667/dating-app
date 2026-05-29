"use client";

import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const supabase = createClient();
  const router = useRouter();
  const {user, loading: authLoading = false} = useAuth();
  

  type AuthFormData = {
  email: string
  password: string
}

// Redirect to home if user is already logged in
  useEffect(() => {
    if(user && !authLoading){
      router.push("/");
    }
  }, [user, authLoading]);


  // Handle form submission for both sign up and sign in
    const handleAuth = async (data:AuthFormData)=>{
        const {email, password} = data;
        // console.log(data);

        setLoading(true);
        setError("");

        try{
            if(isSignUp){
                const {data, error} = await supabase.auth.signUp({
                    email,
                    password
                })

                if(error) throw error;
                if (data.user && !data.session) {
                    setError("Please check your email for a confirmation link");
                    return;
                }
            } else{
                const {error} = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                 if(error) throw error;
            }
          }catch (error) {
              if (error instanceof Error) {
                setError(error.message);
              } else {
                setError("Something went wrong");
              }
            }finally{
            setLoading(false);
        }
    }

    const {register, formState:{errors}, handleSubmit} = useForm({
        defaultValues: {
            email: "",
            password: ""
        }
    });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Hive The Dating Zone
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isSignUp ? "Create Your Account" : "Sign in to your account"}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(handleAuth)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input id="email"
               {...register("email", {
                required: "Email is required",
                pattern: {value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Invalid email address"}
              })} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {value: 8, message: "Password must have atleast 8 characters"}
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          {error && 
               <div className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            }

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-pink-600 dark:text-pink-400 hover:text-pink-500 dark:hover:text-pink-300 text-sm cursor-pointer"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </div>
    </div>
  );
}