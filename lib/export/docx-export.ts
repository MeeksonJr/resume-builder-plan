import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ExternalHyperlink } from "docx";
import { saveAs } from "file-saver";

interface ResumeData {
    profile: any;
    workExperiences: any[];
    education: any[];
    skills: any[];
    projects: any[];
    certifications: any[];
    languages: any[];
    sectionOrder: string[];
}

// Helper to convert simple HTML to docx elements
function renderRichText(html: string): (Paragraph | TextRun)[] {
    if (!html) return [];

    // For simplicity, we'll extract text and some basic formatting
    // A robust parser would be better, but this handles common Tiptap output
    const elements: any[] = [];

    // Remove outer <p> and split by paragraphs/bullets
    const blocks = html.split(/<\/p>|<\/li>|<li>|<p>/).filter(b => b.trim().length > 0);

    blocks.forEach(block => {
        const children: TextRun[] = [];
        // Extract basic formatting from block
        let text = block;

        // Simple regex to find <b> and <i> tags
        // This is a simplified approach
        const parts = text.split(/(<b>.*?<\/b>|<i>.*?<\/i>|<strong>.*?<\/strong>|<em>.*?<\/em>)/);

        parts.forEach(part => {
            if (!part) return;

            let bold = false;
            let italics = false;
            let cleanText = part;

            if (part.startsWith('<b>') || part.startsWith('<strong>')) {
                bold = true;
                cleanText = part.replace(/<\/?(b|strong)>/g, '');
            } else if (part.startsWith('<i>') || part.startsWith('<em>')) {
                italics = true;
                cleanText = part.replace(/<\/?(i|em)>/g, '');
            }

            // Further clean any remaining tags
            cleanText = cleanText.replace(/<[^>]*>/g, '');

            if (cleanText) {
                children.push(new TextRun({
                    text: cleanText,
                    bold,
                    italics,
                    size: 20
                }));
            }
        });

        if (children.length > 0) {
            elements.push(new Paragraph({
                children,
                spacing: { before: 100 }
            }));
        }
    });

    return elements;
}

