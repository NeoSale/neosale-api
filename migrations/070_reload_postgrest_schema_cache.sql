-- Migration 070: Reload PostgREST schema cache
-- After migration 069 changed column types from TIMESTAMPTZ to TIMESTAMP,
-- PostgREST's cached schema no longer recognizes dequeue_event().
-- This NOTIFY tells PostgREST to reload its schema cache.
NOTIFY pgrst, 'reload schema';
