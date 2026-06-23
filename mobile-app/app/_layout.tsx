import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: 'Wellness Packages' }}
        />
        <Stack.Screen
          name="packages/[id]"
          options={{ title: 'Package Details' }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
