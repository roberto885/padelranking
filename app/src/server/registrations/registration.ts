export type RegistrationStatus="confirmed"|"waitlisted"|"withdrawn";
export type Registration={id:string;playerId:string;partnerId?:string;status:RegistrationStatus;createdAt:Date;waitlistPosition?:number};
export type Eligibility={approved:boolean;membershipValid:boolean;rating:number;verifiedLevel?:string};
export type CategoryPolicy={capacity:number;requiresPartner:boolean;minimumRating?:number;maximumRating?:number;requiresMembership:boolean;startsAt:Date;endsAt:Date;allowOverlap:boolean};

export function register(input:{id:string;playerId:string;partnerId?:string;createdAt:Date;eligibility:Eligibility;partnerEligibility?:Eligibility;policy:CategoryPolicy;existing:Registration[];overlappingConfirmed:number}):Registration{
  if(input.existing.some(r=>r.playerId===input.playerId&&r.status!=="withdrawn"))throw new Error("ALREADY_REGISTERED");
  if(!input.eligibility.approved)throw new Error("PLAYER_NOT_APPROVED");
  if(input.policy.requiresMembership&&!input.eligibility.membershipValid)throw new Error("MEMBERSHIP_REQUIRED");
  if(input.policy.minimumRating!==undefined&&input.eligibility.rating<input.policy.minimumRating)throw new Error("RATING_TOO_LOW");
  if(input.policy.maximumRating!==undefined&&input.eligibility.rating>input.policy.maximumRating)throw new Error("RATING_TOO_HIGH");
  if(!input.policy.allowOverlap&&input.overlappingConfirmed>0)throw new Error("OVERLAPPING_REGISTRATION");
  if(input.policy.requiresPartner&&!input.partnerId)throw new Error("PARTNER_REQUIRED");
  if(input.partnerId===input.playerId)throw new Error("INVALID_PARTNER");
  if(input.partnerId&&(!input.partnerEligibility?.approved||(input.policy.requiresMembership&&!input.partnerEligibility.membershipValid)))throw new Error("PARTNER_NOT_ELIGIBLE");
  const confirmed=input.existing.filter(r=>r.status==="confirmed").length;
  const waiting=input.existing.filter(r=>r.status==="waitlisted");
  return confirmed<input.policy.capacity?{id:input.id,playerId:input.playerId,partnerId:input.partnerId,status:"confirmed",createdAt:input.createdAt}:{id:input.id,playerId:input.playerId,partnerId:input.partnerId,status:"waitlisted",createdAt:input.createdAt,waitlistPosition:waiting.length+1};
}

export function withdrawAndPromote(registrations:Registration[],registrationId:string):{registrations:Registration[];promoted?:Registration}{
  const target=registrations.find(r=>r.id===registrationId);if(!target)throw new Error("REGISTRATION_NOT_FOUND");if(target.status==="withdrawn")return{registrations};
  const updated=registrations.map(r=>r.id===registrationId?{...r,status:"withdrawn" as const,waitlistPosition:undefined}:r);
  let promoted:Registration|undefined;
  if(target.status==="confirmed"){
    const next=updated.filter(r=>r.status==="waitlisted").sort((a,b)=>(a.waitlistPosition??Infinity)-(b.waitlistPosition??Infinity)||a.createdAt.getTime()-b.createdAt.getTime()||a.id.localeCompare(b.id))[0];
    if(next){promoted={...next,status:"confirmed",waitlistPosition:undefined};for(let i=0;i<updated.length;i++)if(updated[i].id===next.id)updated[i]=promoted;}
  }
  const remaining=updated.filter(r=>r.status==="waitlisted").sort((a,b)=>a.createdAt.getTime()-b.createdAt.getTime()||a.id.localeCompare(b.id));remaining.forEach((r,i)=>{const index=updated.findIndex(x=>x.id===r.id);updated[index]={...r,waitlistPosition:i+1};});
  return{registrations:updated,promoted};
}
