"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contactSchema } from "@veedu/domain";
import { CONTACT_CATEGORIES, type Contact } from "@veedu/types";
import type { ContactsView } from "@/components/contacts/contact-directory";
import { useHouseholdData } from "@/lib/data";

type Values = z.infer<typeof contactSchema>;

export function useContactsPage() {
  const search = useSearchParams();
  const { contacts, addContact, updateContact, archiveContact } =
    useHouseholdData();
  const [open, setOpen] = useState(search.get("new") === "1");
  const [editing, setEditing] = useState<Contact | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState<ContactsView>("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState<string>(CONTACT_CATEGORIES[0]);
  const form = useForm<Values>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      category: "Family",
      visibility: "shared",
      notes: "",
    },
  });

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (contacts.data ?? []).filter((c) => {
      if (category !== "All" && c.category !== category) return false;
      if (!query) return true;
      return (
        c.name.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        (c.email ?? "").toLowerCase().includes(query)
      );
    });
  }, [contacts.data, q, category]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function applyBulkCategory() {
    const ids = [...selectedIds];
    if (!ids.length) return;
    await Promise.all(
      ids.map((id) =>
        updateContact.mutateAsync({ id, patch: { category: bulkCategory } }),
      ),
    );
    setSelectedIds(new Set());
  }

  function openCreate() {
    setEditing(null);
    form.reset({
      name: "",
      phone: "",
      email: "",
      address: "",
      category: "Family",
      visibility: "shared",
      notes: "",
    });
    setOpen(true);
  }

  function openEdit(c: Contact) {
    setEditing(c);
    form.reset({
      name: c.name,
      phone: c.phone ?? "",
      email: c.email ?? "",
      address: c.address ?? "",
      category: c.category,
      visibility: c.visibility,
      notes: c.notes ?? "",
    });
    setOpen(true);
  }

  async function submitForm(values: Values) {
    const payload = { ...values, email: values.email || null };
    if (editing) {
      await updateContact.mutateAsync({ id: editing.id, patch: payload });
    } else {
      await addContact.mutateAsync(payload);
    }
    setOpen(false);
    setEditing(null);
    form.reset();
  }

  function closeForm() {
    setOpen(false);
    setEditing(null);
  }

  return {
    contacts,
    list,
    q,
    setQ,
    category,
    setCategory,
    view,
    setView,
    selectedIds,
    setSelectedIds,
    bulkCategory,
    setBulkCategory,
    open,
    editing,
    form,
    toggleSelect,
    applyBulkCategory,
    openCreate,
    openEdit,
    closeForm,
    submitForm,
    archiveContact,
  };
}
