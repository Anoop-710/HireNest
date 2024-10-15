import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

import ProfileHeader from "../components/ProfilePageComponents/ProfileHeader";
import AboutSection from "../components/ProfilePageComponents/AboutSection";
import ExperienceSection from "../components/ProfilePageComponents/ExperienceSection";
import EducationSection from "../components/ProfilePageComponents/EducationSection";
import SkillsSection from "../components/ProfilePageComponents/SkillsSection";
import AuthUser from "../Interface/UserInterface";
import ResumeSection from "../components/ProfilePageComponents/ResumeSection";

const ProfilePage = () => {
  const { username } = useParams();
  const queryClient = useQueryClient();

  const { data: authUser, isLoading } = useQuery<AuthUser>({
    queryKey: ["authUser"],
  });

  const {
    data: userProfile,
    isLoading: isUserProfileLoading,
    error: userProfileError,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => await axiosInstance.get(`/users/${username}`),
  });

  if (userProfileError) {
    console.error("Error fetching user profile:", userProfileError);
  }

  const { mutate: updateProfile } = useMutation({
    mutationFn: async (updatedData: Partial<AuthUser>) => {
      await axiosInstance.put("/users/profile", updatedData);
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries(["userProfile", username] as never);
    },
  });

  if (isLoading || isUserProfileLoading) {
    return <div>Loading...</div>;
  }

  const isOwnProfile = authUser?.username === userProfile?.data.username;
  const userData = isOwnProfile ? authUser : userProfile?.data;

  const handleSave = (updatedData: Partial<AuthUser>) => {
    updateProfile(updatedData);
  };
  return (
    <div className="max-w-4xl mx-auto p-4">
      <ProfileHeader
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <AboutSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <ExperienceSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <EducationSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <SkillsSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />

      <ResumeSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProfilePage;
