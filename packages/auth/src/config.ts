interface AuthConfigOptions {
  enabled: boolean;
  secret?: string;
}

export function createAuthConfig(options: AuthConfigOptions) {
  return {
    ...options,
    providers: ["credentials"] as const,
  };
}

export const auth = {
  providers: {
    credentials: {
      id: "credentials",
      name: "Credentials",
    },
  },
} as const;
