import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { UserProfile, userProfileService } from '../../services/userProfileService';

export const ProfileSettings: React.FC = () => {
  const { user, updatePreferences, updateExpertise, switchProfile, refreshUser } = useUser();
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const profiles = await userProfileService.getAllProfiles();
    setAllProfiles(profiles);
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;
    try {
      const newProfile = await userProfileService.createProfile(newProfileName.trim());
      await loadProfiles();
      await switchProfile(newProfile.id);
      setIsCreating(false);
      setNewProfileName('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = () => {
    if (!user) return;
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circuitmind-profile-${user.name.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const profile = JSON.parse(text);
        if (profile.id && profile.name) {
            // Ensure ID doesn't conflict or overwrite if intentional?
            // For now, we assume user wants to import exactly this profile
            await userProfileService.saveProfile(profile);
            await switchProfile(profile.id);
            await loadProfiles();
        } else {
            alert('Invalid profile file format');
        }
    } catch (err) {
        console.error('Import failed', err);
        alert('Failed to import profile');
    }
  };

  if (!user) return <div className="p-4 text-slate-400">Loading profile...</div>;

  return (
    <div className="space-y-6">
      {/* Profile Switcher */}
      <div className="space-y-3 p-4 bg-slate-900/40 border border-slate-800 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Active Persona</h3>
        
        {!isCreating ? (
          <div className="flex gap-2">
            <select
              value={user.id}
              onChange={(e) => switchProfile(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded px-3 py-2"
            >
              {allProfiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.expertise})</option>
              ))}
            </select>
            <button
              onClick={() => setIsCreating(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-200 text-xs uppercase font-bold"
            >
              New
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Enter Name..."
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded px-3 py-2"
            />
            <button
              onClick={handleCreateProfile}
              className="px-3 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 rounded text-xs uppercase font-bold"
            >
              Create
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-3 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Expertise */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Engineering Level</label>
        <div className="grid grid-cols-3 gap-2">
          {(['beginner', 'intermediate', 'pro'] as const).map((level) => (
            <button
              key={level}
              onClick={() => updateExpertise(level)}
              className={`px-3 py-2 rounded text-xs font-bold uppercase border transition-all ${
                user.expertise === level
                  ? 'bg-neon-green/20 border-neon-green text-neon-green'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-500">
          Adjusts the complexity of AI responses and UI defaults.
        </p>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">Preferences</h3>

        {/* Theme */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">Visual Theme</label>
          <div className="flex gap-2">
            {(['cyber', 'industrial', 'minimal'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updatePreferences({ theme })}
                className={`flex-1 px-3 py-2 rounded text-xs font-bold uppercase border transition-all ${
                  user.preferences.theme === theme
                    ? 'bg-neon-purple/20 border-neon-purple text-neon-purple'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* AI Tone */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400">AI Personality Tone</label>
          <select
            value={user.preferences.aiTone}
            onChange={(e) => updatePreferences({ aiTone: e.target.value as any })}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded px-3 py-2"
          >
            <option value="sass">Sass (Eve Original)</option>
            <option value="technical">Technical (Dry & Precise)</option>
            <option value="concise">Concise (Minimal)</option>
          </select>
        </div>

        {/* Wiring Colors (Simple Editor) */}
        <div className="space-y-2">
           <label className="block text-xs font-medium text-slate-400">Wiring Color Map (JSON)</label>
           <textarea
             className="w-full h-24 bg-slate-900 font-mono text-xs text-slate-300 border border-slate-700 rounded p-2"
             value={JSON.stringify(user.preferences.wiringColors, null, 2)}
             onChange={(e) => {
                try {
                    const parsed = JSON.parse(e.target.value);
                    updatePreferences({ wiringColors: parsed });
                } catch (err) {
                    // Ignore parse errors while typing
                }
             }}
           />
        </div>
      </div>

      {/* Sync */}
      <div className="pt-4 border-t border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2">Sync Profile</h3>
        <div className="flex gap-2">
            <button 
                onClick={handleExport}
                className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs uppercase font-bold hover:text-white"
            >
                Export JSON
            </button>
            <label className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs uppercase font-bold hover:text-white cursor-pointer select-none">
                Import JSON
                <input type="file" className="hidden" accept=".json" onChange={handleImport} />
            </label>
        </div>
      </div>
    </div>
  );
};
