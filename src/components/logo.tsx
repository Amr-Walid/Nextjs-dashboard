export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-pink to-neon-blue text-white font-black text-base flex-shrink-0 shadow-glow-pink border border-white/20">
        AW
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[15px] font-black text-content tracking-tighter uppercase italic">
          AdventureWorks
        </span>
        <span className="text-[10px] font-bold text-neon-blue uppercase tracking-widest mt-1">
          Analytics Dashboard
        </span>
      </div>
    </div>
  );
}
