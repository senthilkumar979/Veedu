"use client";

import { Badge } from "@veedu/ui";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { useAuth } from "@/lib/auth";
import { useHouseholdData } from "@/lib/data";

export default function FamilyPage() {
  const { household } = useAuth();
  const { members } = useHouseholdData();

  if (members.isLoading)
    return (
      <PageContainer title="Family">
        <LoadingBlock />
      </PageContainer>
    );
  if (members.isError)
    return (
      <PageContainer title="Family">
        <ErrorState onRetry={() => void members.refetch()} />
      </PageContainer>
    );

  const list = members.data ?? [];

  return (
    <PageContainer className="gap-0">
      <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary via-[#355747] to-[#2c4a3c] px-5 py-7 text-white shadow-card sm:px-8">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/70">
          Household
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {household?.name ?? "Family"}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/80">
          {list.length} member{list.length === 1 ? "" : "s"} sharing this home.
          Profiles are managed by your household owner — invites are disabled.
        </p>
      </section>

      {list.length === 0 ? (
        <EmptyState title="No members loaded" />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => {
            const name =
              m.display_name || m.profiles?.full_name || "Member";
            const initials = name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <li
                key={m.id}
                className="rounded-2xl border border-border bg-surface p-5 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-ink">
                      {name}
                    </p>
                    <p className="truncate text-sm text-muted">
                      {m.profiles?.email || "No email"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="primary">{m.role}</Badge>
                      <Badge tone="neutral">{m.status}</Badge>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PageContainer>
  );
}
