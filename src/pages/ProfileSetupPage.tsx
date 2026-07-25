import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, X, Plus, ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { Skill, ExperienceLevel } from '@/types';

const experienceLevels: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'New to building projects' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Built several projects' },
  { value: 'advanced', label: 'Advanced', desc: 'Experienced developer' },
  { value: 'expert', label: 'Expert', desc: 'Deep expertise across stack' },
];

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Record<string, number>>({});
  const [skillSearch, setSkillSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if profile already complete
  useEffect(() => {
    if (!profileLoading && profile?.profile_complete) {
      navigate('/dashboard');
    }
  }, [profile, profileLoading, navigate]);

  // Load skills
  useEffect(() => {
    supabase.from('skills').select('*').order('name').then(({ data }) => {
      if (data) setAllSkills(data as Skill[]);
    });
  }, []);

  // Pre-fill if profile exists but incomplete
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setExperience(profile.experience_level);
    }
  }, [profile]);

  const filteredSkills = allSkills.filter((s) =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) && !selectedSkills[s.id],
  );

  const addSkill = (skill: Skill) => {
    setSelectedSkills((prev) => ({ ...prev, [skill.id]: 3 }));
    setSkillSearch('');
  };

  const removeSkill = (skillId: string) => {
    setSelectedSkills((prev) => {
      const next = { ...prev };
      delete next[skillId];
      return next;
    });
  };

  const setProficiency = (skillId: string, level: number) => {
    setSelectedSkills((prev) => ({ ...prev, [skillId]: level }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Upsert profile
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: name.trim(),
          experience_level: experience,
          profile_complete: true,
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (profError) throw profError;

      // Clear existing profile_skills
      await supabase.from('profile_skills').delete().eq('profile_id', profData.id);

      // Insert new profile_skills
      const skillEntries = Object.entries(selectedSkills);
      if (skillEntries.length > 0) {
        const { error: skillsError } = await supabase.from('profile_skills').insert(
          skillEntries.map(([skillId, proficiency]) => ({
            profile_id: profData.id,
            skill_id: skillId,
            proficiency,
          })),
        );
        if (skillsError) throw skillsError;
      }

      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-pulse text-primary-500">
          <Zap className="h-8 w-8" />
        </div>
      </div>
    );
  }

  const selectedSkillObjects = allSkills.filter((s) => selectedSkills[s.id]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-2xl px-4 py-12 lg:py-20">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Set up your developer profile
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Tell us about yourself so we can tailor your AI-powered hackathon prep.
          </p>
        </div>

        <div className="card p-6 lg:p-8 space-y-6 animate-slide-up">
          {/* Name */}
          <Input
            label="Your name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Experience level */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Experience level
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setExperience(level.value)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    experience === level.value
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'hover:border-primary-500/50'
                  }`}
                  style={{ borderColor: experience === level.value ? undefined : 'var(--border)' }}
                >
                  <div className="flex items-center gap-1.5">
                    {experience === level.value && <Check className="h-4 w-4 text-primary-500" />}
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {level.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>{level.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Your skills
            </label>
            <p className="mb-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Add skills and rate your proficiency (1-5). This powers your skill analysis.
            </p>

            {/* Search */}
            <Input
              placeholder="Search skills to add..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
            />

            {/* Search results */}
            {skillSearch && filteredSkills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {filteredSkills.slice(0, 10).map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => addSkill(skill)}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all hover:border-primary-500 hover:bg-primary-500/10"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    <Plus className="h-3 w-3" /> {skill.name}
                  </button>
                ))}
              </div>
            )}

            {/* Selected skills */}
            {selectedSkillObjects.length > 0 && (
              <div className="mt-4 space-y-3">
                {selectedSkillObjects.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{skill.name}</span>
                        <Badge variant="neutral">{skill.category}</Badge>
                      </div>
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            onClick={() => setProficiency(skill.id, level)}
                            className={`h-6 w-6 rounded text-xs font-bold transition-all ${
                              selectedSkills[skill.id] >= level
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeSkill(skill.id)} className="rounded-lg p-1.5 hover:bg-error-500/10">
                      <X className="h-4 w-4 text-error-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-error-500">{error}</p>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} loading={loading} size="lg">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
