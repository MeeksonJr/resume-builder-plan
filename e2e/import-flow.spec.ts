import { test, expect } from '@playwright/test';

test.describe('LinkedIn Profile Import Engine (Phase 41 E2E)', () => {
  test('API accepts demo profile URL and returns high-fidelity preview payload', async ({ request }) => {
    const res = await request.post('/api/ai/import/linkedin', {
      data: {
        profileUrl: 'https://www.linkedin.com/in/alex-morgan-tech',
        previewOnly: true,
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.preview).toBeDefined();
    const candidateName = body.preview.personalInfo?.fullName || body.preview.name;
    expect(candidateName).toContain('Alex Morgan');
    const experiences = body.preview.workExperience || body.preview.experiences || [];
    expect(experiences.length).toBeGreaterThan(0);
    expect(body.preview.skills.length).toBeGreaterThan(0);
  });

  test('API accepts raw text fallback for manual paste', async ({ request }) => {
    const sampleText = `
      Alex Dev
      Senior Software Architect at CloudScale
      Experience:
      CloudScale - Senior Architect (2021 - Present)
      Led migration to microservices on AWS and Kubernetes.
      Education:
      BS Computer Science, Stanford University (2016-2020)
      Skills: TypeScript, Go, React, Kubernetes
    `;

    const res = await request.post('/api/ai/import/linkedin', {
      headers: {
        'x-e2e-test': 'true',
      },
      data: {
        linkedinText: sampleText,
        previewOnly: true,
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.preview).toBeDefined();
    const name = body.preview.personalInfo?.fullName || body.preview.name;
    expect(name).toContain('Alex Dev');
  });

  test('rejects empty payload with informative validation error', async ({ request }) => {
    const res = await request.post('/api/ai/import/linkedin', {
      data: {
        profileUrl: '',
        linkedinText: '',
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Please provide');
  });
});
