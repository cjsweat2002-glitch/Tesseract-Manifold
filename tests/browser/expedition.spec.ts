import { expect, test, type Page } from '@playwright/test';
import { createExpedition, DEFAULT_SETTINGS } from '../../src/expedition/model';
import { save } from '../../src/expedition/save';
const key = 'tesseract.expedition.v1';
function fixture(night = false) {
  const s = createExpedition();
  if (night) s.life.clock = 195;
  let value = '';
  save(
    {
      getItem: () => null,
      setItem: (_, v) => {
        value = v;
      },
    },
    s,
    { ...DEFAULT_SETTINGS, quality: 'low', muted: true, reducedMotion: true },
  );
  return value;
}
async function setup(page: Page, value = fixture()) {
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') });
  await page.addInitScript(
    ({ key, value }) => {
      window.requestAnimationFrame = (callback) =>
        window.setTimeout(() => callback(performance.now()), 100);
      window.cancelAnimationFrame = (id) => window.clearTimeout(id);
      HTMLCanvasElement.prototype.requestPointerLock = () =>
        Promise.reject(new Error('Test fallback'));
      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    },
    { key, value },
  );
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Continue living' }),
  ).toBeEnabled();
  await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'));
  await page
    .getByRole('button', { name: 'Continue living' })
    .click({ force: true });
}
async function hold(page: Page, code: string, ms: number) {
  await page.keyboard.down(code);
  await page.clock.runFor(ms);
  await page.keyboard.up(code);
}
async function press(page: Page, code: string) {
  await page.keyboard.press(code);
  await page.clock.runFor(300);
}
async function progress(page: Page) {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
}
async function leave(page: Page) {
  await page
    .getByRole('button', { name: 'See you around' })
    .click({ force: true });
}
async function mira(page: Page) {
  await hold(page, 'a', 1200);
  await hold(page, 'w', 1000);
  await press(page, 'e');
  await expect(
    page.getByRole('heading', { name: 'Mira', exact: true }),
  ).toBeVisible();
}

test('live sandbox: resident story, gardening, independent relic exploration, meals and another morning', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await setup(page);
  await mira(page);
  await page.getByRole('button', { name: 'I’ll help' }).click({ force: true });
  await page
    .getByRole('button', { name: 'Spend a moment together' })
    .click({ force: true });
  await leave(page);
  await hold(page, 's', 400);
  await hold(page, 'a', 600);
  await press(page, 'e');
  await expect(page.getByRole('status')).toContainText('Gathered 3 herbs');
  await hold(page, 'd', 600);
  await hold(page, 'w', 400);
  await press(page, 'e');
  await page
    .getByRole('button', { name: 'Share what I found' })
    .click({ force: true });
  await expect(page.getByRole('dialog')).toContainText('eastern Matter ruin');
  await leave(page);
  await hold(page, 'd', 1800);
  await hold(page, 'w', 1800);
  await hold(page, 'd', 4000);
  await hold(page, 'w', 3400);
  await press(page, 'e');
  await expect(page.getByRole('status')).toContainText('Seed memory found');
  expect((await progress(page)).collected).toEqual(['becoming']);
  await press(page, 'r');
  await mira(page);
  await page
    .getByRole('button', { name: 'Share what I found' })
    .click({ force: true });
  await expect(page.getByRole('dialog')).toContainText('garden flourishes');
  await page.screenshot({ path: 'test-results/mira-story.png' });
  await leave(page);
  // A completed story leaves the same world playable. Cook, then sleep at home.
  await hold(page, 'd', 1800);
  await hold(page, 'w', 1000);
  await hold(page, 'a', 600);
  await press(page, 'e');
  await expect(page.getByRole('status')).toContainText('warm meal');
  await press(page, 'r');
  await hold(page, 'a', 800);
  await hold(page, 's', 400);
  await press(page, 'e');
  await expect(page.locator('.objective-block')).toContainText('Day 2');
  const data = await progress(page);
  expect(data.life.quests.mira).toBe(3);
  expect(data.life.meals).toBe(1);
  expect(data.life.bonds.mira).toBe(45);
  expect(errors).toEqual([]);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Continue living' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Neighbourhood & settings' })
    .click({ force: true });
  await expect(page.getByRole('dialog')).toContainText(
    'Story complete · life continues',
  );
});

test('pause clears held input, settings persist, and replacing the neighbourhood asks first', async ({
  page,
}) => {
  await setup(page);
  await page.keyboard.down('w');
  await page.clock.runFor(300);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('dialog')).toBeVisible();
  const before = await progress(page);
  await page.clock.runFor(3000);
  expect((await progress(page)).life.clock).toBe(before.life.clock);
  await page
    .getByRole('button', { name: 'Settings', exact: true })
    .click({ force: true });
  await page.getByLabel('Look sensitivity').fill('1.5');
  await page
    .getByRole('button', { name: 'New neighbourhood', exact: true })
    .click({ force: true });
  await expect(
    page.getByText('Begin again? This replaces your saved neighbourhood.'),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Keep my neighbourhood' })
    .click({ force: true });
  await page
    .getByRole('button', { name: 'Resume living', exact: true })
    .last()
    .click({ force: true });
  await page.clock.runFor(1000);
  await page.keyboard.up('w');
  await press(page, 'Tab');
  await expect(page.locator('[data-player]')).toHaveAttribute(
    'cy',
    String(18 - 1.5),
  );
  expect((await progress(page)).settings.sensitivity).toBe(1.5);
  await page.reload();
  await page
    .getByRole('button', { name: 'Neighbourhood & settings' })
    .click({ force: true });
  await page
    .getByRole('button', { name: 'Settings', exact: true })
    .click({ force: true });
  await expect(page.getByLabel('Look sensitivity')).toHaveValue('1.5');
});

test('night stalker interrupts life, lantern repels it, recall recovers and residents seek shelter', async ({
  page,
}) => {
  await setup(page, fixture(true));
  await hold(page, 'd', 600);
  await hold(page, 'w', 5200); // skirt the kitchen, enter the northern atrium
  await page.clock.runFor(12000);
  await expect(page.locator('.world-condition')).toContainText(
    'entity is near',
  );
  await page.screenshot({ path: 'test-results/night-stalker.png' });
  await press(page, 'g');
  await expect(page.getByRole('status')).toContainText('entities retreat');
  await press(page, 'r');
  await expect(page.locator('.world-condition')).toContainText(
    'Within ward light',
  );
  await press(page, 'Tab');
  await expect(page.getByRole('dialog')).toContainText(
    'Sheltering for the night',
  );
  expect((await progress(page)).life.energy).toBeLessThan(81);
});

test('finished legacy saves migrate to free play and tether is available without a quest', async ({
  page,
}) => {
  const old = JSON.stringify({
    version: 1,
    collected: ['remembering', 'becoming', 'unwritten'],
    phase: 'echo',
    complete: true,
    elapsed: 250,
    folds: 4,
    recoveries: 0,
    settings: {
      quality: 'low',
      muted: true,
      reducedMotion: true,
      sensitivity: 1,
    },
  });
  await setup(page, old);
  await hold(page, 'd', 600);
  await hold(page, 'w', 4400);
  await hold(page, 'a', 2000);
  await press(page, 'q');
  await hold(page, 'ArrowLeft', 1000);
  await press(page, 'f');
  await expect(page.getByRole('status')).toContainText('Void tether connected');
  await page.clock.runFor(1000);
  await press(page, 'Tab');
  await expect(page.locator('[data-player]')).toHaveAttribute('cx', '-23');
  await expect(page.locator('[data-player]')).toHaveAttribute('cy', '-4');
  expect((await progress(page)).version).toBe(2);
});

test('corrupted and unavailable saves produce usable notices', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('tesseract.expedition.v1', '{invalid'),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('save could not be read');
  await expect(
    page.getByRole('button', { name: 'Make yourself at home' }),
  ).toBeEnabled();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Quota exceeded');
    };
  });
  await page
    .getByRole('button', { name: 'Make yourself at home' })
    .click({ force: true });
  await page.keyboard.press('q');
  await expect(page.getByRole('alert')).toContainText(
    'Progress cannot be saved',
  );
});
