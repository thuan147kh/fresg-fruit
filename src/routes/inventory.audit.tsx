import { createFileRoute } from "@tanstack/react-router";
import { InventoryPage } from "@/components/inventory/InventoryPage";

export const Route = createFileRoute("/inventory/audit")({
  head: () => ({
    meta: [
      { title: "Kiểm kho — Xus Admin" },
      { name: "description", content: "Kiểm kê hàng tồn và cảnh báo hàng sắp hết hạn." },
    ],
  }),
  component: () => (
    <InventoryPage
      type="audit"
      title="Kiểm kho"
      description="Kiểm kê và cảnh báo hàng sắp hết hạn."
    />
  ),
});
