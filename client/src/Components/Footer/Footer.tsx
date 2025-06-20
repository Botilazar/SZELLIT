import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <div className="bg-zinc-900 text-white flex flex-col">
      <footer className="text-center text-zinc-500 text-sm py-4 border-t border-zinc-800">
        <p>&copy; {new Date().getFullYear()} Szellit. All rights reserved. </p>
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
