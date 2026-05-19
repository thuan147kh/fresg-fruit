import { createFileRoute } from "@tanstack/react-router";
import { InventoryPage } from "@/components/inventory/InventoryPage";

export const Route = createFileRoute("/inventory/import")({
  head: () => ({
    meta: [
      { title: "Nhập kho — Xus Admin" },
      { name: "description", content: "Quản lý phiếu nhập kho hàng hóa." },
    ],
  }),
  component: () => (
    <InventoryPage
      type="import"
      title="Nhập kho"
      description="Tạo và duyệt phiếu nhập kho từ nhà cung cấp."
    />
  ),
});