export async function exportToDocx(data: ResumeData) {
    const { profile, workExperiences, education, skills, projects, certifications, languages, sectionOrder } = data;

    const items: (Paragraph | ExternalHyperlink)[] = [];

    // Header Section
    items.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: profile.full_name || "Untitled Resume",
                    bold: true,
                    size: 32,
                }),
            ],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: `${profile.location || ""} | ${profile.phone || ""} | ${profile.email || ""}`,
                    size: 20,
                }),
            ],
        })
    );

    // Links sub-header
    const linkItems = [];
    if (profile.linkedin_url) linkItems.push(`LinkedIn: ${profile.linkedin_url}`);
    if (profile.github_url) linkItems.push(`GitHub: ${profile.github_url}`);
    if (profile.website_url) linkItems.push(`Portfolio: ${profile.website_url}`);

    if (linkItems.length > 0) {
        items.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: linkItems.join(" | "),
                        size: 18,
                        color: "0000FF",
                    }),
                ],
            })
        );
    }

    // Summary
    if (profile.summary) {
        items.push(
            new Paragraph({ text: "", spacing: { before: 200 } }),
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun({ text: "PROFESSIONAL SUMMARY", bold: true, size: 24 })],
            })
        );

        // Use helper for rich text summary
        const summaryParagraphs = renderRichText(profile.summary);
        summaryParagraphs.forEach(p => {
            if (p instanceof Paragraph) items.push(p);
        });
    }

    // Dynamic Sections based on order
    for (const sectionId of sectionOrder) {
        switch (sectionId) {
            case "experience":
                if (workExperiences.length > 0) {
                    items.push(
                        new Paragraph({ text: "", spacing: { before: 200 } }),
                        new Paragraph({
                            heading: HeadingLevel.HEADING_2,
                            children: [new TextRun({ text: "EXPERIENCE", bold: true, size: 24 })],
                        })
                    );
                    workExperiences.forEach(exp => {
                        items.push(
                            new Paragraph({
                                spacing: { before: 150 },
                                children: [
                                    new TextRun({ text: exp.position, bold: true, size: 22 }),
                                    new TextRun({ text: `\t${exp.start_date} – ${exp.is_current ? "Present" : exp.end_date}`, bold: true }),
                                ],
                                tabStops: [{ type: "right", position: 9000 }],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: exp.company, italics: true, size: 20 }),
                                    new TextRun({ text: `\t${exp.location || ""}`, italics: true }),
                                ],
                                tabStops: [{ type: "right", position: 9000 }],
                            })
                        );

                        if (exp.description) {
                            const descItems = renderRichText(exp.description);
                            descItems.forEach(item => {
                                if (item instanceof Paragraph) items.push(item);
                            });
                        }
                    });
                }
                break;

            case "education":
                if (education.length > 0) {
                    items.push(
                        new Paragraph({ text: "", spacing: { before: 200 } }),
                        new Paragraph({
                            heading: HeadingLevel.HEADING_2,
                            children: [new TextRun({ text: "EDUCATION", bold: true, size: 24 })],
                        })
                    );
                    education.forEach(edu => {
                        items.push(
                            new Paragraph({
                                spacing: { before: 150 },
                                children: [
                                    new TextRun({ text: edu.institution, bold: true, size: 22 }),
                                    new TextRun({ text: `\t${edu.start_date} – ${edu.end_date}`, bold: true }),
                                ],
                                tabStops: [{ type: "right", position: 9000 }],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `${edu.degree} in ${edu.field_of_study}`, italics: true, size: 20 }),
                                    new TextRun({ text: edu.gpa ? `\tGPA: ${edu.gpa}` : "" }),
                                ],
                                tabStops: [{ type: "right", position: 9000 }],
                            })
                        );
                    });
                }
                break;

            case "skills":
                if (skills.length > 0) {
                    items.push(
                        new Paragraph({ text: "", spacing: { before: 200 } }),
                        new Paragraph({
                            heading: HeadingLevel.HEADING_2,
                            children: [new TextRun({ text: "SKILLS", bold: true, size: 24 })],
                        }),
                        new Paragraph({
                            spacing: { before: 100 },
                            children: [new TextRun({ text: skills.map(s => s.name).join(" • "), size: 22 })],
                        })
                    );
                }
                break;

            case "certifications":
                if (certifications.length > 0) {
                    items.push(
                        new Paragraph({ text: "", spacing: { before: 200 } }),
                        new Paragraph({
                            heading: HeadingLevel.HEADING_2,
                            children: [new TextRun({ text: "CERTIFICATIONS", bold: true, size: 24 })],
                        })
                    );
                    certifications.forEach(cert => {
                        items.push(
                            new Paragraph({
                                spacing: { before: 100 },
                                children: [
                                    new TextRun({ text: cert.name, bold: true, size: 22 }),
                                    new TextRun({ text: `\t${cert.issue_date || ""}`, bold: true }),
                                ],
                                tabStops: [{ type: "right", position: 9000 }],
                            }),
                            new Paragraph({
                                children: [new TextRun({ text: cert.issuer || "", italics: true, size: 20 })],
                            })
                        );
                    });
                }
                break;

            case "projects":
                if (projects.length > 0) {
                    items.push(
                        new Paragraph({ text: "", spacing: { before: 200 } }),
                        new Paragraph({
                            heading: HeadingLevel.HEADING_2,
                            children: [new TextRun({ text: "PROJECTS", bold: true, size: 24 })],
                        })
                    );
                    projects.forEach(proj => {
                        items.push(
                            new Paragraph({
                                spacing: { before: 150 },
                                children: [
                                    new TextRun({ text: proj.name, bold: true, size: 22 }),
                                    new TextRun({ text: proj.url ? `\t${proj.url}` : "", italics: true, size: 18 }),
                                ],
                                tabStops: [{ type: "right", position: 9000 }],
                            })
                        );

                        if (proj.technologies && proj.technologies.length > 0) {
                            items.push(
                                new Paragraph({
                                    children: [new TextRun({ text: `Technologies: ${proj.technologies.join(", ")}`, italics: true, size: 18 })],
                                })
                            );
                        }

                        if (proj.description) {
                            const projDescItems = renderRichText(proj.description);
                            projDescItems.forEach(item => {
                                if (item instanceof Paragraph) items.push(item);
                            });
                        }
                    });
                }
                break;

            case "languages":
                if (languages.length > 0) {
                    items.push(
                        new Paragraph({ text: "", spacing: { before: 200 } }),
                        new Paragraph({
                            heading: HeadingLevel.HEADING_2,
                            children: [new TextRun({ text: "LANGUAGES", bold: true, size: 24 })],
                        }),
                        new Paragraph({
                            spacing: { before: 100 },
                            children: [new TextRun({ text: languages.map(l => `${l.language} (${l.proficiency})`).join(" • "), size: 22 })],
                        })
                    );
                }
                break;
        }
    }

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: items,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${profile.full_name?.replace(/\s+/g, "_") || "Resume"}.docx`);
}
