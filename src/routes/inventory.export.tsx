import { createFileRoute } from "@tanstack/react-router";
import { InventoryPage } from "@/components/inventory/InventoryPage";

export const Route = createFileRoute("/inventory/export")({
  head: () => ({
    meta: [
      { title: "Xuất kho — Xus Admin" },
      { name: "description", content: "Quản lý phiếu xuất kho." },
    ],
  }),
  component: () => (
    <InventoryPage type="export" title="Xuất kho" description="Xuất kho theo đơn hoặc nội bộ." />
  ),
});
