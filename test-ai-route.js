
async function testJobMatch() {
    try {
        const response = await fetch('http://localhost:3000/api/ai/job-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resumeData: {
                    personalInfo: { fullName: "Test User" },
                    workExperience: [{ company: "Tech Inc", position: "Full Stack Developer", highlights: ["Built a resume builder"] }],
                    skills: [{ name: "React" }, { name: "TypeScript" }]
                },
                jobPosting: "Looking for a Senior React Developer with TypeScript experience. Must have 5 years of experience building web applications."
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            return;
        }

        const data = await response.json();
        console.log('API Success:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Fetch Failed:', error);
    }
}

testJobMatch();
