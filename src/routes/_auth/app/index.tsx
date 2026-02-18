import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_auth/app/")({
  component: AppLandingPage,
});

function AppLandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold tracking-tight">text-reader</h1>
        <div className="flex gap-4">
          <Button render={<Link to="/app/chat" />} size="lg">
            Chat
          </Button>
          <Button render={<Link to="/app/reader" />} variant="outline" size="lg">
            Read Aloud
          </Button>
        </div>
      </div>
    </div>
  );
}
