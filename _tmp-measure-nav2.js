const { chromium } = require('playwright');
const BASE = 'C:/Users/Tanja/AppData/Local/Temp/claude/c--Users-Tanja-Desktop-pawfind/47842f4f-d55c-4962-85f6-6d73653eb4ba/scratchpad';

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });
  await page.goto('http://localhost:3000/pets-adopted.html');
  await page.evaluate(() => localStorage.setItem('pawfind_lang', 'sr'));
  await page.reload();
  await page.waitForTimeout(600);

  const metrics = await page.evaluate(() => {
    const headerInner = document.querySelector('.header-inner');
    const mainNav = document.querySelector('.main-nav');
    const logo = document.querySelector('.logo');
    const langSwitch = document.querySelector('.lang-switch');
    const cs = getComputedStyle(headerInner);
    return {
      viewportWidth: window.innerWidth,
      headerInnerClientWidth: headerInner.clientWidth,
      headerInnerOffsetWidth: headerInner.offsetWidth,
      headerInnerPadding: cs.padding,
      mainNavClientWidth: mainNav.clientWidth,
      mainNavOffsetWidth: mainNav.offsetWidth,
      mainNavFlexWrap: getComputedStyle(mainNav).flexWrap,
      logoWidth: logo.offsetWidth,
      langSwitchWidth: langSwitch ? langSwitch.offsetWidth : 0,
      navLinks: Array.from(mainNav.children).map(el => ({ text: el.textContent.trim(), offsetWidth: el.offsetWidth, tag: el.tagName }))
    };
  });
  console.log(JSON.stringify(metrics, null, 2));
  await page.screenshot({ path: `${BASE}/nav-debug.png` });

  await browser.close();
})().catch(err => { console.error('FAILED', err); process.exit(1); });
