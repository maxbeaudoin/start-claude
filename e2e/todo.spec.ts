import fs from "node:fs";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const todosFile = path.resolve("todos.json");

test.beforeEach(() => {
	fs.writeFileSync(todosFile, JSON.stringify([]));
});

test.afterAll(() => {
	if (fs.existsSync(todosFile)) fs.unlinkSync(todosFile);
});

async function gotoHome(page: Page) {
	await page.goto("/");
	// Wait for React to hydrate — the input must be interactive before we type
	await page.waitForLoadState("networkidle");
}

test("displays empty state when no todos exist", async ({ page }) => {
	await gotoHome(page);
	await expect(page.getByText("No todos yet")).toBeVisible();
	await expect(page.getByPlaceholder("What needs to be done?")).toBeVisible();
});

test("Add button is disabled when input is empty", async ({ page }) => {
	await gotoHome(page);
	await expect(page.getByRole("button", { name: "Add" })).toBeDisabled();
});

test("adds a todo by clicking Add and clears the input", async ({ page }) => {
	await gotoHome(page);
	await page
		.getByPlaceholder("What needs to be done?")
		.pressSequentially("Buy groceries");
	await page.getByRole("button", { name: "Add" }).click();
	await expect(page.getByText("Buy groceries")).toBeVisible();
	await expect(page.getByPlaceholder("What needs to be done?")).toHaveValue("");
});

test("adds a todo by pressing Enter", async ({ page }) => {
	await gotoHome(page);
	const input = page.getByPlaceholder("What needs to be done?");
	await input.pressSequentially("Walk the dog");
	await input.press("Enter");
	await expect(page.getByText("Walk the dog")).toBeVisible();
});

test("marks a todo as completed with strikethrough", async ({ page }) => {
	await gotoHome(page);
	await page
		.getByPlaceholder("What needs to be done?")
		.pressSequentially("Buy groceries");
	await page.getByRole("button", { name: "Add" }).click();
	await page.getByRole("checkbox").click();
	await expect(page.getByText("Buy groceries")).toHaveClass(/line-through/);
});

test("unchecks a completed todo removes strikethrough", async ({ page }) => {
	await gotoHome(page);
	await page
		.getByPlaceholder("What needs to be done?")
		.pressSequentially("Buy groceries");
	await page.getByRole("button", { name: "Add" }).click();
	await page.getByRole("checkbox").click();
	await page.getByRole("checkbox").click();
	await expect(page.getByText("Buy groceries")).not.toHaveClass(/line-through/);
});

test("deletes a todo", async ({ page }) => {
	await gotoHome(page);
	await page
		.getByPlaceholder("What needs to be done?")
		.pressSequentially("Buy groceries");
	await page.getByRole("button", { name: "Add" }).click();
	await page.getByRole("button", { name: "Delete Buy groceries" }).click();
	await expect(page.getByText("Buy groceries")).not.toBeVisible();
	await expect(page.getByText("No todos yet")).toBeVisible();
});

test("persists todos across page reloads", async ({ page }) => {
	await gotoHome(page);
	await page
		.getByPlaceholder("What needs to be done?")
		.pressSequentially("Buy groceries");
	await page.getByRole("button", { name: "Add" }).click();
	await expect(page.getByText("Buy groceries")).toBeVisible();
	await page.reload();
	await page.waitForLoadState("networkidle");
	await expect(page.getByText("Buy groceries")).toBeVisible();
});
