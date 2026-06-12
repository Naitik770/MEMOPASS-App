import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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

        <h1 className="text-3xl md:text-4xl font-serif text-white mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-sm md:text-base leading-relaxed">
          <p>Last updated: June 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">1. Introduction</h2>
            <p>
              Welcome to MemoPass. We are committed to prioritizing your privacy and protecting the personal information you entrust to our digital archiving platform. This Privacy Policy details how we collect, use, and protect your data when you interact with our website and application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">2. Information We Collect</h2>
            <p>
              <strong>b. Personal Data:</strong> When you create an account, we may collect your name, email address, and profile photo provided by your authentication provider (such as Google).
            </p>
            <p>
              <strong>a. Content and Memories:</strong> We store the information you provide to create Memory Tickets. This includes text, titles, locations, dates, and images you upload or attach to your events and capsules.
            </p>
            <p>
              <strong>c. Usage Data:</strong> We automatically track standard application usage metrics (like interaction events, device type, and app performance) to maintain service stability and improve user experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">3. How We Use Information</h2>
            <p>
              We specifically use your information to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>Provide, maintain, and personalize the MemoPass experience.</li>
              <li>Securely store your Memory Tickets and Time Capsules.</li>
              <li>Authenticate users and ensure data privacy between individual profiles.</li>
              <li>Facilitate the sharing of specific Memory Tickets when you actively choose to generate and distribute a shareable link.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using cloud infrastructure (Google Cloud/Firebase). We apply industry-standard encryption and security rules to ensure that only you can access your private diaries and Time Capsules. We do not sell your personal data to third parties.
            </p>
          </section>
          
          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">5. Sharing and Visibility</h2>
            <p>
              By default, all your Memory Tickets and Collections are private. They become accessible to others only when you deliberately generate a sharing link or share a QR code for a specific item. You possess full control over your data visibility.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">6. Your Rights</h2>
            <p>
              You have the right to access, edit, or delete the personal information and memory data you have entered into MemoPass at any time. You can clear your data by removing your memory tickets or by contacting support to initiate an account deletion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl text-white font-semibold mt-8">7. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests related to this privacy policy or your user data, please contact the developer via their provided channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
