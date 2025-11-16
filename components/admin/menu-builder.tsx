"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { UniqueIdentifier } from "@dnd-kit/core";

import type { NavItem } from "@/lib/services/settings-service";

interface MenuBuilderProps {
  name: string;
  initialItems: NavItem[];
}

interface InternalNavItem extends NavItem {
  id: UniqueIdentifier;
}

function createInternalItems(items: NavItem[]): InternalNavItem[] {
  if (!items || items.length === 0) {
    return [];
  }

  return items.map((item, index) => ({
    id: `item-${index}-${item.label ?? ""}`,
    label: item.label,
    url: item.url,
    external: item.external,
    children: item.children,
  }));
}

function toNavItems(items: InternalNavItem[]): NavItem[] {
  return items.map(({ id: _id, ...rest }) => rest);
}

interface SortableItemProps {
  item: InternalNavItem;
  index: number;
  onChange(partial: Partial<InternalNavItem>): void;
  onRemove(): void;
}

function SortableItem({ item, index, onChange, onRemove }: SortableItemProps) {
  // Using a simple layout without drag handles to keep implementation lean.
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-[var(--color-muted-foreground)]">Item {index + 1}</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-[0.7rem] text-red-600 hover:underline"
        >
          Remove
        </button>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="block text-[0.7rem] text-[var(--color-muted-foreground)]">Label</span>
          <input
            type="text"
            value={item.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className="h-8 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
          />
        </label>
        <label className="space-y-1">
          <span className="block text-[0.7rem] text-[var(--color-muted-foreground)]">URL</span>
          <input
            type="text"
            value={item.url}
            onChange={(e) => onChange({ url: e.target.value })}
            className="h-8 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
          />
        </label>
      </div>
      <label className="mt-2 flex items-center gap-2 text-[0.7rem] text-[var(--color-muted-foreground)]">
        <input
          type="checkbox"
          checked={Boolean(item.external)}
          onChange={(e) => onChange({ external: e.target.checked })}
          className="h-3 w-3 rounded border border-[var(--color-border)]"
        />
        Open in new tab / external
      </label>
    </div>
  );
}

export function MenuBuilder({ name, initialItems }: MenuBuilderProps) {
  const [items, setItems] = useState<InternalNavItem[]>(() =>
    createInternalItems(initialItems ?? []),
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: { active: { id: UniqueIdentifier }; over: { id: UniqueIdentifier } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;
    setItems((current) => arrayMove(current, oldIndex, newIndex));
  };

  const handleAdd = () => {
    const nextIndex = items.length + 1;
    setItems((current) => [
      ...current,
      {
        id: `item-${nextIndex}-${Date.now()}`,
        label: "New item",
        url: "#",
        external: false,
      },
    ]);
  };

  const handleChange = (index: number, partial: Partial<InternalNavItem>) => {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...partial } : item)),
    );
  };

  const handleRemove = (index: number) => {
    setItems((current) => current.filter((_, i) => i !== index));
  };

  const serialized = JSON.stringify(toNavItems(items));

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={serialized} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)]">
                No navigation items yet. Use “Add item” to create your first link.
              </p>
            ) : (
              items.map((item, index) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  index={index}
                  onChange={(partial) => handleChange(index, partial)}
                  onRemove={() => handleRemove(index)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-muted)]/10"
      >
        Add item
      </button>
    </div>
  );
}
