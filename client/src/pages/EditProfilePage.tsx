const EditProfilePage = () => {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Edit Profile</h2>
        <p className="text-sm text-muted">Update your resume, links, and skills.</p>
      </header>
      <form className="neon-border space-y-4 rounded-lg bg-surface/80 p-6">
        <div className="space-y-2">
          <label htmlFor="profile-bio" className="text-sm font-medium">Bio</label>
          <textarea
            id="profile-bio"
            name="bio"
            className="h-24 w-full rounded bg-white/5 p-3 text-sm text-white outline-none"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="profile-skills" className="text-sm font-medium">Skills</label>
          <input
            id="profile-skills"
            name="skills"
            className="w-full rounded bg-white/5 p-3 text-sm text-white outline-none"
            placeholder="React, Node.js"
          />
        </div>
        <button type="submit" className="neon-border rounded px-4 py-2 text-sm font-semibold text-white">
          Save Changes
        </button>
      </form>
    </section>
  );
};

export default EditProfilePage;
