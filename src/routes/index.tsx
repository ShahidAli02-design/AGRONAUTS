import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Leaf } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AGRONAUTS | Traceable produce from Maharashtra farms to buyers" },
      {
        name: "description",
        content:
          "AGRONAUTS gives every harvest a batch ID that follows it through quality grading, storage, marketplace sale, delivery and farmer earnings.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: WelcomeIntro,
});

function WelcomeIntro() {
  const { lang } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 size-full object-cover"
        src="/landing.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40" />

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-10 text-center sm:py-14">
        <div className="flex items-center gap-2 font-bold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white text-black shadow-lg">
            <Leaf className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl tracking-tight font-black drop-shadow-sm">AGRONAUTS</span>
        </div>

        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          <button
            type="button"
            onClick={() => void navigate({ to: "/home" })}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black shadow-2xl transition-transform hover:scale-105 active:scale-95"
          >
            <span>{lang === "mr" ? "पुढे जा" : "Continue"}</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: "/home" })}
            className="text-[11px] font-medium text-white/60 hover:text-white/90 underline underline-offset-4"
          >
            {lang === "mr" ? "वगळा" : "Skip intro"}
          </button>
        </div>
      </div>
    </div>
  );
}
