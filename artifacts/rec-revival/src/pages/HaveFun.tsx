import { Link } from 'wouter';
import { Gamepad2, Music, Users, Trophy } from 'lucide-react';

const activities = [
  {
    icon: <Gamepad2 className="w-8 h-8" />,
    title: 'Mini Games',
    desc: 'Paintball, Laser Tag, Disc Golf — all the classics are back exactly as they were.',
  },
  {
    icon: <Music className="w-8 h-8" />,
    title: 'The Rec Center',
    desc: 'Hang out in the original lobby, listen to music, and catch up with old friends.',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Social Spaces',
    desc: 'Custom player rooms, dorm rooms, and the original hangout spaces are all here.',
  },
  {
    icon: <Trophy className="w-8 h-8" />,
    title: 'Competitions',
    desc: 'Community-run tournaments and events are scheduled regularly. Check back often.',
  },
];

export default function HaveFun() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      {/* Hero */}
      <section className="py-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-primary/15 text-primary px-3 py-1 rounded-full text-sm font-bold mb-6">
            Have Fun
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight bloom-text mb-6">
            What can you <span className="text-primary">do here?</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-10">
            Everything you loved in 2020 is waiting for you. From mini games to player-made rooms,
            the full experience is live.
          </p>
          <Link
            href="/instructions"
            className="inline-flex items-center justify-center bg-primary text-white px-8 py-4 rounded-full font-bold text-base hover:opacity-90 transition-opacity"
            style={{ boxShadow: '0 12px 32px hsl(var(--primary) / 0.30)' }}
          >
            Start Playing
          </Link>
        </div>
      </section>

      {/* Activities grid */}
      <section className="py-16 px-6 bg-card/40 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-5">
            {activities.map((a) => (
              <div
                key={a.title}
                className="bg-background border border-border rounded-3xl p-8 hover:border-primary/40 transition-colors"
              >
                <div className="text-primary mb-5">{a.icon}</div>
                <h3 className="font-black text-xl mb-3">{a.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6 mt-auto">
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
