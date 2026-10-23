"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
} from "@veedu/ui";
import { accountSchema } from "@veedu/domain";
import type { Account } from "@veedu/types";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/shared/states";
import { RowActions } from "@/components/shared/row-actions";
import { useHouseholdData } from "@/lib/data";

type Values = z.infer<typeof accountSchema>;

function AccountsInner() {
  const search = useSearchParams();
  const { accounts, addAccount, updateAccount, archiveAccount } =
    useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const [editing, setEditing] = useState<Account | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      institution: "",
      nickname: "",
      account_type: "Current",
      reference: "",
      last_four: "",
      visibility: "shared",
      notes: "",
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({
      institution: "",
      nickname: "",
      account_type: "Current",
      reference: "",
      last_four: "",
      visibility: "shared",
      notes: "",
    });
    setOpen(true);
  }

  function openEdit(a: Account) {
    setEditing(a);
    form.reset({
      institution: a.institution,
      nickname: a.nickname,
      account_type: a.account_type,
      reference: a.reference ?? "",
      last_four: a.last_four ?? "",
      visibility: a.visibility,
      notes: a.notes ?? "",
    });
    setOpen(true);
  }

  if (accounts.isLoading)
    return (
      <PageContainer title="Accounts">
        <LoadingBlock />
      </PageContainer>
    );
  if (accounts.isError)
    return (
      <PageContainer title="Accounts">
        <ErrorState onRetry={() => void accounts.refetch()} />
      </PageContainer>
    );

  return (
    <PageContainer
      title="Accounts"
      description="Reference information only — never passwords, PINs, CVVs, or OTPs"
      actions={<Button onClick={openCreate}>Add account</Button>}
    >
      <Card className="mb-4 border-info/20 bg-info-soft/40">
        <CardContent className="py-4 text-sm text-ink">
          Velan Illam is not a password manager. Store institution, nickname, type, and
          last four digits only.
        </CardContent>
      </Card>
      {(accounts.data ?? []).length === 0 ? (
        <EmptyState
          title="No accounts"
          actionLabel="Add account"
          onAction={openCreate}
        />
      ) : (
        <ul className="space-y-2">
          {(accounts.data ?? []).map((a) => (
            <li key={a.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{a.institution}</p>
                    <p className="text-xs text-muted">
                      {a.nickname} · {a.account_type} · •••• {a.last_four || "----"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{a.visibility}</Badge>
                    <RowActions
                      onEdit={() => openEdit(a)}
                      onArchive={() => void archiveAccount.mutateAsync(a.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit account" : "Add account"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              if (editing) {
                await updateAccount.mutateAsync({ id: editing.id, patch: values });
              } else {
                await addAccount.mutateAsync(values);
              }
              setOpen(false);
              setEditing(null);
              form.reset();
            })}
          >
            <Input label="Institution" {...form.register("institution")} />
            <Input label="Nickname" {...form.register("nickname")} />
            <Select
              label="Type"
              value={form.watch("account_type")}
              onValueChange={(v) => form.setValue("account_type", v)}
              options={[
                { value: "Current", label: "Current" },
                { value: "Savings", label: "Savings" },
                { value: "Credit", label: "Credit" },
                { value: "Investment", label: "Investment" },
              ]}
            />
            <Input
              label="Last 4 digits"
              maxLength={4}
              {...form.register("last_four")}
              hint="Optional · never store full number or secrets"
            />
            <Input label="Notes" {...form.register("notes")} />
            <Button type="submit" className="w-full">
              {editing ? "Save changes" : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer title="Accounts">
          <LoadingBlock />
        </PageContainer>
      }
    >
      <AccountsInner />
    </Suspense>
  );
}
