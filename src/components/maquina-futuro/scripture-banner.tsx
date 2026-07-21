import { BookOpen, Sparkles } from "lucide-react";

type ScriptureBannerProps = {
  title?: string;
  verses?: Array<{ ref: string; text: string }>;
};

const DEFAULT_VERSES = [
  { ref: "Genesis 1:1", text: "In the beginning God created the heavens and the earth." },
  { ref: "Habakkuk 2:2", text: "Write the vision and make it plain on tablets, that he may run who reads it." },
  { ref: "Jeremiah 33:3", text: "Call to Me, and I will answer you, and show you great and mighty things, which you do not know." },
  { ref: "John 3:12", text: "If I have told you earthly things, and you do not believe, how will you believe if I tell you heavenly things?" }
];

export function ScriptureBanner({ title = "Biblical Foundation of the Project", verses = DEFAULT_VERSES }: ScriptureBannerProps) {
  return (
    <section className="rounded-lg border border-futura-glow/20 bg-gradient-to-r from-futura-void via-futura-deep to-futura-void p-5">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="text-futura-ember" size={20} />
        <h3 className="text-sm font-bold text-futura-ember uppercase tracking-wider">{title}</h3>
        <Sparkles className="text-futura-aura" size={16} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {verses.map((s) => (
          <article key={s.ref} className="rounded-md border border-futura-glow/10 bg-futura-cosmic/50 p-3">
            <p className="text-xs font-bold text-futura-aura">{s.ref}</p>
            <p className="mt-1 text-sm leading-5 text-futura-frost/80 italic">&ldquo;{s.text}&rdquo;</p>
          </article>
        ))}
      </div>
    </section>
  );
}
