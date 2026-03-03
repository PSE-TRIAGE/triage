import type { ReactNode } from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export function DndTestWrapper({
  children,
  items = [1],
}: {
  children: ReactNode;
  items?: number[];
}) {
  return (
    <DndContext onDragEnd={() => {}}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
