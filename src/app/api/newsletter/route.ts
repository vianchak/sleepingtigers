import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { getSiteConfig, DEFAULT_NEWSLETTER_PERSONA } from '@/lib/site-config';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { buildWeeklyNewsletterTelemetry } from '@/lib/newsletter-telemetry';

const NewsletterSchema = z.object({
  leadStory: z.object({
    headline: z.string(),
    content: z.string(),
  }),
  matchups: z.array(
    z.object({
      teamA: z.string(),
      teamB: z.string(),
      scoreText: z.string(),
      recap: z.string(),
    })
  ),
  awards: z.object({
    honorRoll: z.string(),
    detention: z.string(),
    fraudWatch: z.string(),
    faabFool: z.string(),
    whatIfMachine: z.string(),
  }),
  powerRankings: z.array(
    z.object({
      team: z.string(),
      rank: z.number(),
      blurb: z.string(),
    })
  ),
  nextVictim: z.string(),
  horoscope: z.string(),
  anecdote: z.string(),
});

const JSON_STRUCTURE_GUIDE = `{
  "leadStory": { "headline": "string", "content": "string" },
  "matchups": [{ "teamA": "string", "teamB": "string", "scoreText": "Team A 120.5 - 90.2 Team B", "recap": "string" }],
  "awards": {
    "honorRoll": "string",
    "detention": "string",
    "fraudWatch": "string",
    "faabFool": "string",
    "whatIfMachine": "string"
  },
  "powerRankings": [{ "team": "string", "rank": 1, "blurb": "string" }],
  "nextVictim": "string",
  "horoscope": "string",
  "anecdote": "string"
}`;

export const runtime = 'edge';

function extractJsonObject(text: string): any {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
  }
  return JSON.parse(candidate);
}

