import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import Avatar from '../components/atoms/Avatar';
import { BadgeGallery } from '../components/organisms/BadgeGallery';
import { SkillEndorsements } from '../components/organisms/SkillEndorsements';
import { Leaderboard } from '../components/organisms/Leaderboard';
import { Edit2, Save, X, Plus, Trash2, Mail, MapPin, Briefcase } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <div className="p-8 text-center text-slate-400">Please log in to view your profile</div>;
  }

  return (
    <main className="space-y-6">
      <EnhancedProfileEditor userId={user._id} isEditing={isEditing} setIsEditing={setIsEditing} />
      
      {/* Badges & Endorsements */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700/50 p-6">
        <BadgeGallery userId={user._id} />
      </section>

      {/* Skill Endorsements */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700/50 p-6">
        <SkillEndorsements userId={user._id} skills={[]} isOwnProfile={true} />
      </section>

      {/* Leaderboard */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700/50 p-6">
        <Leaderboard />
      </section>
    </main>
  );
};

export default ProfilePage;

interface Experience {
  _id?: string;
  title: string;
  company: string;
  from: string;
  to?: string;
  description?: string;
}

interface Education {
  _id?: string;
  institution: string;
  degree: string;
  year: number;
}

const EnhancedProfileEditor = ({
  userId,
  isEditing,
  setIsEditing
}: {
  userId: string;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
}) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const response = await api.get('/users/me');
      return response.data;
    }
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setSkills(profile.skills || []);
      setExperience(profile.experience || []);
      setEducation(profile.education || []);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name,
        bio,
        skills,
        experience,
        education
      };

      if (profilePicFile) {
        const fd = new FormData();
        fd.append('file', profilePicFile);
        const uploadRes = await api.post('/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        payload.profilePicture = uploadRes.data.url;
      }

      if (resumeFile) {
        const fd = new FormData();
        fd.append('file', resumeFile);
        const uploadRes = await api.post('/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        payload.resumeUrl = uploadRes.data.url;
      }

      const response = await api.put('/users/me', payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', userId], data);
      setIsEditing(false);
      setResumeFile(null);
      setProfilePicFile(null);
    }
  });

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { title: '', company: '', from: new Date().toISOString().split('T')[0] }
    ]);
  };

  const handleRemoveExperience = (idx: number) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const handleUpdateExperience = (idx: number, field: string, value: string) => {
    const updated = [...experience];
    updated[idx] = { ...updated[idx], [field]: value };
    setExperience(updated);
  };

  const handleAddEducation = () => {
    setEducation([
      ...education,
      { institution: '', degree: '', year: new Date().getFullYear() }
    ]);
  };

  const handleRemoveEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const handleUpdateEducation = (idx: number, field: string, value: string | number) => {
    const updated = [...education];
    updated[idx] = { ...updated[idx], [field]: value };
    setEducation(updated);
  };

  if (isLoading) {
    return <div className="h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      {/* Hero Section with Profile Picture */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-slate-700/50 overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20" />
        
        <div className="relative px-6 pb-6">
          <div className="flex items-end gap-6 -mt-16 mb-6">
            <div className="relative flex-shrink-0">
              <Avatar src={profile?.profilePicture} alt={name} />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 p-2 rounded-full cursor-pointer text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePicFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-2xl font-bold bg-slate-700/50 text-white px-3 py-2 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              ) : (
                <h1 className="text-3xl font-bold text-white">{name}</h1>
              )}
              <p className="text-slate-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {profile?.role === 'alumni' ? 'Alumni' : 'Student'}
              </p>
            </div>

            <button
              onClick={() => (isEditing ? updateProfileMutation.mutate() : setIsEditing(true))}
              disabled={updateProfileMutation.isPending}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
          </div>

          {/* Bio Section */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-slate-300 mb-2 block">Bio</label>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                rows={3}
              />
            ) : (
              <p className="text-slate-300">{bio || 'No bio yet'}</p>
            )}
          </div>

          {/* Skills Section */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-slate-300 mb-3 block">Skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium border border-cyan-500/30 flex items-center gap-2"
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      type="button"
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Add a skill..."
                  className="flex-1 bg-slate-700/50 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleAddSkill}
                  type="button"
                  className="px-3 py-2 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Experience Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-300">Experience</label>
              {isEditing && (
                <button
                  onClick={handleAddExperience}
                  type="button"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
            <div className="space-y-3">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30"
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                        placeholder="Job Title"
                        className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                        placeholder="Company"
                        className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={exp.from}
                          onChange={(e) => handleUpdateExperience(idx, 'from', e.target.value)}
                          className="flex-1 bg-slate-700/50 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <input
                          type="date"
                          value={exp.to || ''}
                          onChange={(e) => handleUpdateExperience(idx, 'to', e.target.value)}
                          placeholder="To (current if empty)"
                          className="flex-1 bg-slate-700/50 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <textarea
                        value={exp.description || ''}
                        onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                        rows={2}
                      />
                      <button
                        onClick={() => handleRemoveExperience(idx)}
                        type="button"
                        className="text-red-400 hover:text-red-300 transition-colors text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-white">{exp.title}</p>
                      <p className="text-sm text-slate-400">{exp.company}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(exp.from).toLocaleDateString()} - {exp.to ? new Date(exp.to).toLocaleDateString() : 'Present'}
                      </p>
                      {exp.description && <p className="text-sm text-slate-300 mt-1">{exp.description}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-300">Education</label>
              {isEditing && (
                <button
                  onClick={handleAddEducation}
                  type="button"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30"
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                        placeholder="Institution"
                        className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                        placeholder="Degree"
                        className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <input
                        type="number"
                        value={edu.year}
                        onChange={(e) => handleUpdateEducation(idx, 'year', parseInt(e.target.value))}
                        placeholder="Year"
                        className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <button
                        onClick={() => handleRemoveEducation(idx)}
                        type="button"
                        className="text-red-400 hover:text-red-300 transition-colors text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-white">{edu.degree}</p>
                      <p className="text-sm text-slate-400">{edu.institution}</p>
                      <p className="text-xs text-slate-500">{edu.year}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resume Upload */}
          {isEditing && (
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Resume</label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setProfilePicFile(e.target.files?.[0] || null)}
                className="w-full"
              />
              {profile?.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block underline"
                >
                  View current resume
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
