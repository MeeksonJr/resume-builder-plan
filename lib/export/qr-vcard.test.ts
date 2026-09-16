import { describe, it, expect } from "vitest";
import { generateResumeQrCodeUrl, generateVCard, type VCardContact } from "./qr-vcard";

describe("Phase 47: QR Code & vCard 3.0 Engine", () => {
  it("generates correct QR code URL with default options", () => {
    const url = generateResumeQrCodeUrl("https://resumeforge.app/r/alex-chen");
    expect(url).toContain("https://api.qrserver.com/v1/create-qr-code/");
    expect(url).toContain("data=https%3A%2F%2Fresumeforge.app%2Fr%2Falex-chen");
    expect(url).toContain("size=300x300");
    expect(url).toContain("format=png");
  });

  it("handles custom options for QR code URL generation", () => {
    const url = generateResumeQrCodeUrl("https://resumeforge.app/r/alex-chen", {
      size: 500,
      color: "#2563eb",
      bgColor: "#f8fafc",
      format: "svg",
      margin: 2,
    });
    expect(url).toContain("size=500x500");
    expect(url).toContain("color=2563eb");
    expect(url).toContain("bgcolor=f8fafc");
    expect(url).toContain("format=svg");
    expect(url).toContain("margin=2");
  });

  it("generates valid RFC 6350 vCard 3.0 string with candidate details", () => {
    const contact: VCardContact = {
      fullName: "Alex Chen",
      jobTitle: "Senior AI Software Engineer",
      email: "alex@example.com",
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA",
      resumeUrl: "https://resumeforge.app/r/alex-chen",
      linkedinUrl: "https://linkedin.com/in/alexchen",
      githubUrl: "https://github.com/alexchen",
      websiteUrl: "https://alexchen.dev",
      summary: "Passionate fullstack engineer specializing in LLM systems.",
    };

    const vCard = generateVCard(contact);

    expect(vCard).toContain("BEGIN:VCARD");
    expect(vCard).toContain("VERSION:3.0");
    expect(vCard).toContain("FN:Alex Chen");
    expect(vCard).toContain("N:Chen;Alex;;;");
    expect(vCard).toContain("TITLE:Senior AI Software Engineer");
    expect(vCard).toContain("EMAIL;TYPE=INTERNET,WORK:alex@example.com");
    expect(vCard).toContain("TEL;TYPE=CELL:+1 (555) 234-5678");
    expect(vCard).toContain("ADR;TYPE=HOME:;;San Francisco, CA;;;;");
    expect(vCard).toContain("URL;TYPE=Resume:https://resumeforge.app/r/alex-chen");
    expect(vCard).toContain("URL;TYPE=LinkedIn:https://linkedin.com/in/alexchen");
    expect(vCard).toContain("URL;TYPE=GitHub:https://github.com/alexchen");
    expect(vCard).toContain("URL;TYPE=Portfolio:https://alexchen.dev");
    expect(vCard).toContain("NOTE:Passionate fullstack engineer specializing in LLM systems.");
    expect(vCard).toContain("END:VCARD");
  });

  it("safely handles minimal contact input without crashing", () => {
    const minimalContact: VCardContact = {
      fullName: "Cher",
    };

    const vCard = generateVCard(minimalContact);
    expect(vCard).toContain("BEGIN:VCARD");
    expect(vCard).toContain("FN:Cher");
    expect(vCard).toContain("N:;Cher;;;");
    expect(vCard).toContain("END:VCARD");
  });
});
