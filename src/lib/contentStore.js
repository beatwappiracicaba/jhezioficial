import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'jhezi-content';
const ADMIN_KEY = 'jhezi-admin';
const THEME_KEY = 'jhezi-theme';

let supabaseClient = null;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  try {
    supabaseClient = createClient(url, key);
    return supabaseClient;
  } catch {
    return null;
  }
}

export async function loadContent(defaultContent) {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: config, error: configError } = await client
        .from('site_config')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!configError && config) {
        const [highlightsRes, eventsRes, mediaRes, videosRes] = await Promise.all([
          client.from('highlights').select('*').eq('site_config_id', 1).order('position'),
          client.from('events').select('*').eq('site_config_id', 1).order('position'),
          client.from('media_items').select('*').eq('site_config_id', 1).order('position'),
          client.from('videos').select('*').eq('site_config_id', 1).order('position'),
        ]);

        return {
          ...defaultContent,
          heroEyebrow: config.hero_eyebrow || defaultContent.heroEyebrow,
          heroTitle: config.hero_title || defaultContent.heroTitle,
          heroLead: config.hero_lead || defaultContent.heroLead,
          heroButtonText: config.hero_button_text || defaultContent.heroButtonText,
          heroSecondaryText: config.hero_secondary_text || defaultContent.heroSecondaryText,
          aboutTitle: config.about_title || defaultContent.aboutTitle,
          aboutText: config.about_text || defaultContent.aboutText,
          contactTitle: config.contact_title || defaultContent.contactTitle,
          contactText: config.contact_text || defaultContent.contactText,
          contactEmail: config.contact_email || defaultContent.contactEmail,
          whatsapp: config.whatsapp || defaultContent.whatsapp,
          instagram: config.instagram || defaultContent.instagram,
          youtube: config.youtube || defaultContent.youtube,
          heroImage: config.hero_image || defaultContent.heroImage,
          logoImage: config.logo_image || defaultContent.logoImage,
          highlights: highlightsRes.data?.map((item) => item.content) || defaultContent.highlights,
          events: eventsRes.data?.map((item) => ({ date: item.event_date, title: item.title, place: item.place })) || defaultContent.events,
          media: mediaRes.data?.map((item) => ({ id: item.id, title: item.title, description: item.description, category: item.category, image: item.image_url })) || defaultContent.media,
          videos: videosRes.data?.map((item) => ({ id: item.id, title: item.title, url: item.url })) || defaultContent.videos,
        };
      }
    } catch {
      // fallback para localStorage
    }
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultContent;

  try {
    return { ...defaultContent, ...JSON.parse(saved) };
  } catch {
    return defaultContent;
  }
}

export async function saveContent(content) {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('site_config').upsert({
        id: 1,
        hero_eyebrow: content.heroEyebrow,
        hero_title: content.heroTitle,
        hero_lead: content.heroLead,
        hero_button_text: content.heroButtonText,
        hero_secondary_text: content.heroSecondaryText,
        about_title: content.aboutTitle,
        about_text: content.aboutText,
        contact_title: content.contactTitle,
        contact_text: content.contactText,
        contact_email: content.contactEmail,
        whatsapp: content.whatsapp,
        instagram: content.instagram,
        youtube: content.youtube,
        hero_image: content.heroImage,
        logo_image: content.logoImage,
      });

      await client.from('highlights').delete().eq('site_config_id', 1);
      if (content.highlights?.length) {
        await client.from('highlights').insert(
          content.highlights.map((item, index) => ({
            site_config_id: 1,
            content: item,
            position: index,
          }))
        );
      }

      await client.from('events').delete().eq('site_config_id', 1);
      if (content.events?.length) {
        await client.from('events').insert(
          content.events.map((item, index) => ({
            site_config_id: 1,
            event_date: item.date,
            title: item.title,
            place: item.place,
            position: index,
          }))
        );
      }

      await client.from('media_items').delete().eq('site_config_id', 1);
      if (content.media?.length) {
        await client.from('media_items').insert(
          content.media.map((item, index) => ({
            site_config_id: 1,
            title: item.title,
            description: item.description,
            category: item.category,
            image_url: item.image,
            position: index,
          }))
        );
      }

      await client.from('videos').delete().eq('site_config_id', 1);
      if (content.videos?.length) {
        await client.from('videos').insert(
          content.videos.map((item, index) => ({
            site_config_id: 1,
            title: item.title,
            url: item.url,
            position: index,
          }))
        );
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
      return;
    } catch {
      // fallback para localStorage
    }
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

export async function getSession() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const {
      data: { session },
      error,
    } = await client.auth.getSession();
    if (error) throw error;
    return session;
  } catch {
    return null;
  }
}

export function onAuthStateChange(callback) {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const { data } = client.auth.onAuthStateChange((event, session) => callback(event, session));
  return () => data?.subscription?.unsubscribe();
}

export async function signIn(email, password) {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: new Error('Supabase não configurado') };

  return client.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: new Error('Supabase não configurado') };

  return client.auth.signOut();
}

export function saveAdminStatus(status) {
  window.localStorage.setItem(ADMIN_KEY, status ? 'true' : 'false');
}

export function loadAdminStatus() {
  return window.localStorage.getItem(ADMIN_KEY) === 'true';
}

export async function verifyAdmin(email, password) {
  const client = getSupabaseClient();
  if (!client) return false;

  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPassword = String(password || '').trim();

  try {
    const { data, error } = await client
      .from('admin_accounts')
      .select('id')
      .eq('email', normalizedEmail)
      .eq('password', normalizedPassword)
      .maybeSingle();

    return !error && !!data;
  } catch {
    return false;
  }
}

export function loadTheme() {
  return window.localStorage.getItem(THEME_KEY) || 'dark';
}

export function saveTheme(theme) {
  window.localStorage.setItem(THEME_KEY, theme);
}
