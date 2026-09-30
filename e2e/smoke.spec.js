import { test, expect } from '@playwright/test';

// Smoke test perilaku kunci yang sudah dipoles — mencegah regresi.

test.describe('Glider', () => {
  test('navbar: glider siap dan meluncur mengikuti hover', async ({ page }) => {
    await page.goto('/');
    const glider = page.locator('.nav-glider');
    await expect(glider).toHaveClass(/is-ready/, { timeout: 5000 });

    const links = page.locator('.navbar .nav-link.smooth-scroll');
    const last = links.last();
    const before = await glider.evaluate((g) => g.getBoundingClientRect().left);

    await last.hover();
    await page.waitForTimeout(500);
    const after = await glider.evaluate((g) => g.getBoundingClientRect().left);
    expect(Math.abs(after - before)).toBeGreaterThan(50); // pindah posisi nyata

    // pulang ke aktif saat mouse keluar navbar
    await page.mouse.move(10, 500);
    await page.waitForTimeout(500);
    const settled = await glider.evaluate((g) => g.getBoundingClientRect().left);
    expect(Math.abs(settled - before)).toBeLessThan(5);
  });

  test('chip kategori: tab-glider aktif dan slide antar chip', async ({ page }) => {
    await page.goto('/');
    const chips = page.locator('.filter-chip');
    await chips.first().scrollIntoViewIfNeeded();
    const glider = page.locator('.tab-glider');
    await expect(glider).toHaveClass(/is-ready/, { timeout: 5000 });

    const before = await glider.evaluate((g) => g.getBoundingClientRect().left);
    await chips.nth(1).hover();
    await page.waitForTimeout(500);
    const after = await glider.evaluate((g) => g.getBoundingClientRect().left);
    expect(Math.abs(after - before)).toBeGreaterThan(20);
  });
});

test.describe('Tooltip sosial', () => {
  test('muncul saat hover, retarget antar ikon, hilang saat keluar', async ({ page }) => {
    await page.goto('/');
    const gh = page.locator('.button-container .cc-github');
    const tw = page.locator('.button-container .cc-twitter');
    await gh.scrollIntoViewIfNeeded();

    await gh.hover();
    await expect(page.locator('.tooltip.show')).toHaveText('Ikuti saya di GitHub');

    // retarget lintas gap: tetap 1 elemen, teks berganti
    await tw.hover();
    const tips = await page.locator('.tooltip').count();
    expect(tips).toBe(1);
    await expect(page.locator('.tooltip.show')).toHaveText('Ikuti saya di X');

    // keluar -> hilang
    await page.mouse.move(10, 500);
    await page.waitForTimeout(600);
    await expect(page.locator('.tooltip')).toHaveCount(0);
  });
});

