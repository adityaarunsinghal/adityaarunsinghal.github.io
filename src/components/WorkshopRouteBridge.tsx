import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function WorkshopRouteBridge({
  destination,
}: {
  destination: string;
}) {
  const location = useLocation();
  // Use the matched route, including the router's case and trailing-slash tolerance.
  const href = `${destination}${location.search}${location.hash}`;

  // Canonical workshop documents do not load the SPA, so this full navigation cannot loop.
  useEffect(() => {
    window.location.replace(href);
  }, [href]);
  return (
    <main>
      <p>
        <a href={href}>Continue to the workshop page</a>
      </p>
    </main>
  );
}
