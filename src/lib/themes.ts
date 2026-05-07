export type ThemeId =
  | 'corporate-light'
  | 'dark-pro'
  | 'ocean-blue'
  | 'emerald-business'
  | 'royal-purple';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  preview: {
    bg: string;
    primary: string;
    secondary: string;
    text: string;
    border: string;
  };
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: 'corporate-light',
    name: 'Corporate Light',
    description: 'Klasik, profesional, i pastër',
    preview: {
      bg: '#ffffff',
      primary: '#0f172a',
      secondary: '#f1f5f9',
      text: '#0f172a',
      border: '#e2e8f0',
    },
    vars: {
      '--background': '0 0% 100%',
      '--foreground': '240 10% 3.9%',
      '--card': '0 0% 100%',
      '--card-foreground': '240 10% 3.9%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '240 10% 3.9%',
      '--primary': '240 5.9% 10%',
      '--primary-foreground': '0 0% 98%',
      '--secondary': '240 4.8% 95.9%',
      '--secondary-foreground': '240 5.9% 10%',
      '--muted': '240 4.8% 95.9%',
      '--muted-foreground': '240 3.8% 46.1%',
      '--accent': '240 4.8% 95.9%',
      '--accent-foreground': '240 5.9% 10%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '240 5.9% 90%',
      '--input': '240 5.9% 90%',
      '--ring': '240 5.9% 10%',
      '--radius': '0.5rem',
    },
  },
  {
    id: 'dark-pro',
    name: 'Dark Pro',
    description: 'Modern, i errët, elegant',
    preview: {
      bg: '#0f172a',
      primary: '#60a5fa',
      secondary: '#1e293b',
      text: '#f8fafc',
      border: '#1e293b',
    },
    vars: {
      '--background': '222 47% 7%',
      '--foreground': '210 40% 98%',
      '--card': '222 47% 10%',
      '--card-foreground': '210 40% 98%',
      '--popover': '222 47% 10%',
      '--popover-foreground': '210 40% 98%',
      '--primary': '217 91% 60%',
      '--primary-foreground': '222 47% 11%',
      '--secondary': '217 33% 17%',
      '--secondary-foreground': '210 40% 98%',
      '--muted': '217 33% 17%',
      '--muted-foreground': '215 20% 55%',
      '--accent': '217 33% 20%',
      '--accent-foreground': '210 40% 98%',
      '--destructive': '0 62.8% 50%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '217 33% 17%',
      '--input': '217 33% 17%',
      '--ring': '217 91% 60%',
      '--radius': '0.5rem',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Freskues, i besueshëm, korporativ',
    preview: {
      bg: '#f0f9ff',
      primary: '#0369a1',
      secondary: '#e0f2fe',
      text: '#0c4a6e',
      border: '#bae6fd',
    },
    vars: {
      '--background': '204 100% 97%',
      '--foreground': '201 100% 20%',
      '--card': '0 0% 100%',
      '--card-foreground': '201 100% 20%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '201 100% 20%',
      '--primary': '201 96% 32%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '204 93% 93%',
      '--secondary-foreground': '201 100% 20%',
      '--muted': '204 93% 93%',
      '--muted-foreground': '201 60% 40%',
      '--accent': '199 89% 88%',
      '--accent-foreground': '201 100% 20%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '201 70% 85%',
      '--input': '201 70% 88%',
      '--ring': '201 96% 32%',
      '--radius': '0.625rem',
    },
  },
  {
    id: 'emerald-business',
    name: 'Emerald Business',
    description: 'Natyrë, rritje, stabilitet',
    preview: {
      bg: '#f0fdf4',
      primary: '#065f46',
      secondary: '#dcfce7',
      text: '#052e16',
      border: '#bbf7d0',
    },
    vars: {
      '--background': '138 76% 97%',
      '--foreground': '160 84% 10%',
      '--card': '0 0% 100%',
      '--card-foreground': '160 84% 10%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '160 84% 10%',
      '--primary': '160 84% 20%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '141 79% 93%',
      '--secondary-foreground': '160 84% 10%',
      '--muted': '141 79% 93%',
      '--muted-foreground': '160 40% 40%',
      '--accent': '141 69% 87%',
      '--accent-foreground': '160 84% 10%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '141 50% 84%',
      '--input': '141 50% 87%',
      '--ring': '160 84% 20%',
      '--radius': '0.5rem',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Kreativ, premium, modern',
    preview: {
      bg: '#faf5ff',
      primary: '#6d28d9',
      secondary: '#ede9fe',
      text: '#2e1065',
      border: '#ddd6fe',
    },
    vars: {
      '--background': '270 100% 98%',
      '--foreground': '263 70% 15%',
      '--card': '0 0% 100%',
      '--card-foreground': '263 70% 15%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '263 70% 15%',
      '--primary': '262 83% 50%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '270 67% 94%',
      '--secondary-foreground': '263 70% 15%',
      '--muted': '270 67% 94%',
      '--muted-foreground': '262 40% 45%',
      '--accent': '270 60% 90%',
      '--accent-foreground': '263 70% 15%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '262 50% 87%',
      '--input': '262 50% 90%',
      '--ring': '262 83% 50%',
      '--radius': '0.5rem',
    },
  },
];

export const DEFAULT_THEME_ID: ThemeId = 'corporate-light';

export function getTheme(id: string | null | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function applyTheme(vars: Record<string, string>): void {
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
