import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  Download,
  Edit2,
  FileText,
  Loader2,
  MapPin,
  Mail,
  Plus,
  Save,
  Trash2,
  X
} from 'lucide-react';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import Avatar from '../components/atoms/Avatar';
import { useToast } from '../components/atoms/Toast';
import { BadgeGallery } from '../components/organisms/BadgeGallery';
import { SkillEndorsements } from '../components/organisms/SkillEndorsements';
import { Leaderboard } from '../components/organisms/Leaderboard';

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

type Experience = {
  _id?: string;
  title: string;
  company: string;
  from: string;
  to?: string;
  description?: string;
};

type Education = {
  _id?: string;
  institution: string;
  degree: string;
  year: number;
};

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { id: routeId } = useParams();
  const targetId = routeId ?? user?._id;
  const isOwnProfile = !routeId || routeId === user?._id;
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isOwnProfile && isEditing) {
      setIsEditing(false);
    }
  }, [isOwnProfile, isEditing]);

  if (!user || !targetId) {
    return (
      <div className="p-8 text-center text-white/60">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <main className="space-y-8">
      <EnhancedProfileEditor
        userId={targetId}
        isEditing={isEditing && isOwnProfile}
        setIsEditing={setIsEditing}
        canEdit={isOwnProfile}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="glass-panel rounded-3xl p-6">
          <BadgeGallery userId={targetId} />
        </section>
        <section className="glass-panel rounded-3xl p-6">
          <SkillEndorsements
            userId={targetId}
            skills={[]}
            isOwnProfile={isOwnProfile}
          />
        </section>
        <section className="glass-panel rounded-3xl p-6">
          <Leaderboard />
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;

const EnhancedProfileEditor = ({
  userId,
  isEditing,
  setIsEditing,
  canEdit
}: {
  userId: string;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  canEdit: boolean;
}) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { push } = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const endpoint = canEdit ? '/users/me' : `/users/${userId}`;
      const response = await api.get(endpoint);
      return response.data;
    },
    staleTime: 60_000,
    enabled: Boolean(userId)
  });

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setBio(profile.bio || '');
    setSkills(profile.skills || []);
    setExperience(profile.experience || []);
    setEducation(profile.education || []);
    setProfilePreview(profile.profilePicture ?? profile.googlePhotoUrl ?? null);
  }, [profile]);

  useEffect(() => {
    if (profilePicFile) {
      const objectUrl = URL.createObjectURL(profilePicFile);
      setProfilePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setProfilePreview(
      profile?.profilePicture ?? profile?.googlePhotoUrl ?? null
    );
    return undefined;
  }, [profilePicFile, profile?.profilePicture, profile?.googlePhotoUrl]);

  const stats = useMemo(
    () => [
      { label: 'Skills', value: skills.length },
      { label: 'Experience', value: experience.length },
      { label: 'Education', value: education.length }
    ],
    [skills.length, experience.length, education.length]
  );

  const contactItems = useMemo(
    () => [
      {
        icon: Mail,
        label: 'Email',
        value: profile?.email ?? 'Add your email',
        href: profile?.email ? `mailto:${profile.email}` : undefined
      },
      {
        icon: MapPin,
        label: 'Location',
        value: profile?.location ?? 'Add your location'
      }
    ],
    [profile?.email, profile?.location]
  );

  const resetFromProfile = () => {
    if (!profile) return;
    setName(profile.name || '');
    setBio(profile.bio || '');
    setSkills(profile.skills || []);
    setExperience(profile.experience || []);
    setEducation(profile.education || []);
    setResumeFile(null);
    setProfilePicFile(null);
    setProfilePreview(profile.profilePicture ?? profile.googlePhotoUrl ?? null);
  };

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        name,
        bio,
        skills,
        experience,
        education,
        resumeUrl: profile?.resumeUrl
      };

      if (profilePicFile) {
        const formData = new FormData();
        formData.append('file', profilePicFile);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        payload.profilePicture = uploadRes.data.url;
      }

      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        const uploadRes = await api.post('/upload', formData, {
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
      push({ message: 'Profile updated successfully.', type: 'success' });
    },
    onError: () => {
      push({
        message: 'Unable to update profile right now. Please try again.',
        type: 'error'
      });
    }
  });

  const handleAddSkill = () => {
    const normalized = newSkill.trim();
    if (!normalized) return;
    if (skills.includes(normalized)) {
      push({ message: 'Skill already added.' });
      return;
    }
    setSkills([...skills, normalized]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((current) => current.filter((item) => item !== skill));
  };

  const handleAddExperience = () => {
    setExperience((current) => [
      ...current,
      { title: '', company: '', from: new Date().toISOString().split('T')[0] }
    ]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperience((current) => current.filter((_, idx) => idx !== index));
  };

  const handleUpdateExperience = (
    index: number,
    field: keyof Experience,
    value: string
  ) => {
    setExperience((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddEducation = () => {
    setEducation((current) => [
      ...current,
      { institution: '', degree: '', year: new Date().getFullYear() }
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation((current) => current.filter((_, idx) => idx !== index));
  };

  const handleUpdateEducation = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    setEducation((current) => {
      const next = [...current];
      next[index] = {
        ...next[index],
        [field]:
          field === 'year' ? Number(value) || new Date().getFullYear() : value
      };
      return next;
    });
  };

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE) {
      push({ message: 'Profile photos must be under 5MB.', type: 'error' });
      event.target.value = '';
      return;
    }
    setProfilePicFile(file);
  };

  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE) {
      push({ message: 'Resume files must be under 5MB.', type: 'error' });
      event.target.value = '';
      return;
    }
    setResumeFile(file);
  };

  const handleCancelEditing = () => {
    resetFromProfile();
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="glass-panel h-[420px] rounded-3xl" />;
  }

  return (
    <div className="space-y-8">
      <section className="glass-panel relative overflow-hidden rounded-3xl px-6 py-8 sm:px-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-10 h-64 w-64 rounded-full bg-neonCyan/20 blur-3xl" />
          <div className="absolute -bottom-28 left-4 h-60 w-60 rounded-full bg-neonMagenta/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
            <div className="relative flex-shrink-0">
              <Avatar
                src={profilePreview ?? profile?.googlePhotoUrl ?? undefined}
                alt={name || 'Profile avatar'}
                className="h-32 w-32 border-4 border-white/20 shadow-[0_25px_55px_rgba(15,23,42,0.45)]"
              />
              {isEditing && (
                <label className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 cursor-pointer items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:bg-black/80">
                  <Edit2 className="h-3.5 w-3.5" />
                  Change photo
                  <input
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </label>
              )}
            </div>

            <div className="flex-1 space-y-4">
              {isEditing ? (
                <input
                  name="displayName"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-3xl font-semibold text-white focus:border-neonCyan focus:outline-none focus:ring-2 focus:ring-neonCyan/40"
                />
              ) : (
                <h1 className="text-4xl font-bold text-white">{name}</h1>
              )}

              <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
                <span className="inline-flex items-center gap-2 rounded-full border border-neonCyan/50 bg-neonCyan/15 px-3 py-1 font-semibold text-neonCyan">
                  <Briefcase className="h-3.5 w-3.5" />
                  {profile?.role === 'alumni' ? 'Alumni' : 'Student'}
                </span>
                {contactItems.map(({ icon: Icon, value, href, label }) => {
                  const content = (
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 ${
                        value?.startsWith('Add')
                          ? 'text-white/50'
                          : 'text-white/80'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{value}</span>
                    </span>
                  );

                  return href ? (
                    <a key={label} href={href} className="no-underline">
                      {content}
                    </a>
                  ) : (
                    <span key={label}>{content}</span>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProfileMutation.mutate()}
                    disabled={updateProfileMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-neonCyan px-6 py-2.5 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(0,245,255,0.35)] transition hover:bg-neonCyan/85 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {updateProfileMutation.isPending
                      ? 'Saving'
                      : 'Save changes'}
                  </button>
                </>
              ) : (
                canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-neonCyan/40 hover:text-neonCyan"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit profile
                  </button>
                )
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
                About
              </h2>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Tell your network what excites you right now..."
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-neonCyan focus:outline-none focus:ring-2 focus:ring-neonCyan/30"
                  rows={4}
                  aria-label="Profile bio"
                />
              ) : (
                <p className="mt-3 text-base text-white/80">
                  {bio ||
                    'Let others know about your journey, goals, and passions.'}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className="glass-panel rounded-3xl p-6">
            <header className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Skills</h3>
                <p className="text-xs text-white/60">
                  Spotlight the strengths you want endorsed.
                </p>
              </div>
            </header>

            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-full border border-neonCyan/30 bg-neonCyan/10 px-3 py-1 text-xs font-semibold text-neonCyan"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-neonCyan/70 transition hover:text-neonMagenta"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-white/60">
                  Add your core skills so teammates know where you thrive.
                </p>
              )}
            </div>

            {isEditing && (
              <div className="mt-4 flex gap-2">
                <input
                  name="newSkill"
                  value={newSkill}
                  onChange={(event) => setNewSkill(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add a skill"
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neonCyan focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="inline-flex items-center justify-center rounded-full bg-neonCyan px-4 py-2 text-sm font-semibold text-black transition hover:bg-neonCyan/85"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>

          <section className="glass-panel rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white">Resume</h3>
            <p className="mt-1 text-xs text-white/60">
              Share the latest version so recruiters can dive deeper.
            </p>

            {profile?.resumeUrl ? (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neonCyan transition hover:border-neonCyan/40 hover:text-neonCyan"
              >
                <Download className="h-4 w-4" />
                Download current resume
              </a>
            ) : (
              <p className="mt-4 text-sm text-white/60">
                No resume uploaded yet.
              </p>
            )}

            {resumeFile && (
              <div className="mt-4 rounded-2xl border border-neonCyan/40 bg-neonCyan/10 px-4 py-2 text-xs text-neonCyan">
                Ready to upload: {resumeFile.name}
              </div>
            )}

            {isEditing && (
              <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-white/60 transition hover:border-neonCyan/50 hover:text-white">
                <FileText className="h-6 w-6" />
                <span className="font-semibold">Upload new resume</span>
                <span className="text-xs text-white/50">
                  PDF, DOC, or DOCX · up to 5MB
                </span>
                <input
                  type="file"
                  name="resumeFile"
                  accept="application/pdf,.doc,.docx,image/*"
                  className="hidden"
                  onChange={handleResumeChange}
                />
              </label>
            )}
          </section>
        </aside>

        <div className="space-y-6">
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Experience timeline
                </h3>
                <p className="text-xs text-white/60">
                  Showcase the milestones that shaped your career.
                </p>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-neonCyan/40 hover:text-neonCyan"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add role
                </button>
              )}
            </div>

            <div className="mt-6 space-y-6">
              {experience.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-white/60">
                  No experience added yet. Start with your most recent role.
                </p>
              ) : (
                experience.map((exp, index) => (
                  <div key={`experience-${index}`} className="relative pl-6">
                    <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-neonCyan shadow-[0_0_10px_rgba(0,245,255,0.65)]" />
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            name={`experience[${index}].title`}
                            value={exp.title}
                            onChange={(event) =>
                              handleUpdateExperience(
                                index,
                                'title',
                                event.target.value
                              )
                            }
                            placeholder="Role"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neonCyan focus:outline-none"
                          />
                          <input
                            name={`experience[${index}].company`}
                            value={exp.company}
                            onChange={(event) =>
                              handleUpdateExperience(
                                index,
                                'company',
                                event.target.value
                              )
                            }
                            placeholder="Company"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neonCyan focus:outline-none"
                          />
                          <div className="grid gap-2 sm:grid-cols-2">
                            <label className="text-xs text-white/60">
                              Start date
                              <input
                                type="date"
                                name={`experience[${index}].from`}
                                value={exp.from}
                                onChange={(event) =>
                                  handleUpdateExperience(
                                    index,
                                    'from',
                                    event.target.value
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neonCyan focus:outline-none"
                              />
                            </label>
                            <label className="text-xs text-white/60">
                              End date (leave empty if current)
                              <input
                                type="date"
                                name={`experience[${index}].to`}
                                value={exp.to ?? ''}
                                onChange={(event) =>
                                  handleUpdateExperience(
                                    index,
                                    'to',
                                    event.target.value
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neonCyan focus:outline-none"
                              />
                            </label>
                          </div>
                          <textarea
                            name={`experience[${index}].description`}
                            value={exp.description ?? ''}
                            onChange={(event) =>
                              handleUpdateExperience(
                                index,
                                'description',
                                event.target.value
                              )
                            }
                            placeholder="What did you deliver? Highlight wins, metrics, or moments you’re proud of."
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neonCyan focus:outline-none"
                            rows={3}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(index)}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-red-400 transition hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove role
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-base font-semibold text-white">
                                {exp.title || 'Untitled role'}
                              </p>
                              <p className="text-sm text-white/60">
                                {exp.company || 'Company name'}
                              </p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDateRange(exp.from, exp.to)}
                            </div>
                          </div>
                          {exp.description ? (
                            <p className="text-sm text-white/70">
                              {exp.description}
                            </p>
                          ) : (
                            <p className="text-sm text-white/40">
                              Describe your impact in this role.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Education</h3>
                <p className="text-xs text-white/60">
                  Highlight programs and certifications that shaped your path.
                </p>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-neonCyan/40 hover:text-neonCyan"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add program
                </button>
              )}
            </div>

            <div className="mt-6 space-y-6">
              {education.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-white/60">
                  Add your education so peers can follow your journey.
                </p>
              ) : (
                education.map((edu, index) => (
                  <div key={`education-${index}`} className="relative pl-6">
                    <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-neonMagenta shadow-[0_0_10px_rgba(255,0,214,0.45)]" />
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            name={`education[${index}].degree`}
                            value={edu.degree}
                            onChange={(event) =>
                              handleUpdateEducation(
                                index,
                                'degree',
                                event.target.value
                              )
                            }
                            placeholder="Degree or certification"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neonMagenta focus:outline-none"
                          />
                          <input
                            name={`education[${index}].institution`}
                            value={edu.institution}
                            onChange={(event) =>
                              handleUpdateEducation(
                                index,
                                'institution',
                                event.target.value
                              )
                            }
                            placeholder="Institution"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neonMagenta focus:outline-none"
                          />
                          <label className="text-xs text-white/60">
                            Graduation year
                            <input
                              type="number"
                              name={`education[${index}].year`}
                              value={edu.year}
                              onChange={(event) =>
                                handleUpdateEducation(
                                  index,
                                  'year',
                                  event.target.value
                                )
                              }
                              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neonMagenta focus:outline-none"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(index)}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-red-400 transition hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove program
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-base font-semibold text-white">
                                {edu.degree || 'Program name'}
                              </p>
                              <p className="text-sm text-white/60">
                                {edu.institution || 'Institution'}
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                              <Calendar className="h-3.5 w-3.5" />
                              {edu.year || 'Year'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const formatDateRange = (from?: string, to?: string) => {
  if (!from) return 'Add start date';
  const fromDate = new Date(from);
  const toDate = to ? new Date(to) : null;
  const fromLabel = Number.isNaN(fromDate.getTime())
    ? 'Start date'
    : fromDate.toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric'
      });
  const toLabel =
    toDate && !Number.isNaN(toDate.getTime())
      ? toDate.toLocaleDateString(undefined, {
          month: 'short',
          year: 'numeric'
        })
      : 'Present';
  return `${fromLabel} – ${toLabel}`;
};
