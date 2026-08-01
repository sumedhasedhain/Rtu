import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LoginPage } from "./LoginPage";
import { AuthProvider } from "../auth/AuthContext";
import * as authApi from "../api/auth";
import { tokenStorage } from "../api/client";

vi.mock("../api/auth");

const mockedAuthApi = vi.mocked(authApi);

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    tokenStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the login form", () => {
    renderLoginPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("submits credentials and logs the user in", async () => {
    const user = userEvent.setup();
    mockedAuthApi.login.mockResolvedValue({
      id: "1",
      email: "user@example.com",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    });

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "supersecret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockedAuthApi.login).toHaveBeenCalledWith("user@example.com", "supersecret1");
    });
  });

  it("shows an error message when login fails", async () => {
    const user = userEvent.setup();
    mockedAuthApi.login.mockRejectedValue(new Error("Invalid credentials"));

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });
});
