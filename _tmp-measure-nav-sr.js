const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 900 } });
  await page.goto('http://localhost:3000/index.html');
  await page.evaluate(() => localStorage.setItem('pawfind_lang', 'sr'));
  await page.reload();
  await page.waitForTimeout(500);

  const metrics = await page.evaluate(() => {
    const headerInner = document.querySelector('.header-inner');
    const mainNav = document.querySelector('.main-nav');
    const logo = document.querySelector('.logo');
    const langSwitch = document.querySelector('.lang-switch');
    return {
      headerInnerClientWidth: headerInner.clientWidth,
      mainNavClientWidth: mainNav.clientWidth,
      mainNavScrollWidth: mainNav.scrollWidth,
      logoWidth: logo.offsetWidth,
      langSwitchWidth: langSwitch ? langSwitch.offsetWidth : 0,
      navLinks: Array.from(mainNav.children).map(el => ({ text: el.textContent.trim(), width: el.offsetWidth, scrollWidth: el.scrollWidth }))
    };
  });
  console.log(JSON.stringify(metrics, null, 2));

  await browser.close();
})().catch(err => { console.error('FAILED', err); process.exit(1); });
