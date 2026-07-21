"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";

type VisionWizardProps = {
  onComplete: (data: {
    title: string;
    idea: string;
    problem: string;
    finalScene: string;
    targetUsers: string;
    technologies: string;
    teamRequired: string;
    investmentNeeded: string;
    spiritualBase: string;
    visionType: string;
  }) => void;
  isLoading?: boolean;
};

export function VisionWizard({ onComplete, isLoading }: VisionWizardProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    title: "",
    idea: "",
    problem: "",
    finalScene: "",
    targetUsers: "",
    technologies: "",
    teamRequired: "",
    investmentNeeded: "",
    spiritualBase: "",
    visionType: "INVENTION"
  });

  const VISION_TYPES = [
    { value: "INVENTION", label: t.visionTypes.invention },
    { value: "TECHNOLOGY", label: t.visionTypes.technology },
    { value: "BUSINESS", label: t.visionTypes.business },
    { value: "BOOK", label: t.visionTypes.book },
    { value: "SPIRITUAL", label: t.visionTypes.spiritual },
    { value: "PERSONAL", label: t.visionTypes.personal }
  ];

  const steps = [
    { label: t.wizard.stepName, field: "title" as const, placeholder: t.wizard.namePlaceholder, type: "input" },
    { label: t.wizard.stepIdea, field: "idea" as const, placeholder: t.wizard.ideaPlaceholder, type: "textarea" },
    { label: t.wizard.stepProblem, field: "problem" as const, placeholder: t.wizard.problemPlaceholder, type: "textarea" },
    { label: t.wizard.stepScene, field: "finalScene" as const, placeholder: t.wizard.scenePlaceholder, type: "textarea" },
    { label: t.wizard.stepUsers, field: "targetUsers" as const, placeholder: t.wizard.usersPlaceholder, type: "textarea" },
    { label: t.wizard.stepTech, field: "technologies" as const, placeholder: t.wizard.techPlaceholder, type: "textarea" },
    { label: t.wizard.stepTeam, field: "teamRequired" as const, placeholder: t.wizard.teamPlaceholder, type: "textarea" },
    { label: t.wizard.stepInvest, field: "investmentNeeded" as const, placeholder: t.wizard.investPlaceholder, type: "textarea" },
    { label: t.wizard.stepFaith, field: "spiritualBase" as const, placeholder: t.wizard.faithPlaceholder, type: "textarea" }
  ];

  const current = steps[step];

  function update(field: string, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function next() {
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete(data);
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="rounded-lg border border-futura-glow/20 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="text-futura-glow" size={20} />
        <h2 className="text-lg font-bold text-msm-ink">{t.wizard.title}</h2>
        <span className="ml-auto text-xs font-semibold text-slate-400">
          {t.wizard.step} {step + 1} / {steps.length}
        </span>
      </div>

      <div className="mb-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-futura-glow to-futura-mint transition-all duration-300"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="mb-2">
        <Badge className="bg-futura-glow/10 text-futura-glow border-futura-glow/20">{current.label}</Badge>
      </div>

      <div className="mb-2">
        <Select value={data.visionType} onChange={(e) => update("visionType", e.target.value)}>
          {VISION_TYPES.map((vt) => (
            <option key={vt.value} value={vt.value}>{vt.label}</option>
          ))}
        </Select>
      </div>

      {current.type === "input" ? (
        <Input
          value={data[current.field]}
          onChange={(e) => update(current.field, e.target.value)}
          placeholder={current.placeholder}
          autoFocus
        />
      ) : (
        <Textarea
          value={data[current.field]}
          onChange={(e) => update(current.field, e.target.value)}
          placeholder={current.placeholder}
          rows={4}
          autoFocus
        />
      )}

      <div className="mt-5 flex items-center justify-between">
        <Button
          type="button"
          onClick={prev}
          disabled={step === 0}
          className="bg-slate-200 text-slate-600 shadow-none hover:bg-slate-300 hover:text-slate-800"
        >
          <ArrowLeft size={16} /> {t.wizard.previous}
        </Button>
        <Button type="button" onClick={next} disabled={isLoading}>
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : step === steps.length - 1 ? (
            <>{t.wizard.generate} <Sparkles size={16} /></>
          ) : (
            <>{t.wizard.next} <ArrowRight size={16} /></>
          )}
        </Button>
      </div>
    </div>
  );
}
