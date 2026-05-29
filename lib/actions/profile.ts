"use server";
import { cookies } from "next/headers";

import { createClient } from "../supabase/server";
import { UserProfile } from "@/app/profile/page";

export async function getCurrentUserProfile() {
    const supabase = createClient(await cookies());
    const {data: {user}} = await supabase.auth.getUser();

    if(!user){
        return null;
    }

    const {data: profile, error} = await supabase.from("users").select("*").eq("id", user.id).single();

    if(error){
        console.error("Error fetching profile:", error);
        return null;
    }

    return profile;
}

export async function updateUserProfile (profileData : Partial<UserProfile>){
    const supabase = createClient(await cookies());
    const {data: {user}} = await supabase.auth.getUser();

    if(!user){
        return {success: false, error: "User not authenticated"};
    }

    const {error} = await supabase.from("users").update({
        full_name: profileData.full_name || "",
        username: profileData.username || "",
        bio: profileData.bio || "",
        gender: profileData.gender || "",
        birthDate: profileData.birthDate || "",
        avatar_url: profileData.avatar_url || "",
        updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    if(error){
        console.log("Error updating profile:", error);
        return {success: false, error: error.message};
    }

    return {success: true};
}

export async function uploadProfilePhoto(file: File){
    const supabase = createClient(await cookies());
    const {data: {user}} = await supabase.auth.getUser();

    if(!user){
        return {success: false, error: "User is not authenticated"};
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const {error} = await supabase.storage.from("profile-photos").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
    });

    if(error){
        return {success: false, error: error.message};
    }

    const {data: {publicUrl}} = supabase.storage.from("profile-photos").getPublicUrl(fileName);
    return {success: true, url: publicUrl}
}