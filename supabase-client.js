(() => {
  const config = window.SUPABASE_CONFIG || {};
  const ready = Boolean(config.url && config.anonKey && window.supabase);
  window.supabaseClient = ready ? window.supabase.createClient(config.url, config.anonKey) : null;
})();
