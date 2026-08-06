import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
}));

vi.mock("@/lib/api/auth");

import { RouteGuard } from "./RouteGuard";
import { AuthProvider } from "./AuthProvider";
import { tokenStorage } from "@/lib/api/client";
import * as authApi from "@/lib/api/auth";

function renderGuarded() {
  return render(
    <AuthProvider>
      <RouteGuard>
        <div>Secret dashboard</div>
      </RouteGuard>
    </AuthProvider>,
  );
}

describe("RouteGuard", () => {
  beforeEach(() => {
    tokenStorage.clear();
    vi.clearAllMocks();
  });

  it("redirects to /login when there is no access token", async () => {
    renderGuarded();
    await vi.waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
  });

  it("renders the protected content when a valid session exists", async () => {
    tokenStorage.setTokens({ access_token: "token", refresh_token: "refresh", token_type: "bearer" });
    vi.mocked(authApi.getMe).mockResolvedValue({
      id: "1",
      email: "user@example.com",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    });

    renderGuarded();
    expect(await screen.findByText("Secret dashboard")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
