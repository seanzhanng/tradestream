"use client";

import BackgroundGlow from "@/components/layout/BackgroundGlow";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import WatchlistSettings from "@/components/watchlist/WatchlistSettings";

export default function WatchlistPage() {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <BackgroundGlow />

      <Sidebar activeItem="Watchlist" />

      <main className="flex flex-1 flex-col px-6 py-6">
        <TopBar />

        <section className="mt-5 flex flex-1 gap-5 overflow-hidden">
          <div className="flex flex-1 flex-col gap-4 overflow-hidden">
            <WatchlistSettings />
          </div>
        </section>
      </main>
    </div>
  );
}
