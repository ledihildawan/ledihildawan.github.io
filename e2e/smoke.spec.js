import { test, expect } from '@playwright/test';

// Smoke & Regression Test Suite — Consolidated for speed, reliability & zero overlap.

test.describe('Glider UI Components', () => {
  test('glider meluncur mengikuti hover pada navbar dan tab kategori', async ({ page }) => {
    await page.goto('/');

    // 1. Navbar Glider
    const navGlider = page.locator('.nav-glider');
    await expect(navGlider).toHaveClass(/is-ready/, { timeout: 5000 });

    const navLinks = page.locator('.navbar .nav-link.smooth-scroll');
    const beforeNav = await navGlider.evaluate((g) => g.getBoundingClientRect().left);

    await navLinks.last().hover();
    await page.waitForTimeout(400);
    const afterNav = await navGlider.evaluate((g) => g.getBoundingClientRect().left);
    expect(Math.abs(afterNav - beforeNav)).toBeGreaterThan(50);

    // Glider kembali ke posisi awal saat mouse keluar dari navbar
    await page.mouse.move(10, 500);
    await page.waitForTimeout(400);
    const settledNav = await navGlider.evaluate((g) => g.getBoundingClientRect().left);
    expect(Math.abs(settledNav - beforeNav)).toBeLessThan(5);

    // 2. Portfolio Category Tabs Glider
    const chips = page.locator('.filter-chip');
    await chips.first().scrollIntoViewIfNeeded();
    const tabGlider = page.locator('.tab-glider');
    await expect(tabGlider).toHaveClass(/is-ready/, { timeout: 5000 });

    const beforeTab = await tabGlider.evaluate((g) => g.getBoundingClientRect().left);
    await chips.nth(1).hover();
    await page.waitForTimeout(400);
    const afterTab = await tabGlider.evaluate((g) => g.getBoundingClientRect().left);
    expect(Math.abs(afterTab - beforeTab)).toBeGreaterThan(20);
  });
});

test.describe('Tooltip Sosial', () => {
  test('lifecycle hover, retargeting lintas ikon, dan dismiss', async ({ page }) => {
    await page.goto('/');
    const gh = page.locator('.button-container .cc-github');
    const tw = page.locator('.button-container .cc-twitter');
    await gh.scrollIntoViewIfNeeded();

    // Muncul saat hover ikon pertama
    await gh.hover();
    await expect(page.locator('.tooltip.show')).toHaveText('Ikuti saya di GitHub');

    // Retargeting ke ikon kedua (tetap 1 tooltip, teks berganti)
    await tw.hover();
    await expect(page.locator('.tooltip')).toHaveCount(1);
    await expect(page.locator('.tooltip.show')).toHaveText('Ikuti saya di X');

    // Hilang saat kursor keluar
    await page.mouse.move(10, 500);
    await page.waitForTimeout(400);
    await expect(page.locator('.tooltip')).toHaveCount(0);
  });
});

