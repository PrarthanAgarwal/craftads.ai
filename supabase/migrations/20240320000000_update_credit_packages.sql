-- Update credit packages with new pricing
UPDATE public.credit_packages
SET price = 15.00,
    credit_amount = 100
WHERE name = 'Starter Package';

UPDATE public.credit_packages
SET price = 45.00,
    credit_amount = 500
WHERE name = 'Pro Package';

UPDATE public.credit_packages
SET price = 95.00,
    credit_amount = 1500
WHERE name = 'Business Package';

-- Add yearly pricing packages
INSERT INTO public.credit_packages (name, description, credit_amount, price, is_active, is_featured, sort_order)
VALUES
  ('Starter Package Yearly', 'Perfect for beginners (25% off with yearly billing)', 100, 11.25, true, false, 4),
  ('Pro Package Yearly', 'Best value for regular users (25% off with yearly billing)', 500, 33.50, true, true, 5),
  ('Business Package Yearly', 'For businesses with higher volume needs (25% off with yearly billing)', 1500, 71.25, true, false, 6); 