const { test, expect } = require('@playwright/test');

test('Les pages principales répondent', async ({ page }) => {
    // Test page d'accueil
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toBeVisible();

    // Test page patient (peut rediriger vers login)
    await page.goto('http://localhost:3000/patient');
    await expect(page.locator('body')).toBeVisible();

    // Test page docteur (peut rediriger vers login)
    await page.goto('http://localhost:3000/doctor');
    await expect(page.locator('body')).toBeVisible();

    // Test page rendez-vous
    await page.goto('http://localhost:3000/rdv');
    await expect(page.locator('body')).toBeVisible();
});