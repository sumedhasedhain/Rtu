import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { RegisterPage } from "./RegisterPage";
import { AuthProvider } from "../auth/AuthContext";
import * as authApi from "../api/auth";
import { tokenStorage } from "../api/client";

vi.mock("../api/auth");

const mockedAuthApi = vi.mocked(authApi);

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    tokenStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the registration form", () => {
    renderRegisterPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("registers and then logs the user in", async () => {
    const user = userEvent.setup();
    mockedAuthApi.register.mockResolvedValue({
      id: "1",
      email: "new@example.com",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    });
    mockedAuthApi.login.mockResolvedValue({
      id: "1",
      email: "new@example.com",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    });

    renderRegisterPage();

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.type(screen.getByLabelText(/password/i), "supersecret1");
    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockedAuthApi.register).toHaveBeenCalledWith("new@example.com", "supersecret1");
      expect(mockedAuthApi.login).toHaveBeenCalledWith("new@example.com", "supersecret1");
    });
  });

  it("shows an error message when registration fails", async () => {
    const user = userEvent.setup();
    mockedAuthApi.register.mockRejectedValue(new Error("Email already registered"));

    renderRegisterPage();

    await user.type(screen.getByLabelText(/email/i), "dupe@example.com");
    await user.type(screen.getByLabelText(/password/i), "supersecret1");
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/registration failed/i)).toBeInTheDocument();
  });
});
