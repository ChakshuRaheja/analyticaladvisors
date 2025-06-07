import React from 'react';
import ScrollAnimation from '../components/ScrollAnimation';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <ScrollAnimation animation="from-bottom" delay={0.2}>
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

              <p className="text-gray-700 mb-6">
                Welcome to Niveshartha Private Limited, where your privacy is prioritised and protected to the greatest extent possible where our website www.niveshartha.com & our Niveshartha Application comes under this privacy policy. We are committed to protecting your privacy and data in accordance with the provisions of the Information Technology Act 2000 (the "Act") and the Information Technology (Reasonable security practises and procedures and sensitive personal data or information) Rules, 2011 (the "Rules") framed and issued by the Government of India in accordance with the Act. We are also committed to using your personal information responsibly and justifiably in order to provide our services. This user-friendly document is intended to assist you in understanding our common practises with regard to the personal information we collect from our users on our website, located at www.niveshartha.com ("website"), related online services, and for other lawful purposes. Before using the Website or submitting any sensitive personal information or data, please read this Privacy Policy.
              </p>

              <p className="text-gray-700 mb-6">
                The Act and the Rules impose how we can collect, receive, possess, store, deal with, or handle information from information providers.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                <p className="text-gray-700 mb-4">
                  We gather the following information, which includes the following but is not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Name, address, phone number, email address, Internet protocol address, age, and gender</li>
                  <li>Preferences and settings for the homepage and other pages on our website, including time zone, language, and other preferences</li>
                  <li>URL of the last page visited before visiting our website</li>
                  <li>Your browsing behavior, search history, links visited, services viewed, features utilized to view services, the duration of such views, and so on</li>
                  <li>Information obtained via peer-to-peer electronic communication (e.g., telephonic call, email, etc.)</li>
                  <li>User-Generated Content and/or any particular Online Interaction (Examples: Testimonials, and Feedback)</li>
                  <li>KYC standards</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  In addition to the aforementioned, we may run surveys, polls, and other information-gathering tools on our website to obtain your input on a variety of topics, including your experience with our website, the products and services offered, etc. Also, we collect information on surfing behavior, viewed pages, and other data required for analytics.
                </p>
                <p className="text-gray-700 mt-4">
                  By sharing the Personal Information of another individual, you represent that you are authorized to do so and/or that you have obtained all required consents from that individual for us to collect, use, and disclose his or her Personal Information in accordance with this Privacy Statement. In addition, you agree to adhere to follow KYC standards as defined by SEBI.
                </p>
                <p className="text-gray-700 mt-4">
                  Niveshartha may, at its sole option, suspend/hold its services if the KYC requirements are incomplete or wrong. pending. The User shall not hold Niveshartha responsible for such occurrences.
                </p>
                <p className="text-gray-700 mt-4">
                  This document does not apply to any information that is not protected by privacy laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Use of Information</h2>
                <p className="text-gray-700 mb-4">
                  Usage of the user's information provided by the user for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>To provide the requested service</li>
                  <li>Provide you our services i.e of Research Analyst</li>
                  <li>To notify you through email</li>
                  <li>To deliver newsletters, research reports, surveys, offers, and other promotional materials pertaining to our Services, as well as for other marketing reasons</li>
                  <li>To create, improve, market, sell, or supply our products or services or those of businesses with which we have a business relationship</li>
                  <li>To generate invoices, manage accounts, and collect and handle payments</li>
                  <li>To provide suggestions or instructions on how to use our website</li>
                  <li>To customise the service we serve you</li>
                  <li>To manage and monitor your transactions</li>
                  <li>To audit compliance with our policies, contractual obligations, and statutory obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Communications</h2>
                <p className="text-gray-700">
                  When you use the website or give us emails or other data, information, or communication, you agree and understand that we will communicate with you using electronic records, and you consent to receive communications from us using electronic records on a periodic basis, or as and when necessary. We may contact with you by email or other electronic or non-electronic means.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Disclosure Policy</h2>
                <p className="text-gray-700 mb-4">
                  We disclose your personal information as outlined in this section:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>We shall share your personal information with our staff and workers for the purpose of providing services</li>
                  <li>We only share information with third parties when necessary to offer products or services</li>
                  <li>We may use third-party advertising businesses to show advertisements</li>
                  <li>We may share aggregated, non-Personal Information with third parties</li>
                  <li>We may be required to disclose information to law enforcement or courts</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Safeguarding Your Privacy – Safety</h2>
                <p className="text-gray-700">
                  Niveshartha takes appropriate precautions to prevent unauthorised access to or disclosure of our Users' information. All information about our Users is protected in our offices and our staff are regularly updated on security and privacy policies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Your Options- Choice/Opt-out</h2>
                <p className="text-gray-700">
                  Users who no longer want to receive communications from us can opt out by sending an email to research@niveshartha.com.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Retention and Erasure of Data</h2>
                <p className="text-gray-700">
                  We retain your Information for as long as necessary to fulfil our legitimate interests and legal obligations. You can request deletion of your personal information by closing your account.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Phishing</h2>
                <p className="text-gray-700">
                  We implement security measures to protect against phishing and unauthorized access. Contact us immediately at research@niveshartha.com if you suspect any unauthorized use of your account.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Additional Websites and Services</h2>
                <p className="text-gray-700">
                  We are not responsible for third-party websites or services linked to or from our Services. Our Privacy Statement does not apply to these external sites.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
                <p className="text-gray-700">
                  For questions about this Privacy Statement, contact us at:
                </p>
                <p className="text-gray-700 mt-2">
                  Niveshartha Pvt Ltd<br />
                  No.189k, No.207 189, 9th main, 6th Sector,<br />
                  HSR Layout, Bengaluru - 560102, Karnataka - India<br />
                  Email: research@niveshartha.com
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Policy Changes</h2>
                <p className="text-gray-700">
                  We reserve the right to update this Privacy Statement at any time. Continued use of the Website after changes constitutes acceptance of Updated Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Corporate Structure Changes</h2>
                <p className="text-gray-700">
                  Information may be transferred in case of organizational changes, with reasonable efforts to maintain privacy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">13. Conflicts and Authority</h2>
                <p className="text-gray-700">
                  Any disputes relating to this Privacy Policy will be settled through the Dispute Resolution procedure outlined in our Terms of Use / Service in Bangalore, Karnataka jurisdiction only.
                </p>
              </section>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
};

export default PrivacyPolicy;