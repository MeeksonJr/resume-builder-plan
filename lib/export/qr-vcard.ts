/**
 * ResumeForge Smart QR & vCard 3.0 Export Engine (Phase 47)
 * Generates standards-compliant contact cards and customizable QR code vectors
 * for instant networking, career fairs, and mobile sharing.
 */

export interface VCardContact {
  fullName: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  location?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  summary?: string;
}

export interface QrCodeOptions {
  size?: number;
  color?: string; // hex without '#' or with '#'
  bgColor?: string; // hex
  format?: 'png' | 'svg';
  margin?: number;
}

/**
 * Generates an API URL for a high-fidelity QR Code image.
 * Supports custom size, color, and background.
 */
export function generateResumeQrCodeUrl(
  targetUrl: string,
  options: QrCodeOptions = {}
): string {
  const size = options.size || 300;
  const format = options.format || 'png';
  const margin = options.margin ?? 1;
  const color = (options.color || '102b2b').replace('#', '');
  const bgColor = (options.bgColor || 'ffffff').replace('#', '');
  const encodedData = encodeURIComponent(targetUrl);

  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&format=${format}&color=${color}&bgcolor=${bgColor}&margin=${margin}`;
}

/**
 * Builds an RFC 6350 compliant vCard 3.0 string.
 */
export function generateVCard(contact: VCardContact): string {
  const nameParts = (contact.fullName || "Candidate").trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${contact.fullName || "Candidate"}`,
    `N:${lastName};${firstName};;;`,
  ];

  if (contact.jobTitle) {
    lines.push(`TITLE:${contact.jobTitle}`);
  }

  if (contact.email) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${contact.email}`);
  }

  if (contact.phone) {
    lines.push(`TEL;TYPE=CELL:${contact.phone}`);
  }

  if (contact.location) {
    lines.push(`ADR;TYPE=HOME:;;${contact.location};;;;`);
  }

  if (contact.resumeUrl) {
    lines.push(`URL;TYPE=Resume:${contact.resumeUrl}`);
  }

  if (contact.linkedinUrl) {
    lines.push(`URL;TYPE=LinkedIn:${contact.linkedinUrl}`);
  }

  if (contact.githubUrl) {
    lines.push(`URL;TYPE=GitHub:${contact.githubUrl}`);
  }

  if (contact.websiteUrl) {
    lines.push(`URL;TYPE=Portfolio:${contact.websiteUrl}`);
  }

  if (contact.summary) {
    const cleanSummary = contact.summary
      .replace(/<[^>]*>/g, "")
      .replace(/[\r\n]+/g, " ")
      .trim();
    lines.push(`NOTE:${cleanSummary.slice(0, 300)}`);
  }

  lines.push("PRODID:-//ResumeForge//AI Resume Builder//EN");
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

/**
 * Triggers a browser download of a .vcf file.
 */
export function downloadVCard(contact: VCardContact, filename?: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const vCardString = generateVCard(contact);
    const blob = new Blob([vCardString], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safeFilename = filename || `${(contact.fullName || "Candidate").replace(/\s+/g, "_")}_Contact.vcf`;
    link.href = url;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("Failed to download vCard:", err);
    return false;
  }
}
