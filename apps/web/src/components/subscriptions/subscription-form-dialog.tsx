"use client";

import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
} from "@veedu/ui";
import { subscriptionSchema } from "@veedu/domain";
import { CurrencySelect } from "@/components/shared/currency-select";

type Values = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormDialogProps {
  open: boolean;
  editing: boolean;
  form: UseFormReturn<Values>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Values) => Promise<void>;
}

export function SubscriptionFormDialog({
  open,
  editing,
  form,
  onOpenChange,
  onSubmit,
}: SubscriptionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit subscription" : "Add subscription"}
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((values) => void onSubmit(values))}
        >
          <Input label="Name" {...form.register("name")} />
          <Input label="Provider" {...form.register("provider")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              {...form.register("amount")}
            />
            <CurrencySelect
              value={form.watch("currency")}
              onValueChange={(v) => form.setValue("currency", v)}
            />
          </div>
          <Input
            label="Next renewal"
            type="date"
            {...form.register("next_renewal")}
          />
          <Select
            label="Billing frequency"
            value={form.watch("billing_frequency")}
            onValueChange={(v) =>
              form.setValue(
                "billing_frequency",
                v as Values["billing_frequency"],
              )
            }
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
              { value: "quarterly", label: "Quarterly" },
            ]}
          />
          <Button type="submit" className="w-full">
            {editing ? "Save changes" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
