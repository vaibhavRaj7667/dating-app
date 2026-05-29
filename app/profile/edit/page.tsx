"use client";

import PhotoUpload from "@/components/PhotoUpload";
import { useAuth } from "@/contexts/auth-context";
import { getCurrentUserProfile, updateUserProfile } from "@/lib/actions/profile";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ProfileEditPage = () => {
    const {user, loading: authLoading} = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState<boolean>(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        bio: "",
        gender: "male" as "male" | "female" | "other",
        birthDate: "",
        avatar_url: ""
    });

    useEffect(()=>{
        async function loadProfile(){
            try{
                const profileData = await getCurrentUserProfile(); 

                if(profileData){
                    setFormData({
                        full_name: profileData.full_name || "",
                        username: profileData.username || "",
                        bio: profileData.bio || "",
                        gender: profileData.gender || "",
                        birthDate: profileData.birthDate || "",
                        avatar_url: profileData.avatar_url || "",
                    });
                }
            } catch (err){
                setError("Failed to load profile");
            } finally{
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    async function handleFormSubmit(e: React.SubmitEvent){
        e.preventDefault();
        setSaving(true);
        setLoading(true);
        setError("");

        try {
            const {success, error} = await updateUserProfile(formData);

            if(success){
                router.push("/profile")
            } else {
                setError(error || "Failed to update profile.")
            }
        } catch (error) {
            setError("Failed to update profile.");
        } finally {
            setSaving(false); 
        }

    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const {name, value} = e.target;

        setFormData(prev => ({
            ...prev,
            [name] : value,
        }));
    }

  if(authLoading){
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

  return(
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Edit Profile
                </h1>

                <p className="text-gray-600 dark:text-gray-400">
                    Update your profile information
                </p>
            </header>

            <div className="max-w-2xl mx-auto">
                <form className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8" onSubmit={handleFormSubmit}>
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                            Profile Picture
                        </label>

                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden">
                                    <Image
                                    src={formData.avatar_url || (formData.gender == 'male' ? "/maleDefaultImage.jpg" : "/femaleDefaultImage.jpg")}
                                    width={24}
                                    height={24}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    unoptimized
                                    />
                                </div>

                                <PhotoUpload onPhotoUploaded={(url) => 
                                    setFormData(prev => ({
                                        ...prev,
                                        avatar_url: url
                                    }))
                                }/>
                            </div>

                            <div>
                                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Upload a new profile picture
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    JPG, PNG or GIF. Max 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Basic info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label
                            htmlFor="full_name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Full Name *
                            </label>

                             <input type="text" id="full_name" name="full_name" value={formData.full_name}onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Enter your full name"
                            />
                        </div>

                         <div>
                             <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Username *
                            </label>
                            <input type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Choose a username"
                            />
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label
                            htmlFor="gender"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                            Gender *
                            </label>
                            <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label
                            htmlFor="birthdate"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                            Birthday *
                            </label>
                            <input
                            type="date"
                            id="birthdate"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label
                            htmlFor="bio"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            About Me *
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            placeholder="Tell others about yourself..."
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formData.bio.length}/500 characters
                        </p>
                    </div>

                     {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default ProfileEditPage;