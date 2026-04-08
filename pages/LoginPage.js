class LoginPage {
  constructor(page) {
    this.page = page;
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('[type="submit"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(password) {
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

module.exports = { LoginPage };
