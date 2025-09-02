"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RowAction<TData> {
  label: string;
  onClick?: (row: Row<TData>) => void;
  shortcut?: string;
  variant?: "default" | "destructive";
}

export interface RowActionSubmenu<TData> {
  title: string;
  options: { label: string; value: string }[];
  valueAccessor: (row: Row<TData>) => string | undefined; // to set current value
  onSelect?: (row: Row<TData>, value: string) => void;
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions?: RowAction<TData>[]; // simple actions
  submenus?: RowActionSubmenu<TData>[]; // grouped radio options
}

export function DataTableRowActions<TData>({
  row,
  actions = [],
  submenus = [],
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="data-[state=open]:bg-muted size-8"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {actions.map((action, idx) => (
          <DropdownMenuItem
            key={idx}
            onClick={() => action.onClick?.(row)}
            className={action.variant === "destructive" ? "text-red-600" : ""}
          >
            {action.label}
            {action.shortcut && (
              <span className="ml-auto text-xs text-muted-foreground">
                {action.shortcut}
              </span>
            )}
          </DropdownMenuItem>
        ))}

        {actions.length > 0 && submenus.length > 0 && <DropdownMenuSeparator />}

        {submenus.map((submenu, idx) => (
          <DropdownMenuSub key={idx}>
            <DropdownMenuSubTrigger>{submenu.title}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={submenu.valueAccessor(row)}>
                {submenu.options.map((opt) => (
                  <DropdownMenuRadioItem
                    key={opt.value}
                    value={opt.value}
                    onClick={() => submenu.onSelect?.(row, opt.value)}
                  >
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
