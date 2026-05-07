'use client';

import { useEffect } from 'react';
import { useOrganization } from '@/hooks/use-organization';
import { getTheme, applyTheme } from '@/lib/themes';

export function OrgThemeProvider({ children }: { children: React.ReactNode }) {
  const { organization } = useOrganization();

  useEffect(() => {
    const theme = getTheme(organization?.theme ?? null);
    applyTheme(theme.vars);
  }, [organization?.theme]);

  return <>{children}</>;
}
