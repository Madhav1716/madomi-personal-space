'use client';

import { useState } from 'react';

export default function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <button
      onClick={doCopy}
      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}


