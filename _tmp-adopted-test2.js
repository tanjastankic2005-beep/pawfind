const { chromium } = require('playwright');
const BASE = 'C:/Users/Tanja/AppData/Local/Temp/claude/c--Users-Tanja-Desktop-pawfind/47842f4f-d55c-4962-85f6-6d73653eb4ba/scratchpad';

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });

  await page.goto('http://localhost:3000/pets-adopted.html');
  await page.evaluate(() => localStorage.setItem('pawfind_lang', 'sr'));
  await page.reload();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${BASE}/adopted-page-sr.png`, fullPage: true });

  // Submit a real application for Rex (id=4), then approve it as admin, and verify auto-adopt captured the name
  await page.evaluate(() => localStorage.setItem('pawfind_lang', 'en'));
  await page.goto('http://localhost:3000/apply.html?id=4');
  await page.fill('#applicant_name', 'Jovana Applicant');
  await page.fill('#applicant_email', 'jovana-applicant@example.com');
  await page.fill('#reason', 'I have always wanted a small energetic dog like Rex.');
  await page.click('#submitButton');
  await page.waitForTimeout(800);

  await page.goto('http://localhost:3000/login.html');
  await page.fill('#loginEmail', 'adopt-admin@example.com');
  await page.fill('#loginPassword', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(800);

  await page.goto('http://localhost:3000/admin.html');
  await page.waitForSelector('#adminPanel:not(.hidden)');
  await page.click('button[data-tab="applications"]');
  await page.waitForTimeout(300);

  const appCard = page.locator('.application-card', { hasText: 'Jovana Applicant' }).first();
  await appCard.locator('select.status-select').selectOption('Approved');
  await page.waitForTimeout(800);

  await page.goto('http://localhost:3000/pets-adopted.html');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${BASE}/adopted-page-after-approve.png`, fullPage: true });

  console.log('DONE');
  await browser.close();
})().catch(err => { console.error('FAILED', err); process.exit(1); });
