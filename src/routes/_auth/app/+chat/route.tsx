import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/app/+chat")({
  component: ChatLayout,
});

function ChatLayout() {
  return <Outlet />;
}
