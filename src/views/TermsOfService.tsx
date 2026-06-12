import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-slate-300 font-sans p-6 md:p-12 overflow-y-auto">
      <div className="max-w-3xl mx-auto pb-24">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl md:text-4xl font-serif text-white mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-sm md:text-base leading-relaxed">
          <p>Last updated: June 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MemoPass (the "Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">2. Description of Service</h2>
            <p>
              MemoPass provides users with digital tools to create, store, and organize digital memory tickets, time capsules, and collections. The platform allows for the hosting and linking of user-generated photographic and textual content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">3. User Accounts</h2>
            <p>
              You are responsible for safeguarding the credentials that you use to access the Service via third-party providers (e.g., Google login). You are responsible for any activities or actions under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">4. User Content</h2>
            <p>
              You retain all rights to any content you submit, post, or display on or through the Service. By submitting content, you grant MemoPass a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, and distribute your content exclusively for the purpose of providing and operating the Service.
            </p>
            <p>
              You agree not to upload content that is illegal, defamatory, abusive, or infringes upon others' intellectual property or privacy rights. MemoPass reserves the right to remove any content that violates these provisions at our sole discretion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">5. Termination</h2>
            <p>
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">6. Disclaimer of Warranties</h2>
            <p>
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. MemoPass makes no representations or warranties of any kind regarding the reliability, accuracy, or availability of the digital archives and data storage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">7. Limitation of Liability</h2>
            <p>
              In no event shall MemoPass be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
