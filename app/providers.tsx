"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";

const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
  pageProps?: { session: any };
}

export default function Providers({ children, pageProps }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={pageProps?.session}>
        {children}
      </SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
