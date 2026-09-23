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

const BASE_PATH =
  typeof import.meta !== "undefined" && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL.replace(/\/+$/, "")
    : "";

function stripBasePath(pathname: string): string {
  const path = pathname || "/";

  if (BASE_PATH && path === BASE_PATH) {
    return "/";
  }

  if (BASE_PATH && path.startsWith(`${BASE_PATH}/`)) {
    return path.slice(BASE_PATH.length) || "/";
  }

  return path;
}

function addBasePath(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (!BASE_PATH) {
    return cleanPath;
  }

  if (cleanPath === "/") {
    return `${BASE_PATH}/`;
  }

  return `${BASE_PATH}${cleanPath}`;
}

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

export function resolvePath(
  to?: string,
  params?: Record<string, any>
): string {
  let resolved = typeof to === "string" ? to : "/";

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      const val =
        value !== undefined && value !== null
          ? encodeURIComponent(String(value))
          : "";

      resolved = resolved
        .replace(`$${key}`, val)
        .replace(`:${key}`, val);
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
  const routePath = resolvePath(safeTo, params);
  const href = addBasePath(routePath);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

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
    navigate({ to: safeTo, params });
  };

  return (
    <a
      href={href}
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
  return (
    options: {
      head?: (ctx: any) => any;
      component: React.ComponentType<any>;
      [key: string]: any;
    }
  ) => {
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
): {
  matches: boolean;
  params: Record<string, string>;
} {
  const safePattern =
    typeof pattern === "string" ? pattern : "/";

  const safePath =
    typeof pathname === "string" ? pathname : "/";

  const normPattern =
    safePattern
      .replace(/^\/_authenticated/, "")
      .replace(/\/+$/, "") || "/";

  const normPath =
    safePath.replace(/\/+$/, "") || "/";

  if (normPattern === normPath) {
    return {
      matches: true,
      params: {},
    };
  }

  const patternParts = normPattern
    .split("/")
    .filter(Boolean);

  const pathParts = normPath
    .split("/")
    .filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return {
      matches: false,
      params: {},
    };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
