const { test, expect } = require('@playwright/test');

test('Page d\'accueil se charge', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('text=MEDPILOT')).toBeVisible();
    await expect(page.locator('text=Votre santé')).toBeVisible();
});

test('Dashboard patient se charge', async ({ page }) => {
    await page.goto('http://localhost:3000/patient');
    await expect(page.locator('text=Assistant Médical')).toBeVisible();
});

test('Dashboard docteur se charge', async ({ page }) => {
    await page.goto('http://localhost:3000/doctor');
    await expect(page.locator('text=Tableau de bord')).toBeVisible();
});