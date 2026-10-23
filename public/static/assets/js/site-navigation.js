/*
 * Native navigation for the Dimension layout by HTML5 UP (html5up.net | @ajlkn).
 * Original layout licensed under CCA 3.0: html5up.net/license.
 */
(() => {
  function initialize() {
    const body = document.body;
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const main = document.getElementById('main');
    if (!header || !footer || !main) return;

    const articles = Array.from(main.children).filter((node) => node.tagName === 'ARTICLE');
    const byId = new Map(articles.map((article) => [article.id, article]));
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const timers = new Set();
    let desired = null;
    let displayed = null;
    let returnFocus = null;
    let generation = 0;

    const nav = header.querySelector('nav');
    const items = nav ? Array.from(nav.querySelectorAll('li')) : [];
    if (items.length && items.length % 2 === 0) {
      nav.classList.add('use-middle');
      items[items.length / 2].classList.add('is-middle');
    }

    function cancelTransitions() {
      generation++;
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      body.classList.remove('is-switching');
    }

    function after(delay, callback) {
      const current = generation;
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (current === generation) callback();
      }, delay);
      timers.add(timer);
    }

    function focus(element) {
      if (element?.isConnected) element.focus({ preventScroll: true });
    }

    function setHomeHidden(hidden) {
      header.inert = footer.inert = hidden;
      header.style.display = footer.style.display = hidden ? 'none' : '';
    }

    function hideArticles() {
      for (const article of articles) {
        article.classList.remove('active');
        article.style.display = 'none';
        article.inert = true;
        article.removeAttribute('aria-modal');
      }
    }

    function mount(article, immediate) {
      hideArticles();
      setHomeHidden(true);
      main.style.display = 'flex';
      article.style.display = 'block';
      article.inert = false;
      article.setAttribute('aria-modal', 'true');
      displayed = article;
      const activate = () => {
        article.classList.add('active');
        scrollTo(0, 0);
        focus(article);
      };
      if (immediate) activate();
      else after(25, activate);
    }

    function change(article, initial = false) {
      if (article === desired && !initial) return;
      const previous = displayed;
      const wasVisible = body.classList.contains('is-article-visible');
      const oldFocus = document.activeElement;
      desired = article;
      cancelTransitions();
      const immediate = initial || motion.matches;
      const delay = immediate ? 0 : 325;

      if (article) {
        if (!wasVisible) {
          returnFocus = oldFocus !== body && !main.contains(oldFocus)
            ? oldFocus : header.querySelector(`a[href="#${article.id}"]`);
        }
        body.classList.add('is-article-visible');
        header.inert = footer.inert = true;
        if (previous) {
          previous.classList.remove('active');
          previous.inert = true;
        }
        if (immediate) {
          body.classList.add('is-switching');
          mount(article, true);
          // Commit the settled initial/reduced-motion styles before restoring transitions.
          article.getBoundingClientRect();
          after(0, () => body.classList.remove('is-switching'));
        } else after(delay, () => mount(article, false));
      } else {
        if (immediate) body.classList.add('is-switching');
        if (previous) {
          previous.classList.remove('active');
          previous.inert = true;
        }
        after(delay, () => {
          hideArticles();
          displayed = null;
          main.style.display = 'none';
          setHomeHidden(false);
          after(immediate ? 0 : 25, () => {
            body.classList.remove('is-article-visible');
            scrollTo(0, 0);
            focus(returnFocus || header.querySelector('a[href]'));
            returnFocus = null;
            if (immediate) {
              header.getBoundingClientRect();
              after(0, () => body.classList.remove('is-switching'));
            }
          });
        });
      }
    }

    function targetFromHash() {
      if (!location.hash || location.hash === '#') return null;
      try { return byId.get(decodeURIComponent(location.hash.slice(1))); }
      catch { return undefined; }
    }

    function removeEmptyFragment() {
      if ((!location.hash || location.hash === '#') && location.href.endsWith('#')) {
        history.replaceState(history.state, '', `${location.pathname}${location.search}`);
      }
    }

    function readLocation() {
      const article = targetFromHash();
      if (article !== undefined) {
        if (!article) removeEmptyFragment();
        change(article);
      }
    }

    function close() {
      if (!desired) return;
      history.pushState(null, '', `${location.pathname}${location.search}`);
      change(null);
    }

    for (const article of articles) {
      const heading = article.querySelector('h2');
      if (heading && !heading.id) heading.id = `${article.id}-title`;
      article.tabIndex = -1;
      article.setAttribute('role', 'dialog');
      if (heading) article.setAttribute('aria-labelledby', heading.id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'close';
      button.textContent = 'Close';
      button.setAttribute('aria-label', `Close ${heading?.textContent || article.id}`);
      button.addEventListener('click', close);
      article.append(button);
    }

    body.addEventListener('click', (event) => {
      // Use the original event path: launching a video replaces its clicked link.
      if (desired && !event.composedPath().some((node) => articles.includes(node))) {
        close();
      }
    });

    addEventListener('keydown', (event) => {
      if (!desired) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'Tab') {
        const controls = Array.from(desired.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
          'textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
        )).filter((control) => control.getClientRects().length && !control.closest('[inert]'));
        const first = controls[0], last = controls[controls.length - 1];
        const current = document.activeElement;
        if (!first) {
          event.preventDefault(); focus(desired);
        } else if (event.shiftKey && (current === first || !controls.includes(current))) {
          event.preventDefault(); focus(last);
        } else if (!event.shiftKey && (current === last || !controls.includes(current))) {
          event.preventDefault(); focus(first);
        }
      }
    });
    addEventListener('hashchange', readLocation);
    addEventListener('popstate', readLocation);
    motion.addEventListener('change', () => {
      if (motion.matches && timers.size) change(desired, true);
    });
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    hideArticles();
    main.style.display = 'none';
    const initial = targetFromHash();
    if (initial) change(initial, true);
    else if (initial === null) removeEmptyFragment();
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
