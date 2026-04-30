import React from "react";

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 bg-black text-white h-screen overflow-y-auto px-16 py-20 z-10 w-full absolute inset-0">
      <div className="max-w-[720px] mx-auto">
        {children}
      </div>
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <div className="text-[13px] font-medium text-[#666] mb-8 flex items-center gap-2 flex-wrap">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {item.onClick ? (
            <span
              onClick={item.onClick}
              className="cursor-pointer hover:text-white transition-colors"
            >
              {item.label}
            </span>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="text-[#333]">/</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export function PageHeader({ icon, title, sub }: { icon?: string; title: string; sub?: React.ReactNode }) {
  return (
    <div className="mb-12 border-b border-[#333] pb-8">
      <div className="text-[40px] font-bold text-white tracking-tight mb-2 flex items-center gap-3">
        {icon && <span className="grayscale">{icon}</span>}
        {title}
      </div>
      {sub && <div className="text-[15px] text-[#888] font-medium">{sub}</div>}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] font-semibold text-[#666] uppercase tracking-[0.2em] mb-4">
      {children}
    </div>
  );
}

export function Divider() {
  return <hr className="border-none border-t border-[#333] my-8" />;
}

export function Chip({ children, size = "md", verified = false }: { children: React.ReactNode; size?: "sm" | "md"; verified?: boolean }) {
  const base = "inline-flex items-center justify-center border rounded-[3px] ";
  const sizeClass = size === "sm" ? "text-[11px] px-1.5 py-[1px]" : "text-[12px] px-2 py-0.5";
  const colors = verified
    ? "bg-white text-black border-white font-medium"
    : "bg-transparent text-[#888] border-[#333]";

  return (
    <span className={`${base} ${sizeClass} ${colors}`}>
      {children}
    </span>
  );
}
