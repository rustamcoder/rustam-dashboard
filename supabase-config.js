window.RUSTAM_SUPABASE = {
  url: 'https://jeasqgznbjvwurscrcox.supabase.co',
  publishableKey: 'sb_publishable_9Z01h5lDNMg9UXNIGOIZIg_CRcZg4NG',
  allowedEmail: 'torixtube077@gmail.com'
};

// One-time migration: remove all demonstration and user-entered data,
// then keep the reset marker in cloud data so a second device will not wipe new work.
(() => {
  const RESET_VERSION = 'empty-start-2026-09-16-v1';
  const emptyState = {
    name: 'Rustam',
    color: '#4f7cff',
    goals: [],
    tasks: [],
    habits: [],
    notes: [],
    chat: [['ai', 'Привет, Rustam! Всё начинается с чистого листа. Добавь первую цель или спроси, с чего начать.']],
    focus: 0,
    _resetVersion: RESET_VERSION
  };

  async function resetOnce(session) {
    if (!session?.user || session.user.email?.toLowerCase() !== window.RUSTAM_SUPABASE.allowedEmail.toLowerCase()) return;
    try {
      const resetClient = supabase.createClient(
        window.RUSTAM_SUPABASE.url,
        window.RUSTAM_SUPABASE.publishableKey
      );
      const { data } = await resetClient
        .from('user_data')
        .select('data')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data?.data?._resetVersion === RESET_VERSION) {
        localStorage.setItem('rustam-reset-version', RESET_VERSION);
        return;
      }

      const { error } = await resetClient
        .from('user_data')
        .upsert({ user_id: session.user.id, data: emptyState });
      if (error) throw error;

      localStorage.setItem('rustam-app', JSON.stringify(emptyState));
      localStorage.setItem('rustam-reset-version', RESET_VERSION);
      location.reload();
    } catch (error) {
      console.error('RUSTAM reset failed:', error);
    }
  }

  const resetClient = supabase.createClient(
    window.RUSTAM_SUPABASE.url,
    window.RUSTAM_SUPABASE.publishableKey
  );
  resetClient.auth.getSession().then(({ data }) => resetOnce(data.session));
  resetClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') setTimeout(() => resetOnce(session), 0);
  });
})();
