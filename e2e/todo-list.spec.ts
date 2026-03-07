import { expect, test } from "@playwright/test";

test.describe("Todo List", () => {
	test("Show empty state", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");
		await expect(page.getByText(/no todos yet/i)).toBeVisible();
	});

	test("Add a todo item", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");
		await page.getByLabel("New todo").pressSequentially("Buy groceries");
		await page.getByRole("button", { name: "Add" }).click();
		await expect(page.getByText("Buy groceries")).toBeVisible();
		await expect(page.getByLabel("New todo")).toHaveValue("");
	});

	test("Reject empty todo", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");
		await page.getByRole("button", { name: "Add" }).click();
		await expect(page.getByText(/no todos yet/i)).toBeVisible();
	});

	test("Show existing todos", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");

		await page.getByLabel("New todo").pressSequentially("Buy groceries");
		await page.getByRole("button", { name: "Add" }).click();
		await page.getByLabel("New todo").pressSequentially("Walk the dog");
		await page.getByRole("button", { name: "Add" }).click();

		await expect(page.getByText("Buy groceries")).toBeVisible();
		await expect(page.getByText("Walk the dog")).toBeVisible();
	});

	test("Complete a todo", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");

		await page.getByLabel("New todo").pressSequentially("Buy groceries");
		await page.getByRole("button", { name: "Add" }).click();
		await page.getByRole("checkbox").click();

		await expect(page.getByText("Buy groceries")).toHaveClass(/line-through/);
	});

	test("Uncomplete a todo", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");

		await page.getByLabel("New todo").pressSequentially("Buy groceries");
		await page.getByRole("button", { name: "Add" }).click();
		await page.getByRole("checkbox").click();
		await page.getByRole("checkbox").click();

		await expect(page.getByText("Buy groceries")).not.toHaveClass(
			/line-through/,
		);
	});

	test("Delete a todo", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");

		await page.getByLabel("New todo").pressSequentially("Buy groceries");
		await page.getByRole("button", { name: "Add" }).click();
		await page.getByRole("button", { name: /delete buy groceries/i }).click();

		await expect(page.getByText("Buy groceries")).not.toBeVisible();
		await expect(page.getByText(/no todos yet/i)).toBeVisible();
	});
});
