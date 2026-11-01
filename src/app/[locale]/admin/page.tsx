import AdminClient from '@/components/AdminClient';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getPublicSiteConfig } from '@/lib/site-config';
import { getNewsletterArchives } from '../newsletter/storage-actions';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [authenticated, publicConfig] = await Promise.all([
    isAdminAuthenticated(),
    getPublicSiteConfig(),
  ]);

  const archives = publicConfig.leagueId
    ? await getNewsletterArchives(publicConfig.leagueId)
    : [];

  return (
    <AdminClient
      locale={locale}
      initialAuthenticated={authenticated}
      initialConfig={publicConfig}
      initialArchives={archives}
    />
  );
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

