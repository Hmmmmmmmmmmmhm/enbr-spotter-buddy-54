import { Plane } from "lucide-react";

export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <Plane className="h-8 w-8 text-primary animate-radar-pulse" />
        <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-ping"></div>
      </div>
      <p className="mt-4 text-muted-foreground animate-pulse">
        Scanning for special aircraft...
      </p>
    </div>
  );
};