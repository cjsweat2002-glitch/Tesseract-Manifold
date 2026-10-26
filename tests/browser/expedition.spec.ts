import { expect, test, type Page } from '@playwright/test';

const key = 'tesseract.expedition.v1';
async function setup(page: Page) {
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') });
  await page.addInitScript(() => {
    // Exercise the complete browser integration at a deterministic low frame rate.
    window.requestAnimationFrame = (callback) =>
      window.setTimeout(() => callback(performance.now()), 100);
    window.cancelAnimationFrame = (id) => window.clearTimeout(id);
    // Test the documented keyboard/drag fallback without browser-specific pointer-lock restrictions.
    HTMLCanvasElement.prototype.requestPointerLock = () =>
      Promise.reject(new Error('Test fallback'));
    if (!localStorage.getItem('tesseract.expedition.v1'))
      localStorage.setItem(
        'tesseract.expedition.v1',
        JSON.stringify({
          version: 1,
          collected: [],
          phase: 'matter',
          complete: false,
          elapsed: 0,
          folds: 0,
          recoveries: 0,
          settings: {
            quality: 'low',
            muted: true,
            reducedMotion: true,
            sensitivity: 1,
          },
        }),
      );
  });
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Continue expedition' }),
  ).toBeEnabled();
  await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'));
  await page
    .getByRole('button', { name: 'Continue expedition' })
    .click({ force: true });
}
async function hold(page: Page, code: string, milliseconds: number) {
  await page.keyboard.down(code);
  await page.clock.runFor(milliseconds);
  await page.keyboard.up(code);
}
async function press(page: Page, code: string) {
  await page.keyboard.press(code);
  await page.clock.runFor(650);
}
async function progress(page: Page) {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
}

test('keyboard expedition traverses all three memories and returns through the gate', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await setup(page);
  await press(page, 'q');
  await expect(page.locator('.phase-display strong')).toContainText('Echo');
  // World-aligned strafing keeps mouse capture out of this deterministic route test.
  await hold(page, 'w', 4400); // (0, -4)
  await hold(page, 'a', 4800); // west memory
  await press(page, 'e');
  await expect(page.locator('.memory-progress small')).toHaveText(
    '1 / 3 RECOVERED',
  );
  await hold(page, 'd', 3400); // (-7, -4)
  await press(page, 'q');
  await hold(page, 'w', 800); // (-7, -8)
  await hold(page, 'd', 6000); // (23, -8)
  await hold(page, 'w', 1000); // east memory
  await press(page, 'e');
  await expect(page.locator('.memory-progress small')).toHaveText(
    '2 / 3 RECOVERED',
  );
  await hold(page, 's', 1000);
  await hold(page, 'a', 4600); // (0, -8)
  await press(page, 'q');
  await hold(page, 'w', 2200); // Stillpoint
  await press(page, 'q');
  await hold(page, 'w', 2200); // north landing
  await press(page, 'q');
  await hold(page, 'w', 1400); // third memory
  await press(page, 'e');
  await expect(page.locator('.memory-progress small')).toHaveText(
    '3 / 3 RECOVERED',
  );
  await hold(page, 's', 1400);
  await press(page, 'q');
  await hold(page, 's', 2200);
  await press(page, 'q');
  await hold(page, 's', 8100);
  await expect(
    page.getByRole('heading', {
      name: 'Nothing remembered is ever truly lost.',
    }),
  ).toBeVisible();
  const result = await progress(page);
  expect(result.complete).toBe(true);
  expect(result.recoveries).toBe(0);
  expect(result.collected).toHaveLength(3);
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/expedition-complete.png' });
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'View expedition record' }),
  ).toBeVisible();
});

test('pause clears held input, settings persist, and restart requires confirmation', async ({
  page,
}) => {
  await setup(page);
  await page.keyboard.down('w');
  await page.clock.runFor(300);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('dialog')).toBeVisible();
  const before = await progress(page);
  await page.clock.runFor(3000);
  expect((await progress(page)).elapsed).toBe(before.elapsed);
  await page
    .getByRole('button', { name: 'Settings', exact: true })
    .click({ force: true });
  await page.getByLabel('Look sensitivity').fill('1.5');
  await page
    .getByRole('button', { name: 'New expedition', exact: true })
    .click({ force: true });
  await expect(
    page.getByText('Begin again? This replaces your saved expedition.'),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Keep my expedition' })
    .click({ force: true });
  await page
    .getByRole('button', { name: 'Resume expedition', exact: true })
    .last()
    .click({ force: true });
  await page.clock.runFor(6000);
  await page.keyboard.up('w');
  expect((await progress(page)).recoveries).toBe(0);
  expect((await progress(page)).settings.sensitivity).toBe(1.5);
  await press(page, 'Tab');
  await expect(page.getByRole('img', { name: /Basin map/ })).toBeVisible();
  await page.reload();
  await page
    .getByRole('button', { name: 'Field guide & settings' })
    .click({ force: true });
  await page
    .getByRole('button', { name: 'Settings', exact: true })
    .click({ force: true });
  await expect(page.getByLabel('Look sensitivity')).toHaveValue('1.5');
});

test('corrupted and unavailable storage produce usable recovery notices', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('tesseract.expedition.v1', '{invalid');
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('save could not be read');
  await expect(
    page.getByRole('button', { name: 'Enter the manifold' }),
  ).toBeEnabled();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Quota exceeded');
    };
  });
  await page
    .getByRole('button', { name: 'Enter the manifold' })
    .click({ force: true });
  await page.keyboard.press('q');
  await expect(page.getByRole('alert')).toContainText(
    'Progress cannot be saved',
  );
});

test('unlocked tether crosses the void and drag-look changes the heading', async ({
  page,
}) => {
  await setup(page);
  await press(page, 'q');
  await hold(page, 'w', 4400);
  await hold(page, 'a', 4800);
  await press(page, 'e');
  await hold(page, 'ArrowRight', 1000);
  await press(page, 'f');
  await expect(page.getByRole('status')).toContainText('Void tether connected');
  await page.clock.runFor(500);
  await press(page, 'Tab');
  await expect(page.locator('.basin-map circle')).toHaveAttribute('cx', '-7');
  await expect(page.locator('.basin-map circle')).toHaveAttribute('cy', '-4');
  await page
    .getByRole('button', { name: 'Resume expedition', exact: true })
    .last()
    .click({ force: true });
  await page.mouse.move(300, 300);
  await page.mouse.down();
  await page.mouse.move(700, 300);
  await page.mouse.up();
  await page.clock.runFor(300);
  await expect(page.locator('.compass b')).toHaveText('S');
  expect((await progress(page)).recoveries).toBe(0);
});
