// Components/LocalizedLink/LocalizedLink.tsx
import React from "react";
import { Link, useParams } from "react-router-dom";

interface LocalizedLinkProps {
    to: string;
    children: React.ReactNode;
    [key: string]: any; // For other props like className, etc.
}

const LocalizedLink: React.FC<LocalizedLinkProps> = ({ to, children, ...rest }) => {
    const { lng } = useParams<{ lng: string }>();

    // Prefix the `to` path with the current language code
    const localizedTo = lng ? `/${lng}${to.startsWith("/") ? to : "/" + to}` : to;

    return (
        <Link to={localizedTo} {...rest}>
            {children}
        </Link>
    );
};

export default LocalizedLink;
