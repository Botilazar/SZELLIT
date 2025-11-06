import { Link, useParams } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const { lng } = useParams<{ lng: string }>();
  const prefix = lng ? `/${lng}` : "/en";

  return (
    <div className="szellit-navbar flex flex-col">
      <footer className="szellit-navbar text-center text-zinc-500 text-sm py-4 border-t ">
        <p> {new Date().getFullYear()} Szellit. All rights reserved. </p>
        <div className="mt-2 space-x-4">
          <Link to={`${prefix}/terms`} className="hover:underline">
            Terms
          </Link>
          <Link to={`${prefix}/privacy`} className="hover:underline">
            Privacy
          </Link>
          <Link to={`${prefix}/contact`} className="hover:underline">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
