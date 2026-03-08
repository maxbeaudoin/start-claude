import { expect, test } from "@playwright/test";

test.describe("Todo List", () => {
	test("Add a todo item", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");

		await page.getByLabel("New todo").pressSequentially("Buy groceries");
		await page.getByRole("button", { name: "Add" }).click();

		await expect(page.getByText("Buy groceries")).toBeVisible();
		await expect(page.getByLabel("New todo")).toHaveValue("");
	});

	test("Prevent adding empty todo", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");

		await page.getByRole("button", { name: "Add" }).click();

		await expect(page.getByRole("listitem")).toHaveCount(0);
	});

	test("Display existing todos", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");

		await page.getByLabel("New todo").pressSequentially("Buy groceries");
		await page.getByRole("button", { name: "Add" }).click();

		await page.getByLabel("New todo").pressSequentially("Walk the dog");
		await page.getByRole("button", { name: "Add" }).click();

		await expect(page.getByText("Buy groceries")).toBeVisible();
		await expect(page.getByText("Walk the dog")).toBeVisible();
	});

	test("Empty state", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");

		await expect(page.getByText("No todos yet. Add one above!")).toBeVisible();
	});

	test("Mark a todo as complete", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");

		await page.getByLabel("New todo").pressSequentially("Buy groceries");
		await page.getByRole("button", { name: "Add" }).click();

		await page.getByLabel("Toggle Buy groceries").click();

		await expect(page.getByText("Buy groceries")).toHaveClass(/line-through/);
	});

	test("Mark a completed todo as incomplete", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");

		await page.getByLabel("New todo").pressSequentially("Buy groceries");
		await page.getByRole("button", { name: "Add" }).click();

		await page.getByLabel("Toggle Buy groceries").click();
		await page.getByLabel("Toggle Buy groceries").click();

		await expect(page.getByText("Buy groceries")).not.toHaveClass(
			/line-through/,
		);
	});

	test("Delete a todo item", async ({ page }) => {
		await page.goto("/todos");
		await page.waitForLoadState("networkidle");

		await page.getByLabel("New todo").pressSequentially("Buy groceries");
		await page.getByRole("button", { name: "Add" }).click();

		await page.getByLabel("Delete Buy groceries").click();

		await expect(page.getByText("Buy groceries")).not.toBeVisible();
	});
});
