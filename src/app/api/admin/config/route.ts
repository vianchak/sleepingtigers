import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getPublicSiteConfig, LLMProvider, saveSiteConfig, SiteConfig } from '@/lib/site-config';
import { clearSleeperCache } from '@/lib/sleeper-api';

export const runtime = 'edge';

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const config = await getPublicSiteConfig();
  return NextResponse.json({ config });
}

export async function POST(req: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      leagueId,
      leagueName,
      newsletterEnabled,
      llmProvider,
      llmModel,
      llmApiKey,
      clearApiKey,
      llmBaseUrl,
      newsletterTitle,
      newsletterSubtitle,
      newsletterPersona,
    } = body;

    const updates: Partial<SiteConfig> = {};

    if (typeof leagueId === 'string') updates.leagueId = leagueId.trim();
    if (typeof leagueName === 'string') updates.leagueName = leagueName.trim();
    if (typeof newsletterEnabled === 'boolean') updates.newsletterEnabled = newsletterEnabled;
    if (typeof llmProvider === 'string' && ['google', 'openai', 'anthropic', 'openrouter'].includes(llmProvider)) {
      updates.llmProvider = llmProvider as LLMProvider;
    }
    if (typeof llmModel === 'string') updates.llmModel = llmModel.trim();
    if (clearApiKey === true) {
      updates.llmApiKey = '';
    } else if (typeof llmApiKey === 'string' && llmApiKey.trim().length > 0) {
      updates.llmApiKey = llmApiKey.trim();
    }
    if (typeof llmBaseUrl === 'string') updates.llmBaseUrl = llmBaseUrl.trim();
    if (typeof newsletterTitle === 'string') updates.newsletterTitle = newsletterTitle.trim();
    if (typeof newsletterSubtitle === 'string') updates.newsletterSubtitle = newsletterSubtitle.trim();
    if (typeof newsletterPersona === 'string') updates.newsletterPersona = newsletterPersona;

    const saveResult = await saveSiteConfig(updates);
    if (!saveResult.success) {
      return NextResponse.json(
        { error: saveResult.error || 'Failed to save configuration' },
        { status: 500 }
      );
    }

    clearSleeperCache();
    revalidatePath('/', 'layout');

    const updatedConfig = await getPublicSiteConfig();
    return NextResponse.json({
      success: true,
      storageBackend: saveResult.storageBackend,
      config: updatedConfig,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

