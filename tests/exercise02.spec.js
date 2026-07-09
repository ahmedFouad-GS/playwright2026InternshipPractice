/**
 * Playwright JS Bootcamp - Session 2 Lab Solution
 * Exercise 2: Page Object Model (POM) Design Pattern implementation
 * 
 * Target Sandbox: saucedemo.com
 * Page classes are embedded in-file here to demonstrate execution, but should live in separate files in standard projects.
 */

const { test, expect } = require('@playwright/test');

// ==========================================
// 1. PAGE OBJECT CLASSES
// ==========================================

class LoginPage {
    /**
     * @param {import('@playwright/test').Page} page 
     */
    constructor(page) {
        this.page = page;
        this.usernameInput = page.getByPlaceholder('Username');
        this.passwordInput = page.getByPlaceholder('Password');
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.errorMessage = page.locator('[data-test="error"]');
    }

    async navigate() {
        await this.page.goto('https://www.saucedemo.com/');
    }

    async login(username, password) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}

class InventoryPage {
    /**
     * @param {import('@playwright/test').Page} page 
     */
    constructor(page) {
        this.page = page;
        this.cartBadge = page.locator('.shopping_cart_badge');
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.firstNameInput = page.getByPlaceholder('First Name');
        this.lastNameInput = page.getByPlaceholder('Last Name');
        this.zipCodeInput = page.getByPlaceholder('Zip/Postal Code');
        this.continueButton = page.locator('[data-test="continue"]');
        this.finishButton = page.locator('[data-test="finish"]');
        this.completeHeader = page.locator('.complete-header');
    }

    async addProductToCart(productName) {
        // Find the button directly nested in the product container
        await this.page.locator('.inventory_item')
            .filter({ hasText: productName })
            .getByRole('button', { name: 'Add to cart' })
            .click();
    }

    async clickShoppingCart() {
        await this.page.locator('.shopping_cart_link').click();
    }

    async checkout(firstName, lastName, zipCode) {
        await this.checkoutButton.click();
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.zipCodeInput.fill(zipCode);
        await this.continueButton.click();
        await this.finishButton.click();
    }
}
// ==========================================
// 2. AUTOMATION SPEC SUITE
// ==========================================

test.describe('E2E Purchase Workflow using Page Object Model', () => {
    let loginPage;
    let inventoryPage;

    test.beforeEach(async ({ page }) => {
        // Initialize dynamic Page instances inside Hooks
        loginPage = new LoginPage(page);
        inventoryPage = new InventoryPage(page);
        
        await loginPage.navigate();
    });

    test('Should successfully perform login and purchase item', async () => {
        await test.step('Perform Secure Account Logging', async () => {
            await loginPage.login('standard_user', 'secret_sauce');
            await expect(loginPage.page).toHaveURL(/inventory.html/);
        });

        await test.step('Select catalog product and append to cart', async () => {
            await inventoryPage.addProductToCart('Sauce Labs Backpack');
            await expect(inventoryPage.cartBadge).toHaveText('1');
        });

        await test.step('Complete Purchase Checkout Workflow', async () => {
            await inventoryPage.clickShoppingCart();
            await inventoryPage.checkout('Ahmed', 'Fouad', '12345');
            
            // Assert and verify order completion states cleanly
            await expect(inventoryPage.completeHeader).toHaveText('Thank you for your order!');
        });
    });

    test('Should display clean validation message upon invalid credentials', async () => {
        await test.step('Attempt faulty authentication', async () => {
            await loginPage.login('locked_out_user', 'secret_sauce');
            await expect(loginPage.errorMessage).toBeVisible();
            await expect(loginPage.errorMessage).toContainText('Epic sadface: Sorry, this user has been locked out.');
        });
    });
});