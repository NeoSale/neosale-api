-- Migration: Create function to get distinct chat sessions
-- Description: Creates a function to return the most recent chat message for each unique session_id for a given cliente_id

CREATE OR REPLACE FUNCTION get_distinct_chat_sessions(cliente_id_param UUID)
RETURNS TABLE(
  session_id character varying,
  message jsonb,
  created_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (n.session_id) 
    n.session_id,
    n.message,
    n.created_at
  FROM n8n_chat_histories n
  WHERE n.cliente_id = cliente_id_param
  ORDER BY n.session_id, n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_distinct_chat_sessions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_distinct_chat_sessions(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_distinct_chat_sessions(UUID) TO service_role;