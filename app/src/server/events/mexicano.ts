export type MexicanoStanding = { playerId: string; points: number; difference: number; seed: number };
export type MexicanoHistory = { team1: [string,string]; team2: [string,string] };
export type MexicanoCourt = { court: number; championship: boolean; team1: [string,string]; team2: [string,string] };
const key=(a:string,b:string)=>[a,b].sort().join(":");

export function generateMexicanoRound(input:{standings:MexicanoStanding[];courts:number;history:MexicanoHistory[]}):{courts:MexicanoCourt[];resting:string[]} {
  if(input.standings.length<4) throw new Error("AT_LEAST_FOUR_PLAYERS_REQUIRED");
  if(input.courts<1) throw new Error("AT_LEAST_ONE_COURT_REQUIRED");
  if(new Set(input.standings.map(s=>s.playerId)).size!==input.standings.length) throw new Error("DUPLICATE_PLAYER");
  const ranked=[...input.standings].sort((a,b)=>b.points-a.points||b.difference-a.difference||a.seed-b.seed||a.playerId.localeCompare(b.playerId));
  const activeCount=Math.min(input.courts*4,Math.floor(ranked.length/4)*4);
  const active=ranked.slice(0,activeCount).map(s=>s.playerId),resting=ranked.slice(activeCount).map(s=>s.playerId);
  const partner=new Map<string,number>(),opponent=new Map<string,number>();
  const bump=(map:Map<string,number>,a:string,b:string)=>map.set(key(a,b),(map.get(key(a,b))??0)+1);
  for(const h of input.history){bump(partner,...h.team1);bump(partner,...h.team2);for(const a of h.team1)for(const b of h.team2)bump(opponent,a,b);}
  const output:MexicanoCourt[]=[];
  for(let court=0;court<activeCount/4;court++){
    const group=active.slice(court*4,court*4+4);
    const arrangements:Array<[[string,string],[string,string]]>=[[[group[0],group[1]],[group[2],group[3]]],[[group[0],group[2]],[group[1],group[3]]],[[group[0],group[3]],[group[1],group[2]]]];
    arrangements.sort((x,y)=>{const score=(z:typeof x)=>(partner.get(key(...z[0]))??0)*100+(partner.get(key(...z[1]))??0)*100+z[0].reduce((n,a)=>n+z[1].reduce((m,b)=>m+(opponent.get(key(a,b))??0),0),0);const diff=score(x)-score(y);return diff||JSON.stringify(x).localeCompare(JSON.stringify(y));});
    output.push({court:court+1,championship:court===0,team1:arrangements[0][0],team2:arrangements[0][1]});
  }
  return {courts:output,resting};
}
