import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-15 bg-black text-white">
        <div className="absolute inset-0 bg-[url('/images/about-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="text-center max-w-3xl mx-auto">
            </div>
          </ScrollAnimation>
        </div>
      </section> 

      {/* Our Journey Section */}
      <section className="py-24">
        <div className="container mx-auto px-8 max-w-4xl">
          <ScrollAnimation animation="from-bottom" delay={0.2}>
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6 text-center">Our Journey</h2>
              
              <p className="text-gray-700 mb-8 text-center italic">
                Every journey begins with a question.
              </p>
              
              <p className="text-gray-700 mb-8">
                For us, it started not with numbers, but with uncertainty — the kind that flickers in the eyes of a new investor, or in the silence that follows a market crash. A question echoed:
              </p>
              
              <p className="text-gray-700 mb-10 text-center font-semibold text-xl italic">
                "Can we make investing simpler, honest, and human?"
              </p>
              
              <h3 className="text-2xl font-bold mb-4">The First Spark</h3>
              
              <p className="text-gray-700 mb-4">
                It wasn't born in a boardroom or an incubator, but in the pages of annual reports, in late-night candle-lit Excel sheets, and in the timeless rhythm of candlestick charts.
              </p>
              
              <p className="text-gray-700 mb-4">
                A single desk. A curious mind.
              </p>
              
              <p className="text-gray-700 mb-8">
                And an obsession — to decode the market's language without noise, bias, or hype.
              </p>
              
              <p className="text-gray-700 mb-4">
                We weren't looking to "beat the market."
              </p>
              
              <p className="text-gray-700 mb-10">
                We were searching for clarity in chaos, logic behind movement, and reason behind reaction.
              </p>
              
              <h3 className="text-2xl font-bold mb-4">Laying the Foundation</h3>
              
              <p className="text-gray-700 mb-4">
                As the layers of experience built up — through trial and triumph, through bull runs and bear mazes — we knew this passion needed structure. Compliance. Integrity.
              </p>
              
              <p className="text-gray-700 mb-4">
                And so, we became SEBI-registered — not just as a badge, but as a promise.
              </p>
              
              <p className="text-gray-700 mb-10">
                A promise to uphold ethics, to protect investor trust, and to offer research driven not by popularity, but by principle.
              </p>
              
              <h3 className="text-2xl font-bold mb-4">The Name Behind the Numbers</h3>
              
              <p className="text-gray-700 mb-4">
                Over the years, the single desk became a team. The spreadsheets became systems. The ideas turned into insights. What started as personal curiosity evolved into a professional mission:
              </p>
              
              <p className="text-gray-700 mb-8 text-center italic font-semibold">
                To help others see markets not as a gamble, but as a craft.
              </p>
              
              <p className="text-gray-700 mb-10">
                Today, our research isn't just about which stock to buy — it's about why, when, and what risk comes with it.
              </p>
              
              <p className="text-gray-700 mb-10">
                We measure our success not by how many calls hit the target, but by how many minds invest more confidently.
              </p>
              
              <h3 className="text-2xl font-bold mb-4">Looking Ahead</h3>
              
              <p className="text-gray-700 mb-4">
                We remain grounded, yet forward-looking.
              </p>
              
              <p className="text-gray-700 mb-4">
                Analytical, yet intuitive.
              </p>
              
              <p className="text-gray-700 mb-4">
                Regulated, yet creative.
              </p>
              
              <p className="text-gray-700 mb-8">
                We still chase clarity — not perfection.
              </p>
              
              <p className="text-gray-700 mb-8">
                We still learn. Every day. Every chart. Every correction.
              </p>
              
              <p className="text-gray-700 mb-4">
                Because at the heart of our journey is not just data — it's you.
              </p>
              
              <p className="text-gray-700 mb-4">
                The informed investor. The risk-taker. The believer in research over rumors.
              </p>
              
              <p className="text-gray-700 mb-4 font-semibold text-center italic">
                And this is only the beginning...
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
};

export default About; 