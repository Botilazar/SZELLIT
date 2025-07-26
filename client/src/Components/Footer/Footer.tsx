
import "./Footer.css";

const Footer = () => {
  return (
    <div className="szellit-navbar flex flex-col">
      <footer className="szellit-navbar text-center text-zinc-500 text-sm py-4 border-t ">
        <p> {new Date().getFullYear()} Szellit. All rights reserved. </p>
        <div className="mt-2 space-x-4">
          <a href="/terms" className="hover:underline">
            Terms
          </a>
          <a href="/privacy" className="hover:underline">
            Privacy
          </a>
          <a href="/contact" className="hover:underline">
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
