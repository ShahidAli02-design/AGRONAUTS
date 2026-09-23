import * as React from "react";

interface RouterState {
  path: string;
  params: Record<string, string>;
}

interface NavigateOptions {
  to: string;
  params?: Record<string, string>;
  replace?: boolean;
}

interface RouterContextType {
  path: string;
  params: Record<string, string>;
  navigate: (target: string | NavigateOptions) => void;
  setHeadMeta: (meta: { title?: string; description?: string }) => void;
}

const RouterContext = React.createContext<RouterContextType | null>(null);

export function useRouter() {
  const ctx = React.useContext(RouterContext);
  if (!ctx) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return ctx;
}

export function useNavigate() {
  const { navigate } = useRouter();
  return navigate;
}

export function useParams(): Record<string, string> {
  const { params } = useRouter();
  return params;
}

export function resolvePath(to?: string, params?: Record<string, any>): string {
  let resolved = typeof to === "string" ? to : "/";
  if (params && typeof resolved === "string") {
    for (const [k, v] of Object.entries(params)) {
      const val = v !== undefined && v !== null ? encodeURIComponent(String(v)) : "";
      resolved = resolved.replace(`$${k}`, val).replace(`:${k}`, val);
    }
  }
  return resolved;
}

export function Link({
  to = "/",
  params,
  className,
  children,
  onClick,
  target,
  rel,
  ...props
}: {
  to?: string;
  params?: Record<string, any>;
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  target?: string;
  rel?: string;
  [key: string]: any;
}) {
  const { navigate } = useRouter();
  const safeTo = to || "/";
  const href = resolvePath(safeTo, params);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented || target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) {
      return;
    }
    e.preventDefault();
    navigate({ to: safeTo, params });
  };

  return (
    <a href={href} onClick={handleClick} className={className} target={target} rel={rel} {...props}>
      {children}
    </a>
  );
}

export function Outlet({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function redirect(options: any) {
  return options;
}

export function HeadContent() {
  return null;
}

export function Scripts() {
  return null;
}

export function createRootRouteWithContext<T = any>() {
  return (options: any) => createFileRoute("/")(options);
}

export function createFileRoute(pathPattern: string) {
  return (options: { head?: (ctx: any) => any; component: React.ComponentType<any>; [key: string]: any }) => {
    return {
      pathPattern,
      component: options.component,
      head: options.head,
      useParams: () => {
        const { params } = useRouter();
        return params;
      },
    };
  };
}

export interface RouteDefinition {
  pattern: string;
  component: React.ComponentType<any>;
  head?: (ctx: any) => any;
}

export function matchRoute(
  pattern?: string,
  pathname?: string
): { matches: boolean; params: Record<string, string> } {
  const safePattern = typeof pattern === "string" ? pattern : "/";
  const safePath = typeof pathname === "string" ? pathname : "/";
  const normPattern = safePattern.replace(/^\/_authenticated/, "").replace(/\/+$/, "") || "/";
  const normPath = safePath.replace(/\/+$/, "") || "/";

  if (normPattern === normPath) {
    return { matches: true, params: {} };
  }

  const patternParts = normPattern.split("/").filter(Boolean);
  const pathParts = normPath.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return { matches: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    const actual = pathParts[i];

    if (p.startsWith("$") || p.startsWith(":")) {
      const key = p.slice(1);
      params[key] = decodeURIComponent(actual);
    } else if (p !== actual) {
      return { matches: false, params: {} };
    }
  }

  return { matches: true, params };
}

export function RouterProvider({
  routes,
  children,
}: {
  routes: RouteDefinition[];
  children?: React.ReactNode;
}) {
  const [state, setState] = React.useState<RouterState>(() => {
    const initialPath = typeof window !== "undefined" ? window.location.pathname || "/" : "/";
    return { path: initialPath, params: {} };
  });

  const navigate = React.useCallback((target: string | NavigateOptions) => {
    const to = typeof target === "string" ? target : target?.to || "/";
    const params = typeof target === "string" ? undefined : target?.params;
    const replace = typeof target === "string" ? false : Boolean(target?.replace);

    const resolved = resolvePath(to, params);

    // Compute matching params immediately
    let matchedParams: Record<string, string> = params || {};
    for (const r of routes) {
      const match = matchRoute(r.pattern, resolved);
      if (match.matches) {
        matchedParams = { ...match.params, ...matchedParams };
        break;
      }
    }

    if (typeof window !== "undefined") {
      if (replace) {
        window.history.replaceState({}, "", resolved);
      } else {
        window.history.pushState({}, "", resolved);
      }
    }

    setState({ path: resolved, params: matchedParams });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [routes]);

  React.useEffect(() => {
    const handlePopState = () => {
      const curr = window.location.pathname || "/";
      let matchedParams: Record<string, string> = {};
      for (const r of routes) {
        const match = matchRoute(r.pattern, curr);
        if (match.matches) {
          matchedParams = match.params;
          break;
        }
      }
      setState({ path: curr, params: matchedParams });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [routes]);

  const setHeadMeta = React.useCallback((meta: { title?: string; description?: string }) => {
    if (typeof document !== "undefined") {
      if (meta.title) document.title = meta.title;
      if (meta.description) {
        let tag = document.querySelector('meta[name="description"]');
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("name", "description");
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", meta.description);
      }
    }
  }, []);

  // Match current route
  let matchedComponent: React.ComponentType<any> | null = null;
  let activeRoute: RouteDefinition | null = null;
  let matchedParams: Record<string, string> = {};

  for (const r of routes) {
    const m = matchRoute(r.pattern, state.path);
    if (m.matches) {
      matchedComponent = r.component;
      activeRoute = r;
      matchedParams = m.params;
      break;
    }
  }

  // Update head metadata when active route changes
  React.useEffect(() => {
    if (activeRoute?.head) {
      try {
        const headInfo = activeRoute.head({ params: matchedParams });
        if (headInfo?.meta) {
          const titleObj = headInfo.meta.find((m: any) => m.title);
          const descObj = headInfo.meta.find((m: any) => m.name === "description");
          if (titleObj?.title) document.title = titleObj.title;
          if (descObj?.content) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute("content", descObj.content);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [activeRoute, matchedParams]);

  const contextValue = React.useMemo(
    () => ({
      path: state.path,
      params: matchedParams,
      navigate,
      setHeadMeta,
    }),
    [state.path, matchedParams, navigate, setHeadMeta]
  );

  return (
    <RouterContext.Provider value={contextValue}>
      {children ? children : matchedComponent ? React.createElement(matchedComponent) : null}
    </RouterContext.Provider>
  );
}
