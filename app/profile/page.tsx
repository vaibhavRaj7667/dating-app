"use client";

import { getCurrentUserProfile } from "@/lib/actions/profile";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  gender: "male" | "female" | "other";
  birthdate: string;
  bio: string;
  avatar_url: string;
  preferences: UserPreferences;
  location_lat?: number;
  location_lng?: number;
  last_active: string;
  is_verified: boolean;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  age_range: {
    min: number;
    max: number;
  };
  distance: number;
  gender_preference: ("male" | "female" | "other")[];
}


export default function ProfilePage() {
   const [profile, setProfile] = useState<UserProfile | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(()=>{
      async function loadProfile(){
         try {
            const profileData = await getCurrentUserProfile();
            console.log(profileData);
            
            if(profileData){
               setProfile(profileData);
            } else{
               setError("Failed to load Profile");
            }
         } catch (error) {
            console.error("Error loading profile: ", error);
            setError("Failed to load Profile");
         } finally{
            setLoading(false);
         }
      }

      loadProfile();
   }, []);

    if(loading){
    return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto">

            </div>

            <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading profile...
            </p>
        </div>
    </div>
    );
  }

   if(error || !profile){
      return(
         <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {error || "Profile not found"}
               </h1>
               <p className="text-gray-600 dark:text-gray-400">
                  Please try again later.
               </p>
            </div>
         </div>
      )
   }

   function calculateAge(birthdate: string){
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if(monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())){
      age--;
    }

    return age;
   }

   return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile and preferences
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden">
                      <Image
                        src={profile.avatar_url || "/anime-girl.jpg"}
                        alt={profile.full_name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {profile.full_name}, {calculateAge(profile.birthdate)}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      @{profile.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Member since{" "}
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      About Me
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {profile.bio || "No bio added yet."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Gender
                        </label>
                        <p className="text-gray-900 dark:text-white capitalize">
                          {profile.gender}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Birthday
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(profile.birthdate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Dating Preferences
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Age Range
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {profile.preferences.age_range.min} -{" "}
                          {profile.preferences.age_range.max} years
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Distance
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          Up to {profile.preferences.distance} km
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/profile/edit"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-900 dark:text-white">
                        Edit Profile
                      </span>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Account
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <span className="text-gray-900 dark:text-white">
                      Username
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      @{profile.username}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   ); 
}