import { Link } from 'wouter';
import { Download, ArrowRight, Wrench, LogIn, CheckCircle } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: <Download className="w-6 h-6" />,
    title: 'Get the original client',
    desc: 'You need the 2020 Rec Room APK (Android) or IPA (iOS). Do not download the current version from the app store — it will not work with our server.',
    note: 'Search for "Rec Room 2020 APK" or ask in our Discord for a verified download link.',
  },
  {
    num: '02',
    icon: <Wrench className="w-6 h-6" />,
    title: 'Redirect traffic to our server',
    desc: 'The app needs to talk to our server instead of the official servers. You can do this by editing your device\'s hosts file or using a proxy app.',
    note: 'Android users: use hosts file editor (requires root) or a VPN/proxy app. iOS users: use a hosts manager or DNS profile.',
  },
  {
    num: '03',
    icon: <LogIn className="w-6 h-6" />,
    title: 'Log in and play',
    desc: 'Open the app, log in with any credentials (create an account if you don\'t have one), and you\'ll be in. Your rooms, profile, and data save to our server.',
    note: 'If the app asks to update, decline. You must stay on the 2020 client version.',
  },
];

const serverInfo = [
  { label: 'Base URL', value: 'https://rec.net' },
  { label: 'Config endpoint', value: '/api/config/v2' },
  { label: 'Version check', value: '/api/versioncheck/v3' },
];

export default function Instructions() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      {/* Hero */}
      <section className="py-20 px-6 text-center border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 bg-primary text-white pl-3 pr-4 py-1.5 rounded-full text-sm font-bold mb-8"
            style={{ boxShadow: '0 8px 24px hsl(var(--primary) / 0.25)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Server is live — Ready to connect
          </div>
          <h1 className="text-5xl md:text-6xl font-black bloom-text mb-4">
            How to <span className="text-primary">Play</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Three steps to get back into the 2020 Rec Room. The whole process takes about 10
            minutes.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="bg-card border border-border rounded-3xl p-8"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
            >
              <div className="flex items-start gap-6">
                <div
                  className="text-5xl font-black leading-none flex-shrink-0"
                  style={{ color: 'hsl(var(--primary) / 0.2)' }}
                >
                  {s.num}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-primary">{s.icon}</div>
                    <h2 className="font-black text-xl">{s.title}</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3">
                    <p className="text-sm text-primary font-bold">
                      Tip: {s.note}
                    </p>
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center mt-6">
                  <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Server info */}
      <section className="py-10 px-6 bg-card/40 border-y border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-black text-2xl mb-6 text-center">Server connection details</h2>
          <div className="bg-background border border-border rounded-3xl overflow-hidden">
            <div className="divide-y divide-border">
              {serverInfo.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-8 py-4">
                  <span className="text-muted-foreground text-sm">{label}</span>
                  <span className="font-bold text-sm font-mono text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Done state */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4">That's it!</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            If you've followed the steps above and something isn't working, check the support page
            for troubleshooting guides or ask in the community Discord.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/support"
              className="inline-flex items-center justify-center bg-card border border-border text-foreground px-6 py-3 rounded-full font-bold hover:border-primary/50 transition-colors"
            >
              Get support
            </Link>
            <Link
              href="/have-fun"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
              style={{ boxShadow: '0 8px 24px hsl(var(--primary) / 0.25)' }}
            >
              What to do <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
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
