-- Add transaction functions to support atomic operations
-- These functions are used by the API to manage transactions for credit operations

-- Create the begin_transaction function
CREATE OR REPLACE FUNCTION public.begin_transaction()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE 'BEGIN';
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Create the commit_transaction function
CREATE OR REPLACE FUNCTION public.commit_transaction()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE 'COMMIT';
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    EXECUTE 'ROLLBACK';
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Create the rollback_transaction function
CREATE OR REPLACE FUNCTION public.rollback_transaction()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE 'ROLLBACK';
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant permissions to use these functions
GRANT EXECUTE ON FUNCTION public.begin_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.commit_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.begin_transaction TO service_role;
GRANT EXECUTE ON FUNCTION public.commit_transaction TO service_role;
GRANT EXECUTE ON FUNCTION public.rollback_transaction TO service_role; 