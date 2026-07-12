import{describe,expect,it}from"vitest";import{openSecret,sealSecret}from"./secret-box";
const authSecret="an-authentication-secret-with-32-characters";
describe("secret box",()=>{
it("seals and opens a secret without storing plaintext",()=>{const box=sealSecret("JBSWY3DPEHPK3PXP",authSecret);expect(box).not.toContain("JBSWY3DPEHPK3PXP");expect(openSecret(box,authSecret)).toBe("JBSWY3DPEHPK3PXP")});
it("produces a different box for the same plaintext",()=>{expect(sealSecret("JBSWY3DPEHPK3PXP",authSecret)).not.toBe(sealSecret("JBSWY3DPEHPK3PXP",authSecret))});
it("rejects the wrong key, tampering, and malformed boxes",()=>{const box=sealSecret("JBSWY3DPEHPK3PXP",authSecret);expect(()=>openSecret(box,"a-different-secret-with-32-characters!!")).toThrow("SECRET_BOX_INVALID");const[iv,payload,tag]=box.split(".");expect(()=>openSecret(`${iv}.${payload.slice(0,-2)}AB.${tag}`,authSecret)).toThrow("SECRET_BOX_INVALID");expect(()=>openSecret("not-a-box",authSecret)).toThrow("SECRET_BOX_INVALID")});
});
