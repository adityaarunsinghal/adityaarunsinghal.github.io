// Preserve known bookmarks from the previous GitHub Pages SPA routing.
(() => {
  const next = (function legacyTarget(pathname, search, hash, entries = routeEntries) {
	const legacy = search.startsWith("?/");
	let requestedPath = pathname;
	let query = search;
	if (legacy) {
		const decoded = search.slice(1).split("&").map((part) => part.replace(/~and~/g, "&")).join("?");
		const separator = decoded.indexOf("?");
		requestedPath = separator < 0 ? decoded : decoded.slice(0, separator);
		query = separator < 0 ? "" : decoded.slice(separator);
	}
	let key;
	try {
		key = decodeURIComponent(requestedPath).replace(/\/index\.html$/i, "/").replace(/\/+$/, "").toLowerCase();
	} catch {
		return legacy ? "/404.html" : null;
	}
	const destination = new Map(entries).get(key);
	if (!destination) return legacy ? "/404.html" : null;
	const target = `${destination}${query}${hash}`;
	return target === `${pathname}${search}${hash}` ? null : target;
})(window.location.pathname, window.location.search, window.location.hash, [["","/"],["/index","/"],["/static","/static/"],["/static/index","/static/"],["/404","/404.html"],["/login","/login/"],["/progress","/progress/"],["/lovesingy","/lovesingy/"],["/translate","/translate/"],["/linkedin","/linkedin/"],["/github","/github/"],["/instagram","/instagram/"],["/facebook","/facebook/"],["/youtube","/youtube/"],["/x","/x/"],["/twitter","/twitter/"],["/wife","/wife/"],["/latest-resume","/latest-resume/"],["/agentic-ai-workshop","/agentic-ai-workshop/"],["/agentic-ai-workshop-2025","/agentic-ai-workshop-2025/"],["/agentic-ai-workshop/registration-form","/agentic-ai-workshop/registration-form/"],["/registration-form","/agentic-ai-workshop/registration-form/"],["/agentic-ai-workshop/feedback","/agentic-ai-workshop-2025/feedback/"],["/agentic-ai-workshop-2025/feedback","/agentic-ai-workshop-2025/feedback/"],["/agentic-ai-workshop-2025/registration-form","/agentic-ai-workshop-2025/registration-form/"],["/developers","/developers/"],["/privacy","/privacy/"]]);
  if (next) window.location.replace(next);
})();
