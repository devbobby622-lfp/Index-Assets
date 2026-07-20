import { ExternalLink, Archive, HelpCircle, FileText } from 'lucide-react';

const resources = [
  {
    icon: <Archive className="w-6 h-6" />,
    title: 'Recagain Archive',
    desc: 'A full archive of community-created content, rooms, and experiences from the 2020 era. Browse and relive the memories.',
    link: '#',
    linkLabel: 'Browse Archive',
  },
  {
    icon: <HelpCircle className="w-6 h-6" />,
    title: 'Setup Help',
    desc: 'Having trouble connecting your 2020 client to our server? Check the setup guide for step-by-step instructions.',
    link: '/instructions',
    linkLabel: 'View Guide',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'FAQ',
    desc: 'Common questions answered — from client compatibility to account issues and everything in between.',
    link: '#',
    linkLabel: 'Read FAQ',
  },
];

export default function Support() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-primary/15 text-primary px-3 py-1 rounded-full text-sm font-bold mb-4">
              Support
            </span>
            <h1 className="text-5xl md:text-6xl font-black bloom-text mb-4">
              Support & <span className="text-primary">Recagain</span> archive
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Resources for getting connected and exploring the preserved history of the 2020
              Rec Room community.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {resources.map((r) => (
              <div
                key={r.title}
                className="bg-card border border-border rounded-3xl p-6 flex flex-col"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
              >
                <div className="text-primary mb-4">{r.icon}</div>
                <h3 className="font-black text-lg mb-3">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{r.desc}</p>
                <a
                  href={r.link}
                  className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:opacity-80 transition-opacity"
                >
                  {r.linkLabel} <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          {/* Archive section */}
          <div className="mt-16 bg-card/40 border border-border rounded-3xl overflow-hidden">
            {/* recroom.baby banner */}
            <a
              href="https://recroom.baby"
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group"
            >
              <div className="relative overflow-hidden bg-black">
                <img
                  src="https://recroom.baby/_image?href=%2F_astro%2Flogo-tenwholeyears.BFU_t7QU.png&w=1200&h=869&f=webp"
                  alt="Rec Room Baby — Ten Whole Years"
                  className="w-full h-auto max-h-64 object-contain mx-auto group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <span className="bg-primary text-white text-xs font-black px-3 py-1 rounded-full">
                    Visit Archive
                  </span>
                  <span className="text-white font-bold text-sm drop-shadow">recroom.baby</span>
                </div>
              </div>
            </a>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Archive className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-black">About the Recagain Archive</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <a
                  href="https://recroom.baby"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-bold hover:opacity-80 transition-opacity"
                >
                  recroom.baby
                </a>{' '}
                is a community project dedicated to preserving and documenting the history of Rec
                Room from its early days through the 2020 era. The archive contains thousands of
                room exports, player profiles, screenshots, and community-created content that
                would otherwise be lost.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We are hosting a mirror of the Recagain archive and working to make it fully
                searchable and browsable. If you have content to contribute, reach out via Discord.
              </p>
              <a
                href="https://recroom.baby"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
                style={{ boxShadow: '0 8px 24px hsl(var(--primary) / 0.25)' }}
              >
                Visit recroom.baby
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
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
