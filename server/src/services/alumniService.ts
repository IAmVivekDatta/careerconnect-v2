// Simple skill-based similarity scorer
export const calculateSkillSimilarity = (userSkills: string[], alumniSkills: string[]): number => {
  if (userSkills.length === 0 || alumniSkills.length === 0) return 0;

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const alumniSkillsLower = alumniSkills.map((s) => s.toLowerCase());

  // Count matching skills
  const matches = alumniSkillsLower.filter((skill) => userSkillsLower.includes(skill)).length;

  // Cosine-like similarity: matches / max length
  const similarity = matches / Math.max(userSkillsLower.length, alumniSkillsLower.length);

  return similarity;
};

// Rank alumni by skill similarity
export const rankAlumniBySkills = (
  userSkills: string[],
  alumni: Array<{ _id: string; name: string; skills: string[] }>
): Array<{ _id: string; name: string; skills: string[]; similarity: number }> => {
  return alumni
    .map((alum) => ({
      ...alum,
      similarity: calculateSkillSimilarity(userSkills, alum.skills)
    }))
    .filter((alum) => alum.similarity > 0) // Only show alumni with at least 1 matching skill
    .sort((a, b) => b.similarity - a.similarity);
};
