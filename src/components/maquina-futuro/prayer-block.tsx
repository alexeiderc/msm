import { Flame, Heart } from "lucide-react";

type PrayerBlockProps = {
  title?: string;
  text?: string;
  seal?: string;
};

const DEFAULT_TEXT = "Beloved Father, in the powerful name of Jesus, we consecrate this project called THE MACHINE OF THE FUTURE. We declare that all technology, all artificial intelligence, all programming, all design, all connections, and all correct investment align with wisdom, truth, humility, excellence, and purpose. May this project not be for vanity, but to inspire, teach, create, visualize, order ideas, raise inventors, unite correct people, and open a new era of inventions guided by purpose. We declare that correct programmers, correct investors, correct engineers, correct designers, correct scientists, correct legal advisors, correct pilot clients, correct emails, correct meetings, and correct doors are arriving. Everything under obedience, order, transparency, security, and glory to God. Amen.";

export function PrayerBlock({ title = "Anointing Prayer", text = DEFAULT_TEXT, seal = "Seal 369: vision, word, and ordered manifestation" }: PrayerBlockProps) {
  return (
    <section className="rounded-lg border border-futura-pulse/20 bg-gradient-to-br from-futura-void to-futura-deep p-5">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="text-futura-pulse" size={20} />
        <h3 className="text-sm font-bold text-futura-pulse uppercase tracking-wider">{title}</h3>
      </div>
      <blockquote className="text-sm leading-6 text-futura-frost/80 italic">
        {text}
      </blockquote>
      <div className="mt-3 flex items-center gap-2 text-xs text-futura-aura">
        <Heart size={14} />
        <span className="font-semibold">{seal}</span>
      </div>
    </section>
  );
}
