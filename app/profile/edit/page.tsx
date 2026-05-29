const ProfileEditPage = () => {
  if(false){
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
                
            </div>
        </div>
    </div>
  );
};

export default ProfileEditPage;