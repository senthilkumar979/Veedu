"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { subscriptionSchema } from "@veedu/domain";
import { resolveCurrency, type Subscription } from "@veedu/types";
import { useHouseholdData } from "@/lib/data";
import { usePreferredCurrency } from "@/lib/use-preferred-currency";

type Values = z.infer<typeof subscriptionSchema>;

function emptyValues(currency: Values["currency"]): Values {
  return {
    name: "",
    provider: "",
    amount: 0,
    currency,
    billing_frequency: "monthly",
    next_renewal: "",
    category: "Entertainment",
    status: "active",
    visibility: "shared",
    payment_reference: "",
    notes: "",
  };
}

export function useSubscriptionsPage() {
  const search = useSearchParams();
  const preferredCurrency = usePreferredCurrency();
  const { subscriptions, addSubscription, updateSubscription, archiveSubscription } =
    useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const [editing, setEditing] = useState<Subscription | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: emptyValues(preferredCurrency),
  });

  const list = useMemo(
    () =>
      [...(subscriptions.data ?? [])].sort((a, b) =>
        a.next_renewal.localeCompare(b.next_renewal),
      ),
    [subscriptions.data],
  );

  const monthlyTotal = list
    .filter((s) => s.status === "active" && s.currency === preferredCurrency)
    .reduce((sum, s) => {
      const amount = Number(s.amount);
      if (s.billing_frequency === "yearly") return sum + amount / 12;
      if (s.billing_frequency === "quarterly") return sum + amount / 3;
      return sum + amount;
    }, 0);

  function openCreate() {
    setEditing(null);
    form.reset(emptyValues(preferredCurrency));
    setOpen(true);
  }

  function openEdit(s: Subscription) {
    setEditing(s);
    form.reset({
      name: s.name,
      provider: s.provider ?? "",
      amount: Number(s.amount),
      currency: resolveCurrency(s.currency),
      billing_frequency: s.billing_frequency,
      next_renewal: s.next_renewal,
      category: s.category ?? "Entertainment",
      status: s.status,
      visibility: s.visibility,
      payment_reference: s.payment_reference ?? "",
      notes: s.notes ?? "",
    });
    setOpen(true);
  }

  function closeForm() {
    setOpen(false);
    setEditing(null);
  }

  async function submitForm(values: Values) {
    if (editing) {
      await updateSubscription.mutateAsync({ id: editing.id, patch: values });
    } else {
      await addSubscription.mutateAsync(values);
    }
    closeForm();
    form.reset();
  }

  return {
    subscriptions,
    list,
    monthlyTotal,
    preferredCurrency,
    open,
    editing,
    form,
    openCreate,
    openEdit,
    closeForm,
    submitForm,
    archiveSubscription,
  };
}
