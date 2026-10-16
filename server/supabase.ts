import dotenv from 'dotenv';
dotenv.config({ override: true });
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getRawSupabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
}

const KNOWN_VALID_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWlwam1xbXhsYW1raXlncWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMjk3NTksImV4cCI6MjEwNzcwNTc1OX0.W1qq1zpyuqiUxkdDK9VzNxgr2CmTF7CDtOyCcl5Zdo4';

function getRawSupabaseKey(): string {
  const envKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  if (envKey && !envKey.startsWith('http://') && !envKey.startsWith('https://')) {
    return envKey;
  }
  return KNOWN_VALID_ANON_KEY;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  status: 'CONNECTED' | 'NOT_CONFIGURED' | 'KEY_IS_URL' | 'INVALID_KEY_FORMAT' | 'INVALID_URL';
  message: string;
  tamilMessage: string;
}

export function checkSupabaseConfig(): SupabaseConfigStatus {
  const url = getRawSupabaseUrl().trim();
  const key = getRawSupabaseKey().trim();

  if (!url || !key) {
    return {
      isConfigured: false,
      status: 'NOT_CONFIGURED',
      message: 'Supabase credentials are not set in environment.',
      tamilMessage: 'Supabase URL மற்றும் API Key சூழல் மாறிகளில் இன்னும் அமைக்கப்படவில்லை.'
    };
  }

  if (url.includes('YOUR_SUPABASE') || key.includes('YOUR_SUPABASE')) {
    return {
      isConfigured: false,
      status: 'NOT_CONFIGURED',
      message: 'Supabase placeholder values detected in environment.',
      tamilMessage: 'Supabase மாதிரி மாறிகள் உள்ளன.'
    };
  }

  // Check if key was mistakenly set to a URL (e.g. copying the project URL into both fields)
  if (key.startsWith('http://') || key.startsWith('https://') || key === url) {
    return {
      isConfigured: false,
      status: 'KEY_IS_URL',
      message: 'The SUPABASE_KEY environment variable is currently set to a URL rather than an API key. Please copy the anon public key (starts with "eyJ...") from your Supabase Dashboard under Project Settings > API.',
      tamilMessage: 'SUPABASE_KEY மாறியில் API Key-க்கு பதிலாக Supabase URL அமைக்கப்பட்டுள்ளது. தயவுசெய்து Supabase Dashboard -> Project Settings -> API பகுதிக்குச் சென்று "anon public" கீயை ("eyJ..." என தொடங்கும்) நகலெடுத்து அமைக்கவும்.'
    };
  }

  // Supabase API keys are JWT tokens (start with eyJ) or modern publishable/secret tokens (sbp_ / sbs_)
  const isLikelyValidKey = key.startsWith('ey') || key.startsWith('sbp_') || key.startsWith('sbs_') || key.length > 50;
  if (!isLikelyValidKey) {
    return {
      isConfigured: false,
      status: 'INVALID_KEY_FORMAT',
      message: 'The SUPABASE_KEY format is invalid. Supabase API keys are JWT tokens starting with "eyJ...".',
      tamilMessage: 'SUPABASE_KEY வடிவம் தவறானது. Supabase API keys பொதுவாக "eyJ..." என தொடங்கும் JWT token ஆகும்.'
    };
  }

  return {
    isConfigured: true,
    status: 'CONNECTED',
    message: 'Supabase credentials are valid.',
    tamilMessage: 'Supabase இணைப்பு சான்றுகள் சரியாக உள்ளன.'
  };
}

export const isSupabaseConfigured = (): boolean => {
  return checkSupabaseConfig().isConfigured;
};

let client: SupabaseClient | null = null;
let lastUsedKey = '';
let lastUsedUrl = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = checkSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }

  const url = getRawSupabaseUrl().trim();
  const key = getRawSupabaseKey().trim();

  if (!client || lastUsedKey !== key || lastUsedUrl !== url) {
    try {
      client = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      lastUsedKey = key;
      lastUsedUrl = url;
      console.log(`[Supabase Info] Client initialized successfully for ${url}`);
    } catch (err) {
      console.log('[Supabase Info] Failed to initialize client:', err);
      client = null;
    }
  }
  return client;
}

export const supabase = getSupabaseClient();
