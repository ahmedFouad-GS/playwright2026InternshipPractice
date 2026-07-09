/**
 * Playwright JS Bootcamp - Session 1 Lab Solution
 * Exercise 1: Locator Hunt Scavenger Hunt on saucedemo.com
 * 
 * Objective: Locate username, password, login button, and standard product elements.
 */

const { test, expect } = require('@playwright/test');

test('Session 1 Scavenger Hunt Solutions', async ({ page }) => {
    // Navigate straight to the sandbox target site
    await page.goto('https://www.saucedemo.com/');

    // 1. Username Locator (Prioritizing role or placeholder over raw attributes)
    const usernameLocator = page.getByPlaceholder('Username');
    // Alternates:
    // const usernameAlt = page.locator('[data-test="username"]');
    // const usernameSelector = page.locator('#user-name');

    // 2. Password Locator
    const passwordLocator = page.getByPlaceholder('Password');
    // Alternate:
    // const passwordAlt = page.locator('[data-test="password"]');

    // 3. Login Button Locator (User-facing Role & Name matching)
    const loginButtonLocator = page.getByRole('button', { name: 'Login' });
    // Alternate:
    // const loginButtonAlt = page.locator('#login-button');

    // Let's verify our locators are operational by interacting
    await usernameLocator.fill('standard_user');
    await passwordLocator.fill('secret_sauce');
    await loginButtonLocator.click();

    // 4. Assert URL changed to verified catalog page
    await expect(page).toHaveURL(/inventory.html/);

    // 5. Locate dynamic Add-To-Cart buttons
    // The clean Playwright user-facing approach to locate the first catalog element item
    const firstProductAddToCart = page.getByRole('button', { name: 'Add to cart' }).first();
    // Alternates using explicit data-test ids
    // const firstProductAddToCartAlt = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');

    // Perform interaction
    await firstProductAddToCart.click();

    // 6. Locate Cart Badge to verify state change
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');
    
});