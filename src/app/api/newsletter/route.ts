import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { getLeagueData, getMatchups, getUsers, getRosters } from '@/lib/sleeper-api';

const NewsletterSchema = z.object({
  leadStory: z.object({
    headline: z.string(),
    content: z.string(),
  }),
  matchups: z.array(z.object({
    teamA: z.string(),
    teamB: z.string(),
    scoreText: z.string(),
    recap: z.string(),
  })),
  awards: z.object({
    honorRoll: z.string(),
    detention: z.string(),
    fraudWatch: z.string(),
    faabFool: z.string(),
    whatIfMachine: z.string(),
  }),
  powerRankings: z.array(z.object({
    team: z.string(),
    rank: z.number(),
    blurb: z.string()
  })),
  nextVictim: z.string(),
  horoscope: z.string(),
  anecdote: z.string(),
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { leagueId, week, locale } = await req.json();

    if (!leagueId || !week) {
      return NextResponse.json({ error: 'Missing leagueId or week' }, { status: 400 });
    }

    // 1. Gather Context
    const [leagueData, matchups, users, rosters] = await Promise.all([
      getLeagueData(leagueId),
      getMatchups(leagueId, week),
      getUsers(leagueId),
      getRosters(leagueId)
    ]);
    
    const userMap = new Map();
    for (const u of users) userMap.set(u.user_id, u.display_name);
    
    const rosterMap = new Map();
    for (const r of rosters) {
      const managerName = r.owner_id ? userMap.get(r.owner_id) : `Team ${r.roster_id}`;
      rosterMap.set(r.roster_id, managerName);
    }

    const matchupGroups = new Map();
    for (const match of matchups) {
       if (!matchupGroups.has(match.matchup_id)) {
         matchupGroups.set(match.matchup_id, []);
       }
       matchupGroups.get(match.matchup_id).push(match);
    }
    
    const matchupsList = [];
    let highestScorer = { team: '', points: -1 };
    let lowestScorer = { team: '', points: 9999 };
    let biggestBlowout = { diff: -1, winner: '', loser: '' };
    
    for (const [matchupId, teams] of Array.from(matchupGroups.entries())) {
      if (teams.length !== 2) continue;
      
      const t1 = teams[0];
      const t2 = teams[1];
      
      const t1Name = rosterMap.get(t1.roster_id);
      const t2Name = rosterMap.get(t2.roster_id);
      
      const p1 = (t1.points || 0) + (t1.custom_points || 0);
      const p2 = (t2.points || 0) + (t2.custom_points || 0);

      matchupsList.push({ teamA: t1Name, teamB: t2Name, scoreA: p1, scoreB: p2 });

      if (p1 > highestScorer.points) highestScorer = { team: t1Name, points: p1 };
      if (p2 > highestScorer.points) highestScorer = { team: t2Name, points: p2 };
      
      if (p1 < lowestScorer.points) lowestScorer = { team: t1Name, points: p1 };
      if (p2 < lowestScorer.points) lowestScorer = { team: t2Name, points: p2 };

      const diff = Math.abs(p1 - p2);
      const winner = p1 > p2 ? t1Name : t2Name;
      const loser = p1 > p2 ? t2Name : t1Name;
      
      if (diff > biggestBlowout.diff) biggestBlowout = { diff, winner, loser };
    }
    
    const currentStandings = [...leagueData].sort((a, b) => b.fpts - a.fpts).map((t, i) => ({
      team: t.displayName,
      fpts: t.fpts,
      wins: t.wins,
      losses: t.losses
    }));

    const statsContext = JSON.stringify({
      week,
      matchups: matchupsList,
      highestScorer,
      lowestScorer,
      biggestBlowout,
      currentStandings
    }, null, 2);

    const languageInstruction = locale === 'uk' 
      ? "You MUST write the ENTIRE newsletter in Ukrainian. The tone should still be deeply cynical, witty, and frustrated, using appropriate Ukrainian slang or idioms for sports frustration." 
      : "Write the newsletter in English.";

    const prompt = `
    You are a witty, slightly cynical, and deeply frustrated fantasy football beat writer.
    Write a weekly recap based on the following stats for Week ${week}.
    The core theme of this newsletter is "???????" (burning / raging / utter meltdown). We "burn" because of how painfully unpredictable, unfair, and frustrating fantasy football is. Focus heavily on bad beats, fluke performances, bench points that ruined everything, and the sheer agony of managing these teams.
    Keep it humorous, engaging, and absolutely ruthless. Embrace the chaos and the "???????".
    
    ${languageInstruction}

    Stats Context:
    ${statsContext}

    Generate the following sections:
    1. Lead Story: A dramatic narrative about the biggest event this week.
    2. Matchups: A short, punchy recap for every single matchup in the list. ScoreText should be formatted like "Team A 120.5 - 90.2 Team B".
    3. Awards: 
        - Honor Roll: Give a shoutout to the highest scorer.
        - Detention: Roast the lowest scorer.
        - Fraud Watch: Identify a team with a good record but low points, or someone who won a terrible game.
        - FAAB Fool: Roast someone's terrible waiver wire decision or bench/starter mismanagement.
        - What If Machine: Show how a losing team could have won if they made a different choice.
    4. Power Rankings: Rank the teams based on current standings, with a snarky 1-sentence blurb for each.
    5. Next Victim: A bold prediction about who is going to get absolutely demolished in the upcoming week.
    6. Horoscope: A funny, completely unhelpful fantasy football horoscope for the managers.
    7. Anecdote: A brief, bizarre, out-of-context story or quote to end the newsletter on a chaotic note.
    `;

    const env = process.env as any;
    const apiKey = env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is missing on the server! process.env is empty.' }, { status: 400 });
    }

    const googleProvider = createGoogleGenerativeAI({ apiKey });

    const { object } = await generateObject({
      model: googleProvider('gemini-3.8-flash'),
      schema: NewsletterSchema,
      prompt,
    });

    return NextResponse.json(object);
  } catch (error: any) {
    return NextResponse.json({ error: `Server Error: ${error.message || String(error)}` }, { status: 500 });
  }
}
