import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/common/Toaster";
import { AuthProvider } from "@/hooks/useAuth";
import { router } from "@/routes";

/** A single QueryClient for the whole app. */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
      // Always attempt requests and surface failures as errors. Without this,
      // React Query's default "online" mode pauses queries when the backend is
      // unreachable (treating it as offline), so error states never render.
      networkMode: "always",
    },
    mutations: {
      networkMode: "always",
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
