export type BracketEntry={id:string;seed?:number};
export type BracketNode={id:string;round:number;position:number;entry1:string|null;entry2:string|null;source1?:string;source2?:string;winnerTo?:string;thirdPlace?:boolean};
const nextPower=(n:number)=>2**Math.ceil(Math.log2(n));
function seedOrder(size:number):number[]{if(size===2)return[1,2];const prev=seedOrder(size/2),out:number[]=[];for(const seed of prev){out.push(seed,size+1-seed);}return out;}

export function generateSingleElimination(input:{entries:BracketEntry[];thirdPlace?:boolean}):BracketNode[]{
  if(input.entries.length<2)throw new Error("AT_LEAST_TWO_ENTRIES_REQUIRED");
  if(new Set(input.entries.map(e=>e.id)).size!==input.entries.length)throw new Error("DUPLICATE_ENTRY");
  const seeded=input.entries.filter(e=>e.seed!==undefined);
  if(new Set(seeded.map(e=>e.seed)).size!==seeded.length||seeded.some(e=>!Number.isInteger(e.seed)||e.seed!<1))throw new Error("INVALID_SEEDS");
  const size=nextPower(input.entries.length),slots=Array<string|null>(size).fill(null),order=seedOrder(size);
  const ranked=[...seeded].sort((a,b)=>a.seed!-b.seed!);
  for(const entry of ranked){const position=order.indexOf(entry.seed!);if(position<0)throw new Error("SEED_OUT_OF_RANGE");slots[position]=entry.id;}
  const remaining=input.entries.filter(e=>e.seed===undefined).sort((a,b)=>a.id.localeCompare(b.id));
  const empty=slots.map((x,i)=>x===null?i:-1).filter(i=>i>=0);
  remaining.forEach((entry,i)=>slots[empty[i]]=entry.id);
  const rounds=Math.log2(size),nodes:BracketNode[]=[];
  for(let r=1;r<=rounds;r++)for(let p=0;p<size/2**r;p++){
    const id=`r${r}-m${p+1}`,winnerTo=r<rounds?`r${r+1}-m${Math.floor(p/2)+1}`:undefined;
    if(r===1)nodes.push({id,round:r,position:p+1,entry1:slots[p*2],entry2:slots[p*2+1],winnerTo});
    else nodes.push({id,round:r,position:p+1,entry1:null,entry2:null,source1:`r${r-1}-m${p*2+1}`,source2:`r${r-1}-m${p*2+2}`,winnerTo});
  }
  if(input.thirdPlace&&rounds>=2)nodes.push({id:"third-place",round:rounds,position:2,entry1:null,entry2:null,source1:`r${rounds-1}-m1`,source2:`r${rounds-1}-m2`,thirdPlace:true});
  return nodes;
}