test.describe('Dropdown sort', () => {
  test('pilih Popular: label berubah, buka ulang instan (glider langsung di posisi)', async ({
    page,
  }) => {
    await page.goto('/');
    const dropdown = page.locator('[data-sort-dropdown]');
    await dropdown.scrollIntoViewIfNeeded();

    await dropdown.locator('.sort-trigger').click();
    await expect(dropdown.locator('.sort-menu')).toBeVisible();

    await dropdown.locator(".sort-option[data-value='popular']").click();
    await expect(page.locator('[data-sort-label]')).toHaveText('Popular shots');
    await expect(dropdown.locator('.sort-menu')).toBeHidden();

    // buka ulang: glider harus sudah di posisi Popular sejak frame pertama
    await dropdown.locator('.sort-trigger').click();
    await expect(dropdown.locator('.sort-menu')).toBeVisible();
    const opt = dropdown.locator(".sort-option[data-value='popular']");
    const glider = dropdown.locator('.sort-glider');
    const optTop = await opt.evaluate((o) => o.getBoundingClientRect().top);
    const gliderTop = await glider.evaluate((g) => g.getBoundingClientRect().top);
    expect(Math.abs(gliderTop - optTop)).toBeLessThan(2);

    // menu tidak memutar ulang animasi masuk
    const anim = await dropdown
      .locator('.sort-menu')
      .evaluate((m) => getComputedStyle(m).animationName);
    expect(anim).toBe('none');
  });

  test('Escape menutup menu', async ({ page }) => {
    await page.goto('/');
    const dropdown = page.locator('[data-sort-dropdown]');
    await dropdown.scrollIntoViewIfNeeded();
    await dropdown.locator('.sort-trigger').click();
    await expect(dropdown.locator('.sort-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dropdown.locator('.sort-menu')).toBeHidden();
  });
});

test.describe('Popover preview proyek', () => {
  test('terbuka saat hover, tertutup saat keluar', async ({ page }) => {
    await page.goto('/');
    const chip = page
      .locator('.cc-project-avatar[data-project-title], .cc-shipped-chip[data-project-title]')
      .first();
    await chip.scrollIntoViewIfNeeded();
    await chip.hover();
    await expect(page.locator('.cc-project-popover.is-visible')).toBeVisible({ timeout: 5000 });
    await page.mouse.move(10, 100);
    await page.waitForTimeout(500);
    await expect(page.locator('.cc-project-popover.is-visible')).toHaveCount(0);
  });
});

test.describe('Shadow snap tombol sosial', () => {
  test('hover cepat antar tombol: tidak ada dua glow bersamaan', async ({ page }) => {
    await page.goto('/');
    const gh = page.locator('.button-container .cc-github');
    const tw = page.locator('.button-container .cc-twitter');
    await gh.scrollIntoViewIfNeeded();
    await gh.hover();
    await page.waitForTimeout(400); // pastikan glow gh stabil

    await tw.hover();
    // segera setelah pindah: gh harus snap ke rest (bukan masih glow)
    const ghShadow = await gh.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(ghShadow).not.toContain('0px 4px 20px');
  });
});

test.describe('Portfolio Modal Dribbble-style', () => {
  test('klik item membuka modal, Escape & tombol close menutup modal', async ({ page }) => {
    await page.goto('/');
    const firstItem = page.locator('#portfolio-items .portfolio-item').first();
    await firstItem.scrollIntoViewIfNeeded();
    await firstItem.click();

    const modal = page.locator('#portfolio-modal');
    await expect(modal).toHaveClass(/is-visible/, { timeout: 5000 });
    await expect(page.locator('body')).toHaveClass(/portfolio-modal-open/);

    const title = await firstItem.getAttribute('data-title');
    await expect(page.locator('.portfolio-modal-title')).toHaveText(title);

    // Escape menutup modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toHaveClass(/is-visible/);
    await expect(page.locator('body')).not.toHaveClass(/portfolio-modal-open/);

    // Buka lagi lalu klik tombol close
    await firstItem.click();
    await expect(modal).toHaveClass(/is-visible/);
    await page.locator('.portfolio-modal-overlay-close').click();
    await expect(modal).not.toHaveClass(/is-visible/);
  });

  test('navigasi arrow keyboard berganti karya', async ({ page }) => {
    await page.goto('/');
    const firstItem = page.locator('#portfolio-items .portfolio-item').first();
    await firstItem.scrollIntoViewIfNeeded();
    await firstItem.click();

    const modal = page.locator('#portfolio-modal');
    await expect(modal).toHaveClass(/is-visible/);

    const firstTitle = await page.locator('.portfolio-modal-title').textContent();

    // Panah keyboard kanan (next) berganti karya
    await page.keyboard.press('ArrowRight');
    const nextTitle = await page.locator('.portfolio-modal-title').textContent();
    expect(nextTitle).not.toBe(firstTitle);

    // Panah keyboard kiri (prev) kembali ke judul pertama
    await page.keyboard.press('ArrowLeft');
    const backTitle = await page.locator('.portfolio-modal-title').textContent();
    expect(backTitle).toBe(firstTitle);
  });

  test('scroll konten modal menjaga border-top-left-radius tetap 24px dan border-top-right-radius 0px', async ({
    page,
  }) => {
    await page.goto('/');
    const firstItem = page.locator('#portfolio-items .portfolio-item').first();
    await firstItem.scrollIntoViewIfNeeded();
    await firstItem.click();

    const modal = page.locator('#portfolio-modal');
    await expect(modal).toHaveClass(/is-visible/);

    const mainContainer = page.locator('.portfolio-modal-main');

    // Cek radius sebelum di-scroll
    const topLeftBefore = await mainContainer.evaluate(
      (el) => getComputedStyle(el).borderTopLeftRadius
    );
    const topRightBefore = await mainContainer.evaluate(
      (el) => getComputedStyle(el).borderTopRightRadius
    );
    expect(topLeftBefore).toBe('24px');
    expect(topRightBefore).toBe('0px');

    // Scroll konten ke bawah 300px
    await mainContainer.evaluate((el) => {
      el.scrollTop = 300;
      el.dispatchEvent(new Event('scroll'));
    });

    const scrollTop = await mainContainer.evaluate((el) => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(0);

    // Radius top-left pada container scroll HARUS tetap 24px saat di-scroll
    const topLeftAfter = await mainContainer.evaluate(
      (el) => getComputedStyle(el).borderTopLeftRadius
    );
    const topRightAfter = await mainContainer.evaluate(
      (el) => getComputedStyle(el).borderTopRightRadius
    );
    expect(topLeftAfter).toBe('24px');
    expect(topRightAfter).toBe('0px');
  });
});

test.describe('Bebas error console', () => {
  test('tidak ada page error', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e));
    await page.goto('/');
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });
});
