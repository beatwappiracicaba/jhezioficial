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
      const { data, error } = await client.from('site_content').select('*').maybeSingle();
      if (!error && data?.content) {
        return { ...defaultContent, ...data.content };
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
      await client.from('site_content').upsert({ id: 1, content });
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

export function loadTheme() {
  return window.localStorage.getItem(THEME_KEY) || 'dark';
}

export function saveTheme(theme) {
  window.localStorage.setItem(THEME_KEY, theme);
}
