import { Link } from 'wouter';
import { useEffect, useRef } from 'react';
import {
  Shield,
  Layers,
  CircleUserRound,
  Wifi,
  Server,
  ArrowRight,
} from 'lucide-react';
import PlayersOnline from '@/components/PlayersOnline';

/* ── Scroll reveal helper ── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({
  children,
  from = 'bottom',
  delay = 0,
}: {
  children: React.ReactNode;
  from?: 'bottom' | 'right' | 'scale';
  delay?: number;
}) {
  const ref = useScrollReveal();
  const initial =
    from === 'bottom'
      ? 'translateY(28px)'
      : from === 'right'
        ? 'translateX(40px)'
        : 'scale(0.97)';
  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: initial,
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const features = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Authentication',
    desc: 'Accounts work. Log in with your original credentials and your identity saves across sessions.',
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'Custom rooms',
    desc: 'The Maker Pen is fully supported. Build, save, and share your rooms the old way.',
  },
  {
    icon: <CircleUserRound className="w-6 h-6" />,
    title: 'Player profiles',
    desc: 'Your bio, outfit, and stats all persist. Profiles work the same as they did in 2020.',
  },
  {
    icon: <Wifi className="w-6 h-6" />,
    title: 'Stable connection',
    desc: 'The server sends a heartbeat every 30 seconds to keep your session alive and lag-free.',
  },
  {
    icon: <Server className="w-6 h-6" />,
    title: 'Self-hosted',
    desc: 'We run everything ourselves. No dependency on Against Gravity.',
  },
  {
    icon: <Server className="w-6 h-6" />,
    title: 'Original client',
    desc: 'Point your 2020 mobile client at our server and you are straight back in the game.',
  },
];

const serverDetails = [
  { label: 'Base URL', value: 'https://rec.net' },
  { label: 'Config endpoint', value: '/api/config/v2' },
  { label: 'Version check', value: '/api/versioncheck/v3' },
  { label: 'Heartbeat', value: '30 seconds' },
  { label: 'Authentication', value: 'Enabled' },
  { label: 'Custom rooms', value: 'Enabled' },
  { label: 'Player profiles', value: 'Enabled' },
];

const steps = [
  {
    num: '01',
    title: 'Get the original client',
    desc: 'Find the original 2020 Rec Room APK or IPA. Do not use the current version from the app store.',
  },
  {
    num: '02',
    title: 'Redirect traffic',
    desc: 'Patch your hosts file or use our redirect tool to send rec.net traffic to our server.',
  },
  {
    num: '03',
    title: 'Log in and play',
    desc: 'Open the app, log in, and your rooms, profile, and friends will all be there.',
  },
];

const galleryImages = [
  {
    src: 'https://images.squarespace-cdn.com/content/v1/582e7271bebafbd72792bd97/1614738330911-XGN30V4D515BJN4SXGCW/RecRoom_Fantasy.png',
    alt: 'Rec Room Fantasy',
  },
  {
    src: 'https://images.squarespace-cdn.com/content/v1/582e7271bebafbd72792bd97/1614738386082-MZ6CCR5UN99BZM793563/RecRoom_Creator.png',
    alt: 'Rec Room Creator',
  },
  {
    src: 'https://i.ytimg.com/vi/x8WeiOfXE20/maxresdefault.jpg',
    alt: 'Rec Room 2020',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            alt=""
            className="w-full h-full object-cover opacity-50"
            src="https://images.squarespace-cdn.com/content/v1/582e7271bebafbd72792bd97/1614738222048-XI1C34HABCEELIDIH9X7/RecRoom_Hangout.png"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        </div>

        {/* Glow blob */}
        <div
          className="absolute left-1/2 rounded-full pointer-events-none"
          style={{
            top: '33%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            background: 'hsl(var(--primary) / 0.12)',
            filter: 'blur(120px)',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Live badge */}
          <div
            className="inline-flex items-center gap-2 bg-primary text-white pl-3 pr-4 py-1.5 rounded-full text-sm font-bold mb-8"
            style={{ boxShadow: '0 8px 24px hsl(var(--primary) / 0.25)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Server is live
          </div>

          {/* Heading */}
          <h1
            className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6 bloom-text"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            The <span className="text-primary bloom-text">2020 Build</span> is back.
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            A community-run server bringing back the original Rec Room from 2020. Custom rooms,
            full profiles, and the social vibe that made it special.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/instructions"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-base hover:opacity-90 transition-opacity"
              style={{ boxShadow: '0 12px 32px hsl(var(--primary) / 0.30)' }}
            >
              Play Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/have-fun"
              className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-8 py-4 rounded-full font-bold text-base hover:border-primary/50 transition-colors"
            >
              Have Fun
            </Link>
          </div>
        </div>

        {/* Gallery row */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 mt-16 grid grid-cols-3 gap-3">
          {galleryImages.map((img) => (
            <div
              key={img.src}
              className="relative overflow-hidden rounded-2xl border border-border/60 aspect-video shadow-xl"
            >
              <img
                alt={img.alt}
                className="w-full h-full object-cover opacity-95 hover:opacity-100 transition-opacity"
                src={img.src}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/20 to-transparent" />
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO'S ONLINE ── */}
      <section className="py-10 px-6">
        <div className="max-w-sm mx-auto">
          <PlayersOnline />
        </div>
      </section>

      {/* ── VIDEO ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 bg-primary/15 text-primary px-3 py-1 rounded-full text-sm font-bold mb-4">
                Watch
              </span>
              <h2 className="text-4xl md:text-5xl font-black bloom-text">The original trailer</h2>
              <p className="text-muted-foreground mt-3 text-base max-w-xl mx-auto">
                This is what we are bringing back. The 2020 Rec Room — before everything changed.
              </p>
            </div>
          </Reveal>

          <Reveal from="scale" delay={100}>
            <div className="overflow-hidden rounded-3xl border border-border shadow-2xl aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/mcX-SQ2IS7M"
                title="Rec Room 2020 Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-28 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-5">
            <Reveal>
              <div>
                <span className="inline-flex items-center gap-2 bg-primary/15 text-primary px-3 py-1 rounded-full text-sm font-bold mb-3">
                  What this is
                </span>
                <h2 className="text-4xl md:text-5xl font-black leading-tight bloom-text">
                  Fan-built. Free. Forever.
                </h2>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Against Gravity changed Rec Room a lot over the years. We wanted to preserve the
                version that felt most like home — the 2020 build with its original rooms, community
                energy, and features that got removed.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This is not official. It is run by fans, for fans, completely free. We just want to
                keep playing the game we loved.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex gap-6 pt-2">
                {[
                  { value: '2020', label: 'Original client' },
                  { value: 'Free', label: 'Always' },
                  { value: 'Fan-run', label: 'Community' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-black text-primary">{value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right — image */}
          <Reveal from="right">
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-border shadow-2xl">
                <img
                  alt="Rec Room avatars"
                  className="w-full h-auto"
                  src="https://images.squarespace-cdn.com/content/v1/5fa5929d1cf2d45763f942cf/1604686978557-V363LPX7A4TUKLCMZUEA/image4.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent rounded-3xl" />
                <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-2xl px-4 py-2.5">
                  <p className="text-sm font-bold">Original 2020 avatars</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-6 bg-card/40 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 bg-primary/15 text-primary px-3 py-1 rounded-full text-sm font-bold mb-4">
                What works
              </span>
              <h2 className="text-4xl md:text-5xl font-black bloom-text">
                Everything that mattered.
              </h2>
              <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">
                The core of the 2020 experience is working. Here is what is live.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="bg-background border border-border rounded-3xl p-6 hover:border-primary/40 transition-colors h-full">
                  <div className="text-primary mb-4">{f.icon}</div>
                  <h3 className="font-black text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVER DETAILS ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg">Server details</h3>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    For connecting the 2020 client
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-500 text-sm px-3 py-1.5 rounded-full font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Online
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {serverDetails.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-8 py-4">
                    <span className="text-muted-foreground text-sm">{label}</span>
                    <span className="font-bold text-sm font-mono text-primary">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── GET CONNECTED ── */}
      <section id="connect" className="py-28 px-6 bg-card/40 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="mb-12">
              <span className="inline-flex items-center gap-2 bg-primary/15 text-primary px-3 py-1 rounded-full text-sm font-bold mb-4">
                Get connected
              </span>
              <h2 className="text-4xl md:text-5xl font-black bloom-text">
                Ready to jump back in?
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mt-4">
                You need the original 2020 Rec Room client. Once you have it, point it at our server
                and you are done.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 text-left">
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 80}>
                <div className="bg-background border border-border rounded-3xl p-6 h-full">
                  <div
                    className="text-5xl font-black mb-3 leading-none"
                    style={{ color: 'hsl(var(--primary) / 0.2)' }}
                  >
                    {s.num}
                  </div>
                  <h3 className="font-black text-base mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
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
