import { createFileRoute } from "@tanstack/react-router";
import { InventoryPage } from "@/components/inventory/InventoryPage";

export const Route = createFileRoute("/inventory/destroy")({
  head: () => ({
    meta: [
      { title: "Xuất hủy — Xus Admin" },
      { name: "description", content: "Quản lý phiếu xuất hủy hàng hỏng/hết hạn." },
    ],
  }),
  component: () => (
    <InventoryPage type="destroy" title="Xuất hủy" description="Xuất hủy hàng hỏng, hết hạn." />
  ),
});
