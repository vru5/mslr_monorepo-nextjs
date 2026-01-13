import { ShieldCheck } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="w-full border-t bg-slate-50/50 py-8 mt-auto">
      <div className="container flex flex-col items-center justify-center gap-2 text-center">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          <span>Official Shangri-La Government Portal</span>
        </div>
        <p className="text-sm text-muted-foreground/70">
          © {new Date().getFullYear()} Election Commission. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;