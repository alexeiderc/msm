"use client";

import { Lock, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";

type InvestorRoomProps = {
  roomName: string;
  summary?: string;
  pitchText?: string;
  accessToken?: string;
  status: string;
  targetRaise?: number;
  currency?: string;
};

export function InvestorRoom({ roomName, summary, pitchText, accessToken, status, targetRaise, currency }: InvestorRoomProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  function copyLink() {
    if (!accessToken) return;
    const url = `${window.location.origin}/investors/${accessToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-msm-blue/20 bg-gradient-to-br from-msm-midnight to-futura-deep p-5 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="text-futura-ember" size={20} />
        <h3 className="text-sm font-bold text-futura-ember uppercase tracking-wider">{t.investorRoom.title}</h3>
        <Badge className="bg-white/10 text-white border-white/20 ml-auto">{status}</Badge>
      </div>

      <h2 className="text-xl font-black mb-2">{roomName}</h2>

      {summary && <p className="text-sm text-white/70 mb-4">{summary}</p>}

      {targetRaise && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-white/50">{t.investorRoom.goal}:</span>
          <span className="text-lg font-bold text-futura-ember">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: currency ?? "USD" }).format(targetRaise)}
          </span>
        </div>
      )}

      {accessToken && (
        <div className="flex items-center gap-2 mb-4">
          <Button onClick={copyLink} className="bg-futura-glow shadow-none text-xs">
            <Copy size={14} /> {copied ? t.investorRoom.copied : t.investorRoom.copyLink}
          </Button>
          <a
            href={`/investors/${accessToken}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white"
          >
            {t.investorRoom.viewPublic} <ExternalLink size={13} />
          </a>
        </div>
      )}

      {pitchText && (
        <div className="mt-4 rounded-md bg-white/5 p-4 text-sm leading-6 text-white/80 whitespace-pre-wrap max-h-64 overflow-y-auto">
          {pitchText}
        </div>
      )}
    </div>
  );
}
