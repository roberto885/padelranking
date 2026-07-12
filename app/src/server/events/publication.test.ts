import{describe,expect,it}from"vitest";import{publicationIssues,publishEvent,PublicationBlockedError,type PublicationInput}from"./publication";
const valid=():PublicationInput=>({eventId:"e1",status:"registration_closed",publicSlug:"americano-nocturno",previewVersion:2,approvedPreviewVersion:2,categories:[{id:"c1",name:"Intermedio",entries:8,minimumEntries:4,matches:12,scheduledMatches:12,conflicts:0}]});
describe("event publication gate",()=>{
it("publishes a complete approved preview",()=>expect(publishEvent(valid(),new Date()).status).toBe("published"));
it("reports every blocking issue together",()=>{const input=valid();input.publicSlug="";input.approvedPreviewVersion=1;input.categories[0]={...input.categories[0],entries:2,matches:4,scheduledMatches:2,conflicts:3};const codes=publicationIssues(input).map(x=>x.code);expect(codes).toEqual(["PUBLIC_SLUG_REQUIRED","INSUFFICIENT_ENTRIES","INCOMPLETE_SCHEDULE","SCHEDULE_CONFLICTS","PREVIEW_NOT_APPROVED"]);});
it("requires generated matches",()=>{const input=valid();input.categories[0].matches=0;input.categories[0].scheduledMatches=0;expect(publicationIssues(input).map(x=>x.code)).toContain("NO_MATCHES");});
it("rejects draft publication",()=>{const input=valid();input.status="draft";expect(()=>publishEvent(input,new Date())).toThrow("EVENT_NOT_PUBLISHABLE");});
it("returns structured blocking details",()=>{const input=valid();input.categories[0].conflicts=1;try{publishEvent(input,new Date());throw new Error("expected failure")}catch(error){expect(error).toBeInstanceOf(PublicationBlockedError);expect((error as PublicationBlockedError).issues[0].categoryId).toBe("c1");}});
it("makes repeated publication idempotent",()=>{const input=valid();input.status="published";expect(publishEvent(input,new Date()).status).toBe("already_published");});
});
