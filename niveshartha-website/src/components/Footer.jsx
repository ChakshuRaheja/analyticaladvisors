import { Link } from 'react-router-dom';
import { SocialMediaBaseUrls } from '../constants/systemEnums';
import { useNavigationBlock } from '../context/NavigationBlockContext';

const Footer = () => {
  const { handleInterceptNavigation } = useNavigationBlock();
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Analytical Advisors</h3>
            <p className="text-gray-400 mb-4">
              Transforming investment experiences with advanced technology and expert guidance.
            </p>
            <p className="text-gray-400 mb-4">
               Registration No.: INH000020183<br />
              Valid till: Mar 26, 2030
            </p>
            <div className="flex space-x-4">
              <a href={SocialMediaBaseUrls.YouTube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">YouTube</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
              <a href={SocialMediaBaseUrls.Instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href={SocialMediaBaseUrls.LinkedIn} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-3.97-3.113-5 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href={SocialMediaBaseUrls.Twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleInterceptNavigation('/')} className="text-gray-400 hover:text-white transition-colors">Home</button>
              </li>
              <li>
                <button onClick={() => handleInterceptNavigation('/about')} className="text-gray-400 hover:text-white transition-colors">About Us</button>
              </li>
              <li>
                <button onClick={() => handleInterceptNavigation('/subscription')} className="text-gray-400 hover:text-white transition-colors">Subscription</button>
              </li>
              <li>
                <button onClick={() => handleInterceptNavigation('/contact')} className="text-gray-400 hover:text-white transition-colors">Contact Us</button>
              </li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleInterceptNavigation("/terms")} className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</button>
              </li>
              <li>
                <button onClick={() => handleInterceptNavigation("/privacy-policy")} className="text-gray-400 hover:text-white transition-colors">Privacy Policy</button>
              </li>
              <li>
                <button onClick={() => handleInterceptNavigation("/disclaimer")} className="text-gray-400 hover:text-white transition-colors">Disclaimer</button>
              </li>
              <li>
                <button onClick={() => handleInterceptNavigation("/investor-charter")} className="text-gray-400 hover:text-white transition-colors">Investor Charter</button>
              </li>
              <li>
                <button onClick={() => handleInterceptNavigation("/investor-grievance")} className="text-gray-400 hover:text-white transition-colors">Investor Grievance</button>
              </li>
              <li>
                <a href="https://smartodr.in/login" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Raise A Dispute</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <address className="not-italic text-gray-400">
              <p className="mb-2">GBP No. 32, Ground Floor<br />New Market, Timarpur<br /></p>
              <p className="mb-2">National Capital Territory of Delhi</p>
              <p className="mb-2">Delhi,110007</p>
              <p className="mb-2">Phone: +91 97529 18378</p>
              <p className="mb-4">Email: support@analyticaladvisors.in</p>
            </address>
           
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p className="mb-2">&copy; {new Date().getFullYear()} Analytical Advisors. All rights reserved.</p>
          <p className="text-xs mt-4">
            "Investment in securities market are subjected to market risks, Read all the related documents carefully before investing"<br />
            <strong>Disclaimer:</strong> Registration granted by SEBI and certification from NISM in no way guarantee performance of the Research Analyst or provide any assurance of returns to investor.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;