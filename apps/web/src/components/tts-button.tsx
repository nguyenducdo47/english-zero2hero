"use client";

type Props = { text: string; label?: string };

export function TtsButton({ text, label = "Nghe" }: Props) {
  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  };

  return (
    <button
      type="button"
      onClick={speak}
      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}
