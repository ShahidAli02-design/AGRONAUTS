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
  setHeadMeta: (meta: {
    title?: string;
    description?: string;
  }) => void;
}

const RouterContext = React.createContext<RouterContextType | null>(null);

const BASE_PATH = (import.meta.env.BASE_URL || "/")
  .replace(/\/+$/, "");

function stripBase(path: string) {
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    return path.slice(BASE_PATH.length) || "/";
  }
  return path || "/";
}

function addBase(path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;

  if (!BASE_PATH) return clean;
  if (clean === "/") return `${BASE_PATH}/`;

  return `${BASE_PATH}${clean}`;
}

export function useRouter() {
  const ctx = React.useContext(RouterContext);

  if (!ctx) {
    throw new Error("useRouter must be used within RouterProvider");
  }

  return ctx;
}

export function useNavigate() {
  return useRouter().navigate;
}

export function useParams() {
  return useRouter().params;
}

export function resolvePath(
  to = "/",
  params?: Record<string, any>
) {
  let path = to;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      const val = encodeURIComponent(String(value));
      path = path
        .replace(`$${key}`, val)
        .replace(`:${key}`, val);
    }
  }

  return path;
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
  const navigate = useNavigate();
  const routePath = resolvePath(to, params);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    onClick?.(e);

    if (
      e.defaultPrevented ||
      target === "_blank" ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey
    ) {
      return;
    }

    e.preventDefault();
    navigate({ to, params });
  };

  return (
    <a
      href={addBase(routePath)}
      onClick={handleClick}
      className={className}
      target={target}
      rel={rel}
      {...props}
    >
      {children}
    </a>
  );
}

export function Outlet({
  children,
}: {
  children?: React.ReactNode;
}) {
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
  return (options: any) => ({
    pathPattern,
    component: options.component,
    head: options.head,
    useParams: () => useParams(),
  });
}

export interface RouteDefinition {
  pattern: string;
  component: React.ComponentType<any>;
  head?: (ctx: any) => any;
}

export function matchRoute(
  pattern = "/",
  pathname = "/"
) {
  const p = pattern
    .replace(/^\/_authenticated/, "")
    .replace(/\/+$/, "") || "/";

  const path = pathname.replace(/\/+$/, "") || "/";

  if (p === path) {
    return {
      matches: true,
      params: {},
    };
  }

  const pp = p.split("/").filter(Boolean);
  const ap = path.split("/").filter(Boolean);

  if (pp.length !== ap.length) {
    return {
      matches: false,
      params: {},
    };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < pp.length; i++) {
    const part = pp[i];
    const actual = ap[i];

    if (
      part.startsWith("$") ||
      part.startsWith(":")
    ) {
      params[part.slice(1)] =
        decodeURIComponent(actual);
    } else if (part !== actual) {
      return {
        matches: false,
        params: {},
      };
    }
  }

  return {
    matches: true,
    params,
  };
}

export function RouterProvider({
  routes,
  children,
}: {
  routes: RouteDefinition[];
  children?: React.ReactNode;
}) {
  const getPath = React.useCallback(() => {
    if (typeof window === "undefined") return "/";
    return stripBase(window.location.pathname);
  }, []);

  const [state, setState] = React.useState<RouterState>(
    () => ({
      path: getPath(),
      params: {},
    })
  );

  const navigate = React.useCallback(
    (target: string | NavigateOptions) => {
      const to =
        typeof target === "string"
          ? target
          : target.to || "/";

      const params =
        typeof target === "string"
          ? undefined
          : target.params;

      const replace =
        typeof target === "string"
          ? false
          : Boolean(target.replace);

      const resolved = resolvePath(to, params);

      let matchedParams = params || {};

      for (const route of routes) {
        const result = matchRoute(
          route.pattern,
          resolved
        );

        if (result.matches) {
          matchedParams = {
            ...result.params,
            ...matchedParams,
          };
          break;
        }
      }

      if (typeof window !== "undefined") {
        const browserPath = addBase(resolved);

        if (replace) {
          window.history.replaceState(
            {},
            "",
            browserPath
          );
        } else {
          window.history.pushState(
            {},
            "",
            browserPath
          );
        }

        window.scrollTo(0, 0);
      }

      setState({
        path: resolved,
        params: matchedParams,
      });
    },
    [routes]
  );

  React.useEffect(() => {
    const onPopState = () => {
      const path = getPath();
      let params: Record<string, string> = {};

      for (const route of routes) {
        const result = matchRoute(
          route.pattern,
          path
        );

        if (result.matches) {
          params = result.params;
          break;
        }
      }

      setState({
        path,
        params,
      });
    };

    window.addEventListener(
      "popstate",
      onPopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        onPopState
      );
    };
  }, [routes, getPath]);

  const setHeadMeta = React.useCallback(
    (meta: {
      title?: string;
      description?: string;
    }) => {
      if (meta.title) {
        document.title = meta.title;
      }

      if (meta.description) {
        let tag = document.querySelector(
          'meta[name="description"]'
        );

        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute(
            "name",
            "description"
          );
          document.head.appendChild(tag);
        }

        tag.setAttribute(
          "content",
          meta.description
        );
      }
    },
    []
  );

  let matchedComponent:
    | React.ComponentType<any>
    | null = null;

  let activeRoute:
    | RouteDefinition
    | null = null;

  let matchedParams: Record<string, string> = {};

  for (const route of routes) {
    const result = matchRoute(
      route.pattern,
      state.path
    );

    if (result.matches) {
      matchedComponent = route.component;
      activeRoute = route;
      matchedParams = result.params;
      break;
    }
  }

  React.useEffect(() => {
    if (!activeRoute?.head) return;

    try {
      const info = activeRoute.head({
        params: matchedParams,
      });

      const meta = info?.meta;

      if (!meta) return;

      const title = meta.find(
        (m: any) => m.title
      );

      const description = meta.find(
        (m: any) =>
          m.name === "description"
      );

      if (title?.title) {
        document.title = title.title;
      }

      if (description?.content) {
        setHeadMeta({
          description: description.content,
        });
      }
    } catch {
      // Ignore head metadata errors
    }
  }, [
    activeRoute,
    matchedParams,
    setHeadMeta,
  ]);

  const contextValue = React.useMemo(
    () => ({
      path: state.path,
      params: matchedParams,
      navigate,
      setHeadMeta,
    }),
    [
      state.path,
      matchedParams,
      navigate,
      setHeadMeta,
    ]
  );

  return (
    <RouterContext.Provider value={contextValue}>
      {children ??
        (matchedComponent
          ? React.createElement(
              matchedComponent
            )
          : null)}
    </RouterContext.Provider>
  );
}
