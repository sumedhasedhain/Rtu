import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthProvider } from "./AuthContext";
import { tokenStorage } from "../api/client";
import * as authApi from "../api/auth";

vi.mock("../api/auth");

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Secret dashboard</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    tokenStorage.clear();
    vi.clearAllMocks();
  });

  it("redirects to /login when there is no access token", async () => {
    renderWithRoute();
    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("renders the protected content when a valid session exists", async () => {
    tokenStorage.setTokens({ access_token: "token", refresh_token: "refresh", token_type: "bearer" });
    vi.mocked(authApi.getMe).mockResolvedValue({
      id: "1",
      email: "user@example.com",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    });

    renderWithRoute();
    expect(await screen.findByText("Secret dashboard")).toBeInTheDocument();
  });
});
