export const STEP_UP_MAX_AGE_MINUTES=30;
export function isStepUpFresh(verifiedAt:Date|undefined,now:Date,maxAgeMinutes=STEP_UP_MAX_AGE_MINUTES):boolean{return Boolean(verifiedAt&&now.getTime()-verifiedAt.getTime()<=maxAgeMinutes*60_000)}
export function assertAdminStepUp(input:{totpActive:boolean;stepUpVerifiedAt?:Date;now:Date;maxAgeMinutes?:number}):void{if(!input.totpActive)throw new Error("TOTP_ENROLLMENT_REQUIRED");if(!isStepUpFresh(input.stepUpVerifiedAt,input.now,input.maxAgeMinutes))throw new Error("STEP_UP_REQUIRED")}
