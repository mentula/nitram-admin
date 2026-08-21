import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/quote_/customs-clearance")({
  beforeLoad: () => {
    throw redirect({ to: "/assessment" });
  },
});