// Public GET endpoint to fetch deterministic weekly telemetry (for hydrating legacy archives)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const config = await getSiteConfig();
    const leagueId = searchParams.get('leagueId') || config.leagueId;
    const week = Number(searchParams.get('week'));

    if (!leagueId || !week) {
      return NextResponse.json({ success: false, error: 'Missing leagueId or week' }, { status: 400 });
    }

    const meta = await buildWeeklyNewsletterTelemetry(leagueId, week);
    return NextResponse.json({ success: true, meta });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in as Admin to generate newsletters.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const config = await getSiteConfig();

    const leagueId = body.leagueId || config.leagueId;
    const week = Number(body.week);
    const locale = body.locale || 'en';
    const commissionerNotes = typeof body.commissionerNotes === 'string' ? body.commissionerNotes.trim() : '';
    const regenerateSection = typeof body.regenerateSection === 'string' ? body.regenerateSection : '';

    if (!leagueId || !week) {
      return NextResponse.json({ error: 'Missing leagueId or week' }, { status: 400 });
    }

    if (!config.newsletterEnabled) {
      return NextResponse.json(
        { error: 'Newsletter feature is currently disabled in Admin settings.' },
        { status: 403 }
      );
    }

    const apiKey = config.llmApiKey;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: `LLM API Key is not configured for provider "${config.llmProvider}". Please set it in the Admin Dashboard or environment variables.`,
        },
        { status: 400 }
      );
    }

    // 1. Gather comprehensive Week-accurate Telemetry
    const meta = await buildWeeklyNewsletterTelemetry(leagueId, week);

    const promptContext = {
      week: meta.week,
      pulse: {
        highestScorer: {
          team: meta.pulse.highestScorer.team,
          points: meta.pulse.highestScorer.points,
          opponent: meta.pulse.highestScorer.opponent,
        },
        lowestScorer: {
          team: meta.pulse.lowestScorer.team,
          points: meta.pulse.lowestScorer.points,
          opponent: meta.pulse.lowestScorer.opponent,
        },
        biggestBlowout: {
          winner: meta.pulse.biggestBlowout.winner,
          loser: meta.pulse.biggestBlowout.loser,
          score: `${meta.pulse.biggestBlowout.winnerPoints} - ${meta.pulse.biggestBlowout.loserPoints}`,
          margin: meta.pulse.biggestBlowout.margin,
        },
        closestGame: {
          winner: meta.pulse.closestGame.winner,
          loser: meta.pulse.closestGame.loser,
          score: `${meta.pulse.closestGame.winnerPoints} - ${meta.pulse.closestGame.loserPoints}`,
          margin: meta.pulse.closestGame.margin,
        },
        benchKing: {
          team: meta.pulse.benchKing.team,
          benchPointsLeftOnTable: meta.pulse.benchKing.benchPoints,
          topBenchPlayer: meta.pulse.benchKing.topBenchPlayer
            ? `${meta.pulse.benchKing.topBenchPlayer.name} (${meta.pulse.benchKing.topBenchPlayer.points} pts)`
            : null,
        },
      },
      matchups: meta.matchups.map((m) => ({
        teamA: m.teamA,
        teamARecord: m.teamARecord,
        scoreA: m.scoreA,
        benchPointsA: m.benchPointsA,
        mvpStarterA: m.mvpStarterA?.isNamed ? `${m.mvpStarterA.name} (${m.mvpStarterA.points} pts)` : null,
        worstStarterA: m.worstStarterA?.isNamed ? `${m.worstStarterA.name} (${m.worstStarterA.points} pts)` : null,
        bestBenchA: m.bestBenchA?.isNamed ? `${m.bestBenchA.name} (${m.bestBenchA.points} pts)` : null,
        teamB: m.teamB,
        teamBRecord: m.teamBRecord,
        scoreB: m.scoreB,
        benchPointsB: m.benchPointsB,
        mvpStarterB: m.mvpStarterB?.isNamed ? `${m.mvpStarterB.name} (${m.mvpStarterB.points} pts)` : null,
        worstStarterB: m.worstStarterB?.isNamed ? `${m.worstStarterB.name} (${m.worstStarterB.points} pts)` : null,
        bestBenchB: m.bestBenchB?.isNamed ? `${m.bestBenchB.name} (${m.bestBenchB.points} pts)` : null,
        winner: m.winner,
        loser: m.loser,
        margin: m.margin,
        whatIfFlip: m.whatIfFlip,
      })),
      standingsAsOfWeek: meta.standings.map((s) => ({
        rank: s.standingsRank,
        rankChangeFromLastWeek:
          s.rankDelta > 0 ? `+${s.rankDelta}` : s.rankDelta < 0 ? `${s.rankDelta}` : '0',
        team: s.team,
        record: s.record,
        allPlayRecord: s.allPlayRecord,
        streak: s.streak,
        totalFpts: s.fpts,
        weekScore: s.weekScore,
        weekBenchPoints: s.weekBenchPoints,
      })),
      waiverAndTradeActivity: meta.transactions.map((t) => t.summary),
      nextWeekUpcomingMatchups: meta.nextWeekMatchups.map(
        (n) => `${n.teamA} (${n.teamARecord}, ${n.teamAFpts} PF) vs ${n.teamB} (${n.teamBRecord}, ${n.teamBFpts} PF)`
      ),
    };

    const statsContext = JSON.stringify(promptContext, null, 2);

    const languageInstruction =
      locale === 'uk'
        ? 'You MUST write the ENTIRE newsletter in Ukrainian. The tone should still be deeply cynical, witty, and frustrated, using natural Ukrainian sports/fantasy idioms and humor.'
        : 'Write the newsletter in English.';

    const personaInstruction = config.newsletterPersona?.trim() || DEFAULT_NEWSLETTER_PERSONA;

    const commissionerBlock = commissionerNotes
      ? `\nCOMMISSIONER'S INSIDER NOTES & WEEKLY STORYLINES (MUST weave these facts/jokes naturally into the Lead Story or relevant sections):\n"""\n${commissionerNotes}\n"""\n`
      : '';

    const rerollInstruction = regenerateSection
      ? `\nSPECIAL INSTRUCTION: The editor requested a fresh, sharper, funnier rewrite specifically for the "${regenerateSection}" section. Give it a brand-new angle and punchier jokes!\n`
      : '';

    const prompt = `
${personaInstruction}
${commissionerBlock}
${rerollInstruction}

Write a weekly recap based strictly on the following verified telemetry for Week ${week}.
${languageInstruction}

CRITICAL ACCURACY RULES (NO HALLUCINATIONS):
- Only cite real manager names, scores, records, streaks, player names, bench points, and transactions present in the Stats Context below. Do NOT invent fake player names or fake waiver pickups.
- Keep "matchups" in the exact same order as provided in Stats Context, with "teamA" and "teamB" matching the exact manager display names.

Stats Context:
${statsContext}

Generate the following sections:
1. Lead Story: A dramatic, multi-paragraph front-page narrative covering the biggest storyline of Week ${week} (e.g., the biggest blowout, nail-biter, top scorer, or standings shakeup).
2. Matchups: A punchy, entertaining recap for every single matchup in the list. Reference actual MVP starters, dud starters, or bench blunders where provided. ScoreText MUST be formatted as "Team A 120.5 - 90.2 Team B".
3. Awards:
    - Honor Roll: Shoutout to the highest scorer (${meta.pulse.highestScorer.team} with ${meta.pulse.highestScorer.points} pts) and their top performers.
    - Detention: Roast the lowest scorer (${meta.pulse.lowestScorer.team} with ${meta.pulse.lowestScorer.points} pts) and their worst starter duds.
    - Fraud Watch: Call out a team whose actual record is inflated compared to their All-Play record / points scored, or someone who won an ugly low-scoring game.
    - FAAB Fool: Roast a real transaction from "waiverAndTradeActivity" (especially wasted FAAB or dropping someone who scored points) OR roast the "benchKing" (${meta.pulse.benchKing.team} leaving ${meta.pulse.benchKing.benchPoints} pts on the bench) if no waiver moves occurred.
    - What If Machine: Use the verified "whatIfFlip" lineup blunder from the matchups if one exists; otherwise highlight the most painful bench vs. starter decision from the week.
4. Power Rankings: Rank all teams 1 to ${meta.standings.length} based on "standingsAsOfWeek", referencing their streak, rank movement, or points trend in a snarky 1-2 sentence blurb.
5. Next Victim: Pick a real upcoming Week ${week + 1} matchup from "nextWeekUpcomingMatchups" and make a bold, ruthless prediction about who is getting demolished.
6. Horoscope: A funny, fatalistic fantasy football horoscope for the league managers.
7. Anecdote: A brief, chaotic parting thought or press-conference-style quote to close the issue.
`;

    const provider = config.llmProvider || 'google';
    const rawModel =
      config.llmModel ||
      (provider === 'google'
        ? 'gemini-3.8-flash'
        : provider === 'openai'
        ? 'gpt-4o-mini'
        : provider === 'anthropic'
        ? 'claude-3-5-sonnet-latest'
        : 'openai/gpt-4o-mini');
    const modelName =
      provider === 'google' && (rawModel === 'gemini-2.5-flash' || rawModel === 'gemini-2.0-flash')
        ? 'gemini-3.8-flash'
        : rawModel;

    if (provider === 'google') {
      const googleProvider = createGoogleGenerativeAI({
        apiKey,
        ...(config.llmBaseUrl ? { baseURL: config.llmBaseUrl } : {}),
      });

      const { object } = await generateObject({
        model: googleProvider(modelName),
        schema: NewsletterSchema,
        prompt,
      });

      return NextResponse.json({
        ...object,
        ...(commissionerNotes ? { commissionerNotes } : {}),
        meta,
      });
    }

    if (provider === 'openai' || provider === 'openrouter') {
      const defaultBaseUrl =
        provider === 'openrouter'
          ? 'https://openrouter.ai/api/v1'
          : 'https://api.openai.com/v1';
      const baseUrl = (config.llmBaseUrl || defaultBaseUrl).replace(/\/+$/, '');

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are a fantasy football newsletter generator. Respond ONLY with a valid JSON object matching this exact structure:\n${JSON_STRUCTURE_GUIDE}`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`${provider.toUpperCase()} API Error (${res.status}): ${errText}`);
      }

      const completion = await res.json();
      const rawContent = completion?.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new Error('Empty response from LLM provider');
      }

      const parsed = NewsletterSchema.parse(extractJsonObject(rawContent));
      return NextResponse.json({
        ...parsed,
        ...(commissionerNotes ? { commissionerNotes } : {}),
        meta,
      });
    }

    if (provider === 'anthropic') {
      const baseUrl = (config.llmBaseUrl || 'https://api.anthropic.com/v1').replace(/\/+$/, '');
      const res = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 4096,
          system: `You are a fantasy football newsletter generator. Respond ONLY with a valid JSON object matching this exact structure (no markdown commentary):\n${JSON_STRUCTURE_GUIDE}`,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Anthropic API Error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const rawText = data?.content?.[0]?.text;
      if (!rawText) {
        throw new Error('Empty response from Anthropic API');
      }

      const parsed = NewsletterSchema.parse(extractJsonObject(rawText));
      return NextResponse.json({
        ...parsed,
        ...(commissionerNotes ? { commissionerNotes } : {}),
        meta,
      });
    }

    return NextResponse.json({ error: `Unsupported LLM provider: ${provider}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Server Error: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}
