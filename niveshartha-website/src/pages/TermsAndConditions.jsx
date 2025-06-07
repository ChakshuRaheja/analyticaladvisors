import React from 'react';
import ScrollAnimation from '../components/ScrollAnimation';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <ScrollAnimation animation="from-bottom" delay={0.2}>
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Terms & Conditions</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
              
              <p className="text-gray-700 mb-6">
                Thank you for showing your interest in www.analyticaladvisors.com. Please read these Terms of Service carefully as they constitute a legal agreement between you ("User") and Analytical Advisors. Analytical Advisors owns and controls this website, www.analyticaladvisors.com ("Website/AnalyticalAdvisors"), as well as the domain name. Analytical Advisors is a registered SEBI Research Analyst (Registration No.INH000009047) under the SEBI (Research Analysts) Regulations, 2014. By accessing or using the Website and/or any related mobile or software applications (collectively the "Sites"), accessing or using the content, information, services, features, or resources available or enabled through the Sites, including but not limited to information delivery through the Sites whether existing now or in the future that link to these Terms of Use (collectively with the Sites, the "Service"), however accessed or used, the User: (1) agrees to be bound by the Terms of Use; (2) These Terms of Service have an impact on the User's legal rights and obligations. Except as otherwise provided herein, the User may not access or use the Service if he or she does not agree to be bound by these Terms of Use. Please keep in mind that Analytical Advisors reserves the right to change these Terms of Service at any time and without prior notice to the User ("Updated Terms").
              </p>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Information and materials on this website may be used</h2>
                <p className="text-gray-700 mb-4">
                  The products and services mentioned on this website are only provided by Analytical Advisors in jurisdictions where doing so is lawful. The only authority to decide who is eligible to subscribe to any of the Services remains with Analytical Advisors. Nonetheless, you are allowed to download the content from this website for your own personal use as long as you keep all applicable intellectual property legends. We do not guarantee or represent that your use of any materials on this website won't violate the rights of third parties that are not related to or owned by Analytical Advisors. It is made clear that unjustified alteration of the data and information contained within the website's content as well as limitless or wholesale reproduction, copying, or duplication of the content for commercial purposes are not permitted.
                </p>
                <p className="text-gray-700">
                  When you register for the service, Analytical Advisors may store the data you supply and give aggregate statistical data about users to prospective advertisers and other third parties. Your information may be used by Analytical Advisors to notify you about additional publications, goods, and services. Your name, address, phone number, email address, and any other particular personal information won't be shared with anyone else besides Analytical Advisors and its affiliates without your permission. Any information that, in our sole judgement, violates or is claimed to violate any law or either the spirit or language of these conditions of use may be removed or edited.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Intellectual Property</h2>
                <p className="text-gray-700 mb-4">
                  Analytical Advisors and any other third party own the content and information contained within our Website or delivered to you in connection with your use of our Website (where applicable). The trademarks, trade names, and logos (collectively, "Trade Marks") used and displayed on our website include both our registered and unregistered Trade Marks, as well as those of third parties. Nothing on our Website should be interpreted as granting any licence or right to use any Trade Marks displayed on it. On our Website, we retain all proprietary rights. Users are not permitted to use the same without the prior written consent of Analytical Advisors or such other third parties. Without the prior written consent of Analytical Advisors, no part of the materials on this Website may be modified, reproduced, stored in a retrieval system, transmitted (in any form or by any means), copied, distributed, used for creating derivative works, or used in any other way for commercial or public purposes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Maintaining Confidentiality</h2>
                <p className="text-gray-700 mb-4">
                  You also acknowledge that the Website may contain information that we have designated as confidential, and that you will not disclose such information without our prior written consent. Your information is considered confidential and will not be disclosed to any third party except as specified in this and any other terms of use applicable to our website. You will not, directly or indirectly, disclose information about the Services, products and our strategies including the features or benefits of the software, screenshots, or any other related content or information, to any third party in any media or in any manner, and will keep all such information confidential, subject to any disclosure required by law, court order, or any government or regulatory authority. You may not make any public announcement, press release, or communication about these Terms of Service without the prior express written consent of Analytical Advisors.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Eligibility</h2>
                <p className="text-gray-700 mb-4">
                  The User of this Website certifies and acknowledges that they are a natural or legal person who has reached majority age (18 years age and 21 years in case a guardian is appointed). The Indian Contract Act, 1872 prohibits some individuals, such as those who are of unsound mind or who have un-dishcharge insolvents from entering into legally enforceable contracts. These individuals are not permitted to use the website. Analytical Advisors may, at any time, in its sole discretion, with or without prior notice, delete the User's profile and any content or information posted by the User on the Website and/or prohibit the User from using or accessing the Website if the User violates any of these terms or otherwise violates an agreement entered into through the medium of the Website. This includes, without limitation, if Analytical Advisors believes that you have not reached the age of Majority.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Termination & Refund Policy</h2>
                <p className="text-gray-700 mb-4">
                  We adhere to a no-refund rule. The payment cannot be reimbursed after it has been made. All orders are final, and we reserve the right to decide how to handle any disagreements or cancellations. Please be aware that payments paid for our services are neither refundable nor cancellable. The user acknowledges, represents, and certifies that they have read and comprehended our Conditions of Use and Privacy policy, both of which are available on the website, by making a payment. Before subscribing, please review the stocks we recommend to our subscribers and the website's performance if you want to assess the calibre of our services. All Payment Transactions processed through the Service by the Buyer are non-refundable and non-reversible by the Buyer, unless otherwise specified in these Terms of Use or as mandated by law.
                </p>
                <p className="text-gray-700">
                  At our sole discretion, we reserve the right to grant refunds or credits. We are not obligated to give the same or a comparable refund in the future even if we issue a refund or credit. Offers, promotions, and subscription fees are all subject to change. Your order will be subject to the terms and conditions that are in place at the time of ordering it, as well as the price that is being placed. The user acknowledges, represents, and certifies that they have read and comprehended our Conditions of use and Privacy policy, both of which are available on the website, by making a payment. Before subscribing, please review the stocks we recommend to our subscribers and the website's performance if you want to assess the potential of our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Other website links and non-transferable</h2>
                <p className="text-gray-700 mb-4">
                  There may be links to other websites on Analytical Advisors. These websites are not examined, monitored, or reviewed by Analytical Advisors for trustworthiness or accuracy; as a result, Analytical Advisors disclaims all liability with regard to the information, accuracy, and viewpoints expressed therein. Any connected website's inclusion on Analytical Advisors does not constitute our endorsement or support of the linked website. You do it at your own risk if you decide to leave Analytical Advisors and visit these outside websites.
                </p>
                <p className="text-gray-700">
                  You are not permitted to assign your use of Analytical Advisors. Any password or other access privilege granted to you to access information, content, documents, or messages (through email or SMS on a mobile device) is non-transferable. Any violation of the same will be regarded as a breach of these Conditions of Use, and the account will be immediately terminated without a prorated return of the active subscription.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Alerts</h2>
                <p className="text-gray-700 mb-4">
                  By using this website, you are deemed to have given your consent to receiving calls, autodialed and/or pre-recorded message calls, SMS, from us or our vendors, at any time, on the telephone number / contact information that has been provided by you, even if the contact number you have entered is on DND (Do not disturb). We reserve the right to contact the User via voice call or SMS at the contact number provided by the User at the time of registration or reservation to provide confirmation of the User's inquiry, booking confirmation, cancellation, payment confirmation, schedule change, or any other relevant information. We might also get in touch with you to ask questions about your query or to get more information about it. Your agreement to receive SMSs from us and our vendors whenever we see fit is also implied by your usage of our website. This permission to be contacted covers calls for informational purposes as well as calls for marketing and promotional objectives, among other things.
                </p>
                <p className="text-gray-700 mb-4">
                  The rules of the Department of Telecom (DoT) and the Telecom Regulatory Authority of India (TRAI), as well as the terms and conditions of any third-party merchants whose services Analytical Advisors may use, will apply to our SMS notifications. Even if your phone number is listed in the Do Not Disturb (DND) registry, you agree to let us send you SMS alerts by signing up for them. No returns are committed, guaranteed, assured, or promised based on our recommendation. You only take decisions depending on how much risk you can personally tolerate and how the stock market appears to you. You hereby give your unconditionally consent that such communications via SMS and/or voice call are (a) made at your request and with your consent, (b) transactional and not a "unsolicited commercial communication" as per the rules of the Telecom Regulation Authority of India (TRAI), and (c) in accordance with the applicable rules of the TRAI or such other authority in India and abroad. We send out all of our recommendation by SMS, email, and app notification. Only the infrastructure of the vendor and the network of the recipient determines whether an SMS is delivered to a national or international number. We won't be held liable if the SMS is delivered late or not at all.
                </p>
                <p className="text-gray-700">
                  You hereby agree and promise to hold us harmless from any losses or damages incurred by us as a result of any actions taken by TRAI, Access Providers (as per TRAI regulations), or any other authority due to any false complaint raised by you against us with respect to the aforementioned intimations, or due to a wrong number or email address being provided by you for any reason at all.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Indemnification</h2>
                <p className="text-gray-700 mb-4">
                  You agree to indemnify, save, and hold Analytical Advisors, its affiliates, contractors, employees, officers, directors, agents, and third-party associates, licensors, and partners harmless from and against any and all claims, losses, damages, and liabilities, costs and expenses, including without limitation legal fees and expenses, arising out of or related to your use or misuse of the services or the Website, any violation of these Terms of Use by you, or any breach of the representation. Analytical Advisors reserves the right to assume the exclusive defence and control of any matter for which you are required to indemnify Analytical Advisors, including the right to settle, at your expense, and you agree to cooperate with Analytical Advisors in the defence and settlement of these claims. When Analytical Advisors becomes aware of a claim, action, or proceeding brought by a third party that is subject to the foregoing indemnification, he will use reasonable efforts to notify you.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. No Warranty</h2>
                <p className="text-gray-700 mb-4">
                  The accuracy, completeness, and timeliness of the news and information made available through the Service are not guaranteed by Analytical Advisors or its affiliates. You agree that using any such news, statements, or other information at your sole discretion is at your own risk.
                </p>
                <p className="text-gray-700">
                  You agree not to rely on any information or other content made available through the Service without conducting your own independent research and using your own business judgement. Analytical Advisors does not guarantee the accuracy of the information made available through the Service. Inaccuracies or delays in the information or other content made available through the Service, as well as any actions done in reliance thereon, are not the responsibility of Analytical Advisors or any of its data or content suppliers. Nothing in this document should be taken as a recommendation to buy or sell any securities, nor is there any implied or intended offer on our part to sell or buy any securities. Before making an investment or placing an order with their trading member, NRI Users must verify that the stocks we recommend are not on the RBI's list of prohibited securities.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Severability</h2>
                <p className="text-gray-700 mb-4">
                  The remaining provisions of these Conditions of Use shall remain valid and enforceable in accordance with their terms even if one or more of them are declared invalid or unenforceable by a court order or decision.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Recommendations, Conflicts, and Complaints</h2>
                <p className="text-gray-700 mb-4">
                  Customer Support should be contacted first at info@analyticaladvisors.com with any suggestions or grievances.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Privacy Principles</h2>
                <p className="text-gray-700 mb-4">
                  Our Conditions of Use and our Privacy Policy, both of which are subject to change from time to time, should be read together.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">13. Statutes that apply</h2>
                <p className="text-gray-700 mb-4">
                  The laws of India apply to your use of this website and any Terms & Conditions. The Mumbai courts will have sole jurisdiction over any issues resulting from using the website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">14. Additional</h2>
                <p className="text-gray-700 mb-4">
                  Analytical Advisors maintains the right to add, change, modify, remove, replace any of the contents, columns, or sections whole or in part with any other contents, columns, or parts, whether or not they are comparable, or to withdraw it altogether without prior notice. In the event of a disagreement with any party, our decision shall be final and binding.
                </p>
              </section>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
};

export default TermsAndConditions;