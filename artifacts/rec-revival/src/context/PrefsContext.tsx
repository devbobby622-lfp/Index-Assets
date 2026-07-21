import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Prefs {
  bloomEnabled: boolean;
  bloomIntensity: number; // 0–1
  assistantEnabled: boolean;
  uiTransparencyEnabled: boolean;
  uiTransparency: number; // 0–1, how transparent UI panels are
}

interface PrefsContextType {
  prefs: Prefs;
  setPrefs: (p: Partial<Prefs>) => void;
}

const PREFS_KEY = 'rr_prefs_v1';
const defaults: Prefs = {
  bloomEnabled: true,
  bloomIntensity: 0.25,
  assistantEnabled: false,
  uiTransparencyEnabled: false,
  uiTransparency: 0.5,
};

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}

const PrefsContext = createContext<PrefsContextType | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Prefs>(loadPrefs);

  // Apply bloom to CSS every time prefs change
  useEffect(() => {
    const intensity = prefs.bloomEnabled ? prefs.bloomIntensity : 0;
    document.documentElement.style.setProperty('--bloom-intensity', intensity.toString());
  }, [prefs.bloomEnabled, prefs.bloomIntensity]);

  // Apply UI transparency
  useEffect(() => {
    const opacity = prefs.uiTransparencyEnabled ? 1 - prefs.uiTransparency : 1;
    document.documentElement.style.setProperty('--ui-panel-opacity', opacity.toString());
  }, [prefs.uiTransparencyEnabled, prefs.uiTransparency]);

  const setPrefs = (p: Partial<Prefs>) => {
    setPrefsState(prev => {
      const next = { ...prev, ...p };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <PrefsContext.Provider value={{ prefs, setPrefs }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used within PrefsProvider');
  return ctx;
}
