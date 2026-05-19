CREATE TABLE public.membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_spent BIGINT NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  perks JSONB NOT NULL DEFAULT '[]'::jsonb,
  color TEXT NOT NULL DEFAULT 'oklch(0.65 0.15 145)',
  icon TEXT NOT NULL DEFAULT 'sparkles',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view tiers"
  ON public.membership_tiers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/manager manage tiers"
  ON public.membership_tiers FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE TRIGGER membership_tiers_updated_at
  BEFORE UPDATE ON public.membership_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default tiers
INSERT INTO public.membership_tiers (name, min_spent, discount_percent, perks, color, icon, sort_order) VALUES
  ('Đồng', 0, 0, '["Tích điểm 1%", "Khuyến mãi cơ bản"]'::jsonb, 'oklch(0.6 0.08 50)', 'sparkles', 1),
  ('Bạc', 2000000, 3, '["Tích điểm 2%", "Free ship đơn >300k", "Voucher sinh nhật"]'::jsonb, 'oklch(0.7 0.02 250)', 'sparkles', 2),
  ('Vàng', 5000000, 5, '["Tích điểm 3%", "Free ship toàn đơn", "Ưu tiên giao hàng"]'::jsonb, 'oklch(0.75 0.15 85)', 'sparkles', 3),
  ('Kim cương', 15000000, 10, '["Tích điểm 5%", "Free ship + đổi trả 30 ngày", "Quà tặng VIP", "Hỗ trợ 24/7"]'::jsonb, 'oklch(0.7 0.18 200)', 'crown', 4);