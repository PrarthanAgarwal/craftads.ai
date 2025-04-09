-- Add template categories
INSERT INTO public.template_categories (name, slug, description, icon_name, color, is_active, sort_order)
VALUES
  ('App / Software', 'app-software', 'Templates for software applications and digital products', 'code', '#3B82F6', true, 1),
  ('Beauty / Personal Care', 'beauty-personal-care', 'Templates for beauty and personal care products', 'sparkles', '#EC4899', true, 2),
  ('Consumer Goods', 'consumer-goods', 'Templates for general consumer products', 'shopping-bag', '#10B981', true, 3),
  ('Education', 'education', 'Templates for educational products and services', 'book', '#8B5CF6', true, 4),
  ('Electronics / Tech', 'electronics-tech', 'Templates for electronic devices and technology', 'cpu', '#6366F1', true, 5),
  ('Fashion', 'fashion', 'Templates for clothing and fashion accessories', 'tshirt', '#F43F5E', true, 6),
  ('Fitness/ Wellness', 'fitness-wellness', 'Templates for fitness and wellness products', 'heart', '#EF4444', true, 7),
  ('Food / Beverage', 'food-beverage', 'Templates for food and beverage products', 'coffee', '#F97316', true, 8),
  ('Footwear', 'footwear', 'Templates for shoes and footwear', 'shoe', '#14B8A6', true, 9),
  ('Games / Toys', 'games-toys', 'Templates for games and toys', 'game-controller', '#8B5CF6', true, 10),
  ('Healthcare', 'healthcare', 'Templates for healthcare products and services', 'cross', '#10B981', true, 11),
  ('Home / Garden', 'home-garden', 'Templates for home and garden products', 'house', '#F59E0B', true, 12),
  ('Jewelry / Watches', 'jewelry-watches', 'Templates for jewelry and watches', 'gem', '#EC4899', true, 13),
  ('Kids / Baby', 'kids-baby', 'Templates for kids and baby products', 'baby', '#3B82F6', true, 14),
  ('Pets', 'pets', 'Templates for pet products and services', 'paw-print', '#F97316', true, 15),
  ('Retail / Marketplace', 'retail-marketplace', 'Templates for retail and marketplace products', 'store', '#6366F1', true, 16),
  ('Services', 'services', 'Templates for service-based businesses', 'briefcase', '#8B5CF6', true, 17),
  ('Sports / Outdoor', 'sports-outdoor', 'Templates for sports and outdoor activities', 'basketball', '#10B981', true, 18),
  ('Travel / Travel Accessories', 'travel-accessories', 'Templates for travel and travel accessories', 'airplane', '#3B82F6', true, 19)
ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  color = EXCLUDED.color,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP; 