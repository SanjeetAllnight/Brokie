export default function TopAppBar() {
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-md flex items-center justify-between px-container-padding py-base shadow-sm">
      <div className="flex flex-col">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Good Morning 👋</span>
        <span className="font-headline-md text-headline-md font-bold text-primary">Brokie</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:opacity-80 transition-opacity duration-200">
          <span className="material-symbols-outlined text-primary">notifications</span>
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
          <img className="w-full h-full object-cover" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPcXMG5lKpofrsQQ9Qkzyx7f5oDigxagkNQzO2Lp1Rl62wnBrIdBaHNweXo8Soqhy2CccPvaHZ_kM2TUL9W5wbn206_Oq1NC56S8bSKtjwX1z7vR_pkGd-Uykd08fxpAK1uUU0UHmFaHO4-MDtzy7ltTf79rFgUpVHMABbbB62gs8J3veyGjZ13xIpwKBzM5_0l7GFTjF0A2FDjKEStr7ov_QIfkGbUMpIOLi5z8XebUjAEEMU6m4b5g" />
        </div>
      </div>
    </header>
  );
}
