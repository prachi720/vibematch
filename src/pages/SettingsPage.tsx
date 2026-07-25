import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Key, Eye, EyeOff, Save, Check, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Skill, ExperienceLevel } from '@/types';

const experienceLevels: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile state
  const [name, setName] = useState('');
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Record<string, number>>({});
  const [skillSearch, setSkillSearch] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // API key state
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setExperience(profile.experience_level);
    }
  }, [profile]);

  useEffect(() => {
    supabase.from('skills').select('*').order('name').then(({ data }) => {
      if (data) setAllSkills(data as Skill[]);
    });
  }, []);

  useEffect(() => {
    if (!user || !profile) return;
    (async () => {
      const { data: skills } = await supabase
        .from('profile_skills')
        .select('*, skill:skills(*)')
        .eq('profile_id', profile.id);
      if (skills) {
        const map: Record<string, number> = {};
        skills.forEach((ps: Record<string, unknown>) => {
          const skill = ps.skill as Skill;
          map[skill.id] = ps.proficiency as number;
        });
        setSelectedSkills(map);
      }
    })();
  }, [user, profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('user_settings')
        .select('ai_api_key')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.ai_api_key) setHasKey(true);
    })();
  }, [user]);

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

  const saveProfile = async () => {
    if (!user || !profile) return;
    setSavingProfile(true);
    try {
      await supabase.from('profiles').update({
        name: name.trim(),
        experience_level: experience,
      }).eq('id', profile.id);

      await supabase.from('profile_skills').delete().eq('profile_id', profile.id);
      const entries = Object.entries(selectedSkills);
      if (entries.length > 0) {
        await supabase.from('profile_skills').insert(
          entries.map(([skillId, proficiency]) => ({
            profile_id: profile.id,
            skill_id: skillId,
            proficiency,
          })),
        );
      }

      await refreshProfile();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } finally {
      setSavingProfile(false);
    }
  };

  const saveApiKey = async () => {
    if (!user) return;
    setSavingKey(true);
    try {
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        ai_api_key: apiKey || null,
      }, { onConflict: 'user_id' });
      setHasKey(!!apiKey);
      setApiKey('');
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2000);
    } finally {
      setSavingKey(false);
    }
  };

  const removeApiKey = async () => {
    if (!user) return;
    await supabase.from('user_settings').upsert({
      user_id: user.id,
      ai_api_key: null,
    }, { onConflict: 'user_id' });
    setHasKey(false);
  };

  const selectedSkillObjects = allSkills.filter((s) => selectedSkills[s.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6 text-primary-500" />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle>Developer Profile</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Experience level</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {experienceLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setExperience(level)}
                  className={`rounded-lg border p-2.5 text-sm font-medium capitalize transition-all ${
                    experience === level ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400' : ''
                  }`}
                  style={{ borderColor: experience === level ? undefined : 'var(--border)', color: experience === level ? undefined : 'var(--text-secondary)' }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Skills</label>
            <Input placeholder="Search skills..." value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} />
            {skillSearch && filteredSkills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {filteredSkills.slice(0, 10).map((s) => (
                  <button key={s.id} onClick={() => addSkill(s)} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs hover:border-primary-500" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                    <Plus className="h-3 w-3" /> {s.name}
                  </button>
                ))}
              </div>
            )}
            {selectedSkillObjects.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedSkillObjects.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1 text-xs text-primary-600 dark:text-primary-400">
                    {s.name}
                    <button onClick={() => removeSkill(s.id)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={saveProfile} loading={savingProfile}>
              <Save className="h-4 w-4" /> Save Profile
            </Button>
            {profileSaved && <span className="flex items-center gap-1 text-sm text-success-500"><Check className="h-4 w-4" /> Saved</span>}
          </div>
        </CardBody>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-primary-500" /> : <Sun className="h-5 w-5 text-warning-500" />}
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Theme</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Currently in {theme} mode</p>
              </div>
            </div>
            <Button variant="secondary" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'light' : 'dark'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-accent-500" />
            <CardTitle>AI API Key</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Optionally provide your own AI API key. It's encrypted and never displayed in full after saving.
          </p>
          {hasKey ? (
            <div className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Badge variant="success"><Check className="h-3 w-3" /> Key configured</Badge>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>••••••••••••</span>
              </div>
              <Button variant="danger" size="sm" onClick={removeApiKey}>Remove</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  placeholder="Paste your API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showKey ? <EyeOff className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} /> : <Eye className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />}
                </button>
              </div>
              <Button onClick={saveApiKey} loading={savingKey}>Save Key</Button>
            </div>
          )}
          {keySaved && <span className="flex items-center gap-1 text-sm text-success-500"><Check className="h-4 w-4" /> Key saved</span>}
        </CardBody>
      </Card>
    </div>
  );
}
