"use client";

import { Button } from "@veedu/ui";

interface RowActionsProps {
  onEdit?: () => void;
  onArchive?: () => void;
  archiveLabel?: string;
  disabled?: boolean;
}

export function RowActions({
  onEdit,
  onArchive,
  archiveLabel = "Archive",
  disabled,
}: RowActionsProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1">
      {onEdit ? (
        <Button
          type="button"
          variant="ghost"
          className="h-12 px-3 text-sm"
          disabled={disabled}
          onClick={onEdit}
        >
          Edit
        </Button>
      ) : null}
      {onArchive ? (
        <Button
          type="button"
          variant="ghost"
          className="h-12 px-3 text-sm text-danger"
          disabled={disabled}
          onClick={onArchive}
        >
          {archiveLabel}
        </Button>
      ) : null}
    </div>
  );
}
