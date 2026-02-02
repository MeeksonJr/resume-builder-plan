
export default function TermsPage() {
    return (
        <div className="py-24 bg-background">
            <div className="container mx-auto px-4 max-w-4xl prose prose-sm dark:prose-invert">
                <h1>Terms of Service</h1>
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <h2>1. Agreement to Terms</h2>
                <p>
                    These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and ResumeBuilder ("we," "us" or "our"), concerning your access to and use of the ResumeBuilder website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                </p>

                <h2>2. Intellectual Property Rights</h2>
                <p>
                    Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United States, foreign jurisdictions, and international conventions.
                </p>

                <h2>3. User Representations</h2>
                <p>
                    By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.
                </p>

                <h2>4. Prohibited Activities</h2>
                <p>
                    You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                </p>

                <h2>5. Modifications and Interruptions</h2>
                <p>
                    We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Site.
                </p>
            </div>
        </div>
    );
}
