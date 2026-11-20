import { test, expect } from "@playwright/test";

test.describe("HanLearn Full-Platform E2E Smoke Suite", () => {
  test("home page renders HanLearn branding and auth entry points", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("HanLearn")).toBeVisible();
    await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
  });

  test("unauthenticated access to protected routes redirects to /login", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page).toHaveURL(/\/login/);
  });

  test("learner can sign in and access all primary horizontal navigation routes without 404", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill("#email", "learner@hanlearn.local");
    await page.fill("#password", "Learner@123456");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    const routes = [
      "/dashboard",
      "/roadmap",
      "/placement-test",
      "/courses",
      "/lessons",
      "/lessons/hsk1-greetings-intro",
      "/flashcards",
      "/flashcards/review",
      "/practice",
      "/practice/vocabulary",
      "/practice/grammar",
      "/practice/listening",
      "/practice/speaking",
      "/practice/reading",
      "/practice/writing",
      "/practice/pronunciation",
      "/exams",
      "/ai-tutor",
      "/ai-tutor/conversation",
      "/analytics",
      "/offline-library",
      "/settings",
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `Expected 200 on ${route}`).toBe(200);
      await expect(page.getByText("This page could not be found")).toHaveCount(0);
    }
  });

  test("health endpoint responds with live database connectivity", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.service).toBe("hanlearn");
    expect(body.database).toBe("connected");
  });
});
