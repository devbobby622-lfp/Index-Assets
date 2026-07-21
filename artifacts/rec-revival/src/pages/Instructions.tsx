import { Link } from 'wouter';
import { ArrowRight, CheckCircle, DownloadIcon, MessageSquare, Search } from 'lucide-react';

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
            Three steps to get the original Rec Room build. Takes less than a minute.
          </p>
        </div>
      </section>
      {/* Steps */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Step 1 */}
          <div
            className="bg-card border border-border rounded-3xl p-8"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <div className="flex items-start gap-6">
              <div
                className="text-5xl font-black leading-none flex-shrink-0"
                style={{ color: 'hsl(var(--primary) / 0.2)' }}
              >
                01
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  <h2 className="font-black text-xl">Join the Discord server</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Join the Rec Room Early Builds Discord server — this is where all builds and
                  community support live.
                </p>
                <a
                  href="https://discord.gg/AXZfuaqSbc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#5865F2] text-white px-5 py-3 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
                  style={{ boxShadow: '0 8px 24px rgba(88,101,242,0.35)' }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Join — discord.gg/AXZfuaqSbc
                </a>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
            </div>
          </div>

          {/* Step 2 */}
          <div
            className="bg-card border border-border rounded-3xl p-8"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <div className="flex items-start gap-6">
              <div
                className="text-5xl font-black leading-none flex-shrink-0"
                style={{ color: 'hsl(var(--primary) / 0.2)' }}
              >
                02
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Search className="w-6 h-6 text-primary" />
                  <h2 className="font-black text-xl">Find your build</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">Look for builds in the channel that matches your File Format:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3">
                    <p className="text-sm font-black text-primary mb-0.5">#android-builds</p>
                    <p className="text-xs text-muted-foreground">For Android phones and tablets</p>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3">
                    <p className="text-sm font-black text-primary mb-0.5">#pc-builds</p>
                    <p className="text-xs text-muted-foreground">For Windows os</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className="bg-card border border-border rounded-3xl p-8"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <div className="flex items-start gap-6">
              <div
                className="text-5xl font-black leading-none flex-shrink-0"
                style={{ color: 'hsl(var(--primary) / 0.2)' }}
              >
                03
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <DownloadIcon className="w-6 h-6 text-primary" />
                  <h2 className="font-black text-xl">Run the apk/exe</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Enjoy the 2020 build
                </p>
              </div>
            </div>
          </div>

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
