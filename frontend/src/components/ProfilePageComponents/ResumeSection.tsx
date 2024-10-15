import React, { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../../../lib/axios";
import toast from "react-hot-toast";
import AuthUser from "../../Interface/UserInterface";

interface ResumeSectionProps {
  userData: AuthUser;
  isOwnProfile: boolean;
  onSave: (updatedData: Partial<AuthUser>) => void;
}

const ResumeSection: React.FC<ResumeSectionProps> = ({
  userData,
  isOwnProfile,
  onSave,
}) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutate: uploadResume, isPending } = useMutation({
    mutationFn: async () => {
      if (!resumeFile) throw new Error("No resume file selected.");
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const response = await axiosInstance.put("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Resume uploaded successfully.");
      onSave({ resume: data.resume });
      setResumeFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the file input
      }
    },
    onError: (error) => {
      console.error("Error uploading resume:", error);
      toast.error("Failed to upload resume.");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed.");
        setResumeFile(null); // Clear file selection if invalid
        return;
      }
      if (file.size > 500 * 1024) {
        toast.error("File must be less than 500KB.");
        setResumeFile(null);
        return;
      }
      setResumeFile(file);
    } else {
      toast.error("No file selected.");
    }
  };

  const handleUpload = () => {
    if (!resumeFile) {
      toast("Please select a resume file to upload.", { icon: "⚠️" });
      return;
    }
    uploadResume();
  };

  if (!isOwnProfile) {
    return null; // Hide the resume section if viewing another user's profile
  }

  return (
    <div className="resume-section bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-semibold mb-4">Resume</h2>
      {userData.resume && (
        <div className="mb-4">
          <a
            href={userData.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Current Resume
          </a>
        </div>
      )}
      <div className="resume-upload">
        <form action="/upload" method="POST" encType="multipart/form-data">
          <input
            type="file"
            name="resume"
            onChange={handleFileChange}
            disabled={isPending}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            ref={fileInputRef} // Attach the ref
          />
        </form>
        <button
          onClick={handleUpload}
          disabled={isPending}
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isPending ? "Uploading..." : "Upload Resume"}
        </button>
      </div>
    </div>
  );
};

export default ResumeSection;
