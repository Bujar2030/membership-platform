'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Organization } from '@/types/database';
import { useAuth } from './use-auth';

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!profile?.organization_id) {
      setLoading(false);
      return;
    }

    const fetchOrg = async () => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();
      setOrganization(data);
      setLoading(false);
    };

    fetchOrg();
  }, [profile?.organization_id, supabase]);

  return { organization, loading };
}
