import { useState } from "react";

import { Briefcase, X } from "lucide-react";
import { formatDate } from "../../utils/dateUtils";
import AuthUser from "../../Interface/UserInterface";

interface Experience {
  userData: AuthUser;
  isOwnProfile: boolean;
  onSave: (data: Partial<AuthUser>) => void;
}
const ExperienceSection = ({ userData, isOwnProfile, onSave }: Experience) => {
  const [isEditing, setIsEditing] = useState(false);
  const [experience, setExperience] = useState(userData.experience || []);
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    currentlyWorking: false,
  });

  const handleAddExperience = () => {
    if (
      newExperience.title &&
      newExperience.company &&
      newExperience.startDate
    ) {
      setExperience([...experience, newExperience]);
      setNewExperience({
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
        currentlyWorking: false,
      });
    }
  };

  const handleDeleteExperience = (_id: string) => {
    setExperience(experience.filter((exp) => exp._id !== _id));
  };

  const handleSave = () => {
    onSave({ experience });
    setIsEditing(false);
  };

  const handleCurrentlyWorkingChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewExperience({
      ...newExperience,
      currentlyWorking: e.target.checked,
      endDate: e.target.checked ? "" : newExperience.endDate,
    });
  };
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Experience</h2>
      {experience.map((exp, index) => (
        <div key={index} className="mb-4 flex justify-between items-start">
          <div className="flex items-start">
            <Briefcase size={20} className="mr-2 mt-1" />
            <div>
              <h3 className="font-semibold">{exp.title}</h3>
              <p className="text-gray-600">{exp.company}</p>
              <p className="text-gray-500 text-sm">
                {formatDate(exp.startDate || "")} -{" "}
                {exp.currentlyWorking
                  ? "Present"
                  : formatDate(exp.endDate || "")}
              </p>
              <p className="text-gray-700">{exp.description}</p>
            </div>
          </div>
          {isEditing && exp._id && (
            <button
              onClick={() => handleDeleteExperience(exp._id!)}
              className="text-red-500"
            >
              <X size={20} />
            </button>
          )}
        </div>
      ))}

      {isEditing && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Title"
            value={newExperience.title}
            onChange={(e) =>
              setNewExperience({ ...newExperience, title: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            placeholder="Company"
            value={newExperience.company}
            onChange={(e) =>
              setNewExperience({ ...newExperience, company: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="date"
            placeholder="Start Date"
            value={newExperience.startDate}
            onChange={(e) =>
              setNewExperience({ ...newExperience, startDate: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
          />
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="currentlyWorking"
              checked={newExperience.currentlyWorking}
              onChange={handleCurrentlyWorkingChange}
              className="mr-2"
            />
            <label htmlFor="currentlyWorking">I currently work here</label>
          </div>
          {!newExperience.currentlyWorking && (
            <input
              type="date"
              placeholder="End Date"
              value={newExperience.endDate}
              onChange={(e) =>
                setNewExperience({ ...newExperience, endDate: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
          )}
          <textarea
            placeholder="Description"
            value={newExperience.description}
            onChange={(e) =>
              setNewExperience({
                ...newExperience,
                description: e.target.value,
              })
            }
            className="w-full p-2 border rounded mb-2"
          />
          <button
            onClick={handleAddExperience}
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
          >
            Add Experience
          </button>
        </div>
      )}

      {isOwnProfile && (
        <>
          {isEditing ? (
            <button
              onClick={handleSave}
              className="mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
            >
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 text-primary hover:text-primary-dark transition duration-300"
            >
              Edit Experiences
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ExperienceSection;