test.describe('Dropdown Sort', () => {
  test('interaksi menu, keyboard Escape, dan retargeting glider sort', async ({ page }) => {
    await page.goto('/');
    const dropdown = page.locator('[data-sort-dropdown]');
    await dropdown.scrollIntoViewIfNeeded();

    // Buka menu lalu tutup dengan Escape
    await dropdown.locator('.sort-trigger').click();
    await expect(dropdown.locator('.sort-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dropdown.locator('.sort-menu')).toBeHidden();

    // Buka kembali dan pilih opsi 'Popular'
    await dropdown.locator('.sort-trigger').click();
    await expect(dropdown.locator('.sort-menu')).toBeVisible();
    await dropdown.locator(".sort-option[data-value='popular']").click();
    await expect(page.locator('[data-sort-label]')).toHaveText('Popular shots');
    await expect(dropdown.locator('.sort-menu')).toBeHidden();

    // Buka ulang: pastikan glider sudah berada tepat di posisi opsi aktif
    await dropdown.locator('.sort-trigger').click();
    await expect(dropdown.locator('.sort-menu')).toBeVisible();
    const opt = dropdown.locator(".sort-option[data-value='popular']");
    const glider = dropdown.locator('.sort-glider');
    const optTop = await opt.evaluate((o) => o.getBoundingClientRect().top);
    const gliderTop = await glider.evaluate((g) => g.getBoundingClientRect().top);
    expect(Math.abs(gliderTop - optTop)).toBeLessThan(2);
  });
});

test.describe('Popover Preview Proyek', () => {
  test('lifecycle hover, interaktivitas kartu popover, dan auto-dismiss', async ({ page }) => {
    await page.goto('/');
    const chip = page
      .locator('.cc-project-avatar[data-project-title], .cc-shipped-chip[data-project-title]')
      .first();
    await chip.scrollIntoViewIfNeeded();

    // 1. Hover avatar: popover terbuka
    await chip.hover();
    const popover = page.locator('.cc-project-popover.is-visible');
    await expect(popover).toBeVisible({ timeout: 5000 });

    // 2. Gerakkan kursor ke dalam kartu popover: kartu tetap stabil terbuka
    const box = await popover.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
    await page.waitForTimeout(300);
    await expect(popover).toBeVisible();

    // 3. Gerakkan kursor keluar sepenuhnya: popover tertutup otomatis
    await page.mouse.move(10, 100);
    await page.waitForTimeout(500);
    await expect(page.locator('.cc-project-popover.is-visible')).toHaveCount(0);
  });
});

test.describe('Shadow Snap Tombol Sosial', () => {
  test('transisi glow cepat antar tombol tanpa ghosting/double-glow', async ({ page }) => {
    await page.goto('/');
    const gh = page.locator('.button-container .cc-github');
    const tw = page.locator('.button-container .cc-twitter');
    await gh.scrollIntoViewIfNeeded();

    await gh.hover();
    await page.waitForTimeout(300);

    await tw.hover();
    const ghShadow = await gh.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(ghShadow).not.toContain('0px 4px 20px');
  });
});

test.describe('Portfolio Modal Dribbble-Style', () => {
  test('lengkap: buka/tutup, navigasi keyboard arrow, dan scroll radius locking', async ({
    page,
  }) => {
    await page.goto('/');
    const firstItem = page.locator('#portfolio-items .portfolio-item').first();
    await firstItem.scrollIntoViewIfNeeded();
    await firstItem.click();

    const modal = page.locator('#portfolio-modal');
    await expect(modal).toHaveClass(/is-visible/, { timeout: 5000 });
    await expect(page.locator('body')).toHaveClass(/portfolio-modal-open/);

    const firstTitle = await firstItem.getAttribute('data-title');
    await expect(page.locator('.portfolio-modal-title')).toHaveText(firstTitle);

    // 1. Verifikasi border-radius header & scroll locking
    const mainContainer = page.locator('.portfolio-modal-main');
    expect(await mainContainer.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe(
      '24px'
    );
    expect(await mainContainer.evaluate((el) => getComputedStyle(el).borderTopRightRadius)).toBe(
      '0px'
    );

    // Scroll konten: pastikan top-left tetap 24px dan top-right 0px
    await mainContainer.evaluate((el) => {
      el.scrollTop = 300;
      el.dispatchEvent(new Event('scroll'));
    });
    expect(await mainContainer.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    expect(await mainContainer.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe(
      '24px'
    );

    // 2. Navigasi Keyboard Arrow
    await page.keyboard.press('ArrowRight');
    const nextTitle = await page.locator('.portfolio-modal-title').textContent();
    expect(nextTitle).not.toBe(firstTitle);

    await page.keyboard.press('ArrowLeft');
    const backTitle = await page.locator('.portfolio-modal-title').textContent();
    expect(backTitle).toBe(firstTitle);

    // 3. Tutup Modal dengan Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toHaveClass(/is-visible/);
    await expect(page.locator('body')).not.toHaveClass(/portfolio-modal-open/);

    // 4. Buka kembali dan tutup dengan tombol overlay ✕
    await firstItem.click();
    await expect(modal).toHaveClass(/is-visible/);
    await page.locator('.portfolio-modal-overlay-close').click();
    await expect(modal).not.toHaveClass(/is-visible/);
  });
});

test.describe('Form Kontak Interaksi & Auto-Resize', () => {
  test('fokus terpadu pada input-group dan auto-resize textarea', async ({ page }) => {
    await page.goto('/');

    // 1. Verifikasi input-group: klik addon ikon email memfokuskan input dan memberi highlight ke seluruh group
    const inputGroup = page.locator('.input-group').first();
    const addon = inputGroup.locator('.input-group-addon');
    const emailInput = inputGroup.locator('input[type="email"]');
    await inputGroup.scrollIntoViewIfNeeded();

    await addon.click();
    await expect(emailInput).toBeFocused();
    await expect(inputGroup).toHaveClass(/input-group-focus/);

    // 2. Auto-resize textarea
    const textarea = page.locator('textarea[data-auto-resize]');
    const initialHeight = await textarea.evaluate((el) => el.clientHeight);
    expect(initialHeight).toBeGreaterThanOrEqual(80);

    // Ketik beberapa baris teks
    await textarea.fill('Baris 1\nBaris 2\nBaris 3\nBaris 4\nBaris 5\nBaris 6\nBaris 7\nBaris 8');
    await page.waitForTimeout(200);

    const expandedHeight = await textarea.evaluate((el) => el.clientHeight);
    expect(expandedHeight).toBeGreaterThan(initialHeight);

    // Hapus teks, ukuran harus kembali mengecil ke baseline
    await textarea.fill('Halo');
    await page.waitForTimeout(200);

    const shrunkHeight = await textarea.evaluate((el) => el.clientHeight);
    expect(shrunkHeight).toBeLessThan(expandedHeight);
  });
});

test.describe('Portfolio Pagination & Load More', () => {
  test('default memuat hingga 12 item per kategori dan mendukung tombol Load more ketika > 12 item', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Kategori Web (4 item total <= 12) -> Semua tampak, Load more tersembunyi
    const webItems = page.locator('#portfolio-items .portfolio-item[data-category="web"]');
    await expect(webItems).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(webItems.nth(i)).toBeVisible();
    }
    const loadMoreWrap = page.locator('#portfolio-load-more-wrap');
    await expect(loadMoreWrap).toBeHidden();

    // 2. Beralih ke Kategori Graphic Design (5 item total <= 12) -> Semua tampak, Load more tersembunyi
    const designChip = page.locator('.filter-chip[data-filter="design"]');
    await designChip.click();
    await page.waitForTimeout(200);

    const designItems = page.locator('#portfolio-items .portfolio-item[data-category="design"]');
    await expect(designItems).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await expect(designItems.nth(i)).toBeVisible();
    }
    await expect(loadMoreWrap).toBeHidden();

    // 3. Beralih ke Photography (1 item <= 12) -> Tampak, Load more tersembunyi
    const photoChip = page.locator('.filter-chip[data-filter="photo"]');
    await photoChip.click();
    await page.waitForTimeout(200);

    const photoItems = page.locator('#portfolio-items .portfolio-item[data-category="photo"]');
    await expect(photoItems).toHaveCount(1);
    await expect(photoItems.first()).toBeVisible();
    await expect(loadMoreWrap).toBeHidden();
  });
});

test.describe('Perjalanan Karier & Pendidikan Layout (Option 1)', () => {
  test('memastikan kartu karier dan pendidikan memiliki struktur header timeline Option 1 (Logo 40px, Tanggal/Durasi, Posisi @ Instansi, Meta)', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Karier PT Indeks
    const indeksCard = page.locator('#experience .card').first();
    await expect(indeksCard.locator('.cc-timeline-logo')).toBeVisible();
    await expect(indeksCard.locator('.cc-timeline-date-line')).toContainText('Mar 2021 – Sep 2021');
    await expect(indeksCard.locator('.cc-timeline-date-line')).toContainText('7 mos');
    await expect(indeksCard.locator('.cc-timeline-title')).toContainText('Full Stack Developer');
    await expect(indeksCard.locator('.cc-timeline-title a')).toContainText(
      'PT Indeks Media Teknologi'
    );
    await expect(indeksCard.locator('.cc-timeline-meta-line')).toContainText(
      'Contract · On-site · Samarinda, East Kalimantan, Indonesia'
    );

    // 2. Karier PT Barqun
    const barqunCard = page.locator('#experience .card').nth(1);
    await expect(barqunCard.locator('.cc-timeline-logo')).toBeVisible();
    await expect(barqunCard.locator('.cc-timeline-date-line')).toContainText('Sep 2019 – Mar 2021');
    await expect(barqunCard.locator('.cc-timeline-title a')).toContainText(
      'PT Barqun Digital Teknologi'
    );
    await expect(barqunCard.locator('.cc-timeline-meta-line')).toContainText(
      'Contract · On-site · Samarinda, East Kalimantan, Indonesia'
    );

    // 3. Pendidikan STMIK WICIDA
    const wicidaCard = page.locator('.cc-education .card').first();
    await expect(wicidaCard.locator('.cc-timeline-logo')).toBeVisible();
    await expect(wicidaCard.locator('.cc-timeline-date-line')).toContainText('Aug 2014 – Aug 2021');
    await expect(wicidaCard.locator('.cc-timeline-title')).toContainText('S1 Teknik Informatika');
    await expect(wicidaCard.locator('.cc-timeline-title a')).toContainText(
      'STMIK Widya Cipta Dharma Samarinda'
    );
    await expect(wicidaCard.locator('.cc-timeline-meta-line')).toHaveText(
      'Samarinda, East Kalimantan, Indonesia'
    );
  });
});

test.describe('Bebas Error Console', () => {
  test('halaman termuat tanpa ada uncaught page errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e));
    await page.goto('/');
    await page.waitForTimeout(800);
    expect(errors).toEqual([]);
  });
});
