import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PublicDocumentBridge({
  destination,
  preserveLocation = true,
}: {
  destination: string;
  preserveLocation?: boolean;
}) {
  const location = useLocation();
  const href = destination + (preserveLocation ? location.search + location.hash : "");
  useEffect(() => {
    window.location.replace(href);
  }, [href]);
  return <p><a href={href}>Continue to the page</a></p>;
}
