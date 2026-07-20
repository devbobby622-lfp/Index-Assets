import { useState } from 'react';
import { Moon, Sun, Bell, Globe, Shield } from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <span className="inline-flex items-center gap-2 bg-primary/15 text-primary px-3 py-1 rounded-full text-sm font-bold mb-4">
              Settings
            </span>
            <h1 className="text-4xl font-black">Preferences</h1>
            <p className="text-muted-foreground mt-2">
              Customize your Rec Room Revival experience.
            </p>
          </div>

          {/* Theme */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden mb-4" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-black text-base">Appearance</h2>
            </div>
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <div>
                  <div className="font-bold text-sm">Theme</div>
                  <div className="text-xs text-muted-foreground">
                    {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 bg-primary/15 text-primary border border-primary/20 px-4 py-2 rounded-full text-sm font-bold hover:bg-primary/25 transition-colors"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden mb-4" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-black text-base">Notifications</h2>
            </div>
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-bold text-sm">Server announcements</div>
                  <div className="text-xs text-muted-foreground">
                    Get notified about maintenance and events
                  </div>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-muted'}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications ? 'translate-x-7' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>

          {/* Connection */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden mb-4" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-black text-base">Connection</h2>
            </div>
            <div className="divide-y divide-border">
              <div className="px-6 py-4 flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-sm">Server region</div>
                  <div className="text-xs text-muted-foreground">US East (default)</div>
                </div>
              </div>
              <div className="px-6 py-4 flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-sm">Secure connection</div>
                  <div className="text-xs text-muted-foreground">HTTPS enforced</div>
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Settings are saved locally in your browser.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-black text-primary text-lg">Rec Room Revival</span>
          <p className="text-xs text-muted-foreground text-center">
            Not affiliated with Against Gravity. A fan project keeping the 2020 build alive.
          </p>
          <p className="text-xs text-muted-foreground">2026</p>
        </div>
      </footer>
    </div>
  );
}
