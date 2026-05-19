import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryFormDialog({ open, onOpenChange }: Props) {
  const adminUser = useAppStore((s) => s.adminUser);
  const products = useAppStore((s) => s.products);
  const addCategory = useAppStore((s) => s.addCategory);

  const [name, setName] = useState("");
  const [picker, setPicker] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName("");
      setSelected([]);
    }
  }, [open]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = () => {
    if (!name) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }
    addCategory({
      id: `c-${Date.now()}`,
      name,
      createdBy: adminUser,
      productCount: selected.length,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    toast.success("Tạo danh mục thành công");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo danh mục</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên danh mục *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rau hữu cơ"
              />
            </div>
            <div className="space-y-2">
              <Label>Người tạo</Label>
              <Input value={adminUser} disabled />
            </div>
            <div className="space-y-2">
              <Label>Sản phẩm thuộc danh mục</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setPicker(true)}
              >
                <Plus className="size-4" /> Thêm sản phẩm ({selected.length} đã chọn)
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={submit}>Tạo danh mục</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={picker} onOpenChange={setPicker}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chọn sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {products.map((p) => (
              <Label
                key={p.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-border cursor-pointer hover:bg-muted/40"
              >
                <Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
                <img src={p.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"} className="size-9 rounded object-cover" alt="" />
                <div className="flex-1 text-sm font-medium">{p.name}</div>
              </Label>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setPicker(false)}>Xong ({selected.length})</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
