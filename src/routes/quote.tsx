import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/quote")({
  beforeLoad: () => {
    throw redirect({ to: "/assessment" });
  },
});
