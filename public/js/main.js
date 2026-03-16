/* ═══════════════════════════════════════════
   Adawaty — Core JavaScript
   WhatsApp routing, PDF export, UI
   ═══════════════════════════════════════════ */

const WHATSAPP_NUMBER = '13393991355'; // +1 (339) 399-1355
const PHONE_DISPLAY = '+1 (339) 399-1355';

// ── Toast System ──
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
}

// ── WhatsApp Routing ──
function sendToWhatsApp(message) {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  window.open(url, '_blank');
}

function buildQuoteMessage(data) {
  const { t } = window.AdaI18n || { t: k => k };
  let msg = `🔵 *Adawaty Quote Request*\n`;
  msg += `━━━━━━━━━━━━━━━━\n`;
  if (data.serial) msg += `📋 Serial: ${data.serial}\n`;
  msg += `📅 Date: ${new Date().toLocaleDateString()}\n\n`;

  if (data.name) msg += `👤 Name: ${data.name}\n`;
  if (data.email) msg += `📧 Email: ${data.email}\n`;
  if (data.phone) msg += `📱 Phone: ${data.phone}\n`;
  if (data.company) msg += `🏢 Company: ${data.company}\n`;
  msg += `\n`;

  if (data.timeline) msg += `⏱ Timeline: ${data.timeline}\n\n`;

  if (data.selections) {
    msg += `📦 *Selected Items:*\n`;
    data.selections.forEach(s => { msg += `  • ${s}\n`; });
    msg += `\n`;
  }

  if (data.oneTime !== undefined) msg += `💰 One-Time: $${data.oneTime.toLocaleString()}\n`;
  if (data.monthly !== undefined) msg += `🔄 Monthly: $${data.monthly.toLocaleString()}/mo\n`;
  msg += `\n`;
  msg += `━━━━━━━━━━━━━━━━\n`;
  msg += `💬 _Sent from Adawaty Pricing Calculator_`;
  return msg;
}

function buildContactMessage(data) {
  let msg = `📩 *New Adawaty Inquiry*\n`;
  msg += `━━━━━━━━━━━━━━━━\n`;
  if (data.name) msg += `👤 Name: ${data.name}\n`;
  if (data.email) msg += `📧 Email: ${data.email}\n`;
  if (data.phone) msg += `📱 Phone: ${data.phone}\n`;
  if (data.company) msg += `🏢 Company: ${data.company}\n`;
  if (data.service) msg += `🎯 Interest: ${data.service}\n`;
  msg += `\n`;
  if (data.message) msg += `💬 Message:\n${data.message}\n`;
  msg += `\n━━━━━━━━━━━━━━━━\n`;
  msg += `📅 ${new Date().toLocaleString()}`;
  return msg;
}

// ── PDF Export (using browser print) ──
function exportToPDF(elementId, filename) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  // Create print window
  const printWindow = window.open('', '_blank');
  const serial = generateSerial();
  
  printWindow.document.write(`<!DOCTYPE html><html><head>
    <title>Adawaty Quote - ${serial}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', system-ui, sans-serif; color: #222; padding: 40px; max-width: 800px; margin: 0 auto; }
      h1 { font-size: 24px; color: #0d9488; margin-bottom: 4px; }
      h2 { font-size: 18px; color: #333; margin: 24px 0 12px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px; }
      .serial { font-family: monospace; font-size: 14px; color: #666; }
      .date { font-size: 13px; color: #888; }
      table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
      th { background: #f5f5f5; font-weight: 600; color: #444; }
      .total-row { font-weight: 700; font-size: 16px; background: #f0fdf4; }
      .total-row td { border-top: 2px solid #0d9488; }
      .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 12px; color: #888; text-align: center; }
      .badge { display: inline-block; padding: 2px 10px; background: #e0f7f4; color: #0d9488; border-radius: 12px; font-size: 12px; font-weight: 600; }
      .note { background: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 8px; font-size: 13px; color: #92400e; margin: 16px 0; }
      .contact-info { margin-top: 16px; font-size: 13px; color: #555; }
      @media print { body { padding: 20px; } }
    </style>
  </head><body>`);
  
  // Get quote data from the page
  const data = getQuoteData();
  
  printWindow.document.write(`
    <div class="header">
      <div>
        <h1>Adawaty</h1>
        <div style="font-size:13px;color:#666;margin-top:4px;">Brand → Build → Demand | DFY Studio</div>
      </div>
      <div style="text-align:right;">
        <div class="serial">Serial: <strong>${serial}</strong></div>
        <div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div class="badge" style="margin-top:6px;">Estimate</div>
      </div>
    </div>
  `);

  // Timeline
  if (data.timeline) {
    printWindow.document.write(`<div class="note">⏱ Estimated timeline: <strong>${data.timeline.minWeeks}–${data.timeline.maxWeeks} weeks</strong></div>`);
  }
  
  if (data.clientName || data.clientEmail) {
    printWindow.document.write(`<h2>Client Details</h2><table>`);
    if (data.clientName) printWindow.document.write(`<tr><th width="120">Name</th><td>${data.clientName}</td></tr>`);
    if (data.clientEmail) printWindow.document.write(`<tr><th>Email</th><td>${data.clientEmail}</td></tr>`);
    if (data.clientPhone) printWindow.document.write(`<tr><th>Phone</th><td>${data.clientPhone}</td></tr>`);
    printWindow.document.write(`</table>`);
  }
  
  printWindow.document.write(`<h2>Selected Items</h2><table>
    <tr><th>Item</th><th style="text-align:right">One-Time</th><th style="text-align:right">Monthly</th></tr>`);
  
  data.items.forEach(item => {
    printWindow.document.write(`<tr>
      <td>${item.name}</td>
      <td style="text-align:right">${item.oneTime ? '$' + item.oneTime.toLocaleString() : '—'}</td>
      <td style="text-align:right">${item.monthly ? '$' + item.monthly.toLocaleString() + '/mo' : '—'}</td>
    </tr>`);
  });
  
  printWindow.document.write(`
    <tr class="total-row">
      <td>Total</td>
      <td style="text-align:right">$${data.totalOneTime.toLocaleString()}</td>
      <td style="text-align:right">$${data.totalMonthly.toLocaleString()}/mo</td>
    </tr></table>`);
  
  printWindow.document.write(`
    <div class="note">
      ⚡ This is an estimate. Final pricing depends on timeline, scope complexity, and integrations. 
      Contact us to lock your scope and get a fixed quote.
    </div>
    <div class="contact-info">
      <strong>Ready to proceed?</strong> Contact us at ${PHONE_DISPLAY} or hello@adawaty.net
    </div>
    <div class="footer">
      Adawaty — Brand → Build → Demand | adawaty.net<br>
      This document was generated on ${new Date().toLocaleString()} | Serial: ${serial}
    </div>
  </body></html>`);
  
  printWindow.document.close();
  setTimeout(() => { printWindow.print(); }, 500);
  
  return serial;
}

function generateSerial() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = Math.random().toString(36).slice(2,8).toUpperCase();
  return `ADW-P-${date}-${rand}`;
}

// ── Scroll Animations ──
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Don't unobserve to keep animation on re-scroll
      }
    });
  }, { threshold: 0.1, rootMargin: '-40px' });
  
  document.querySelectorAll('.fade-in, .stagger').forEach(el => observer.observe(el));
}

// ── Tabs ──
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const parent = tabGroup.closest('[data-tabs]') || tabGroup.parentElement;
    const buttons = tabGroup.querySelectorAll('.tab-btn');
    const contents = parent.querySelectorAll('.tab-content');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        buttons.forEach(b => b.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetContent = parent.querySelector(`.tab-content[data-tab="${target}"]`);
        if (targetContent) targetContent.classList.add('active');
      });
    });
  });
}

// ── Mobile Nav ──
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.mobile-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
  }
}

// ── Back to Top ──
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'btn btn-icon btn-secondary no-print';
  btn.innerHTML = '↑';
  btn.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:50;opacity:0;transform:translateY(10px);transition:all 0.3s;border-radius:50%;';
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(btn);
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.style.opacity = '1'; btn.style.transform = 'translateY(0)';
    } else {
      btn.style.opacity = '0'; btn.style.transform = 'translateY(10px)';
    }
  }, { passive: true });
}

// ── Active Nav Link ──
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ── Get Quote Data from Pricing Page ──
function getQuoteData() {
  const items = [];
  let totalOneTime = 0;
  let totalMonthly = 0;

  // Timeline model (weeks)
  let minWeeks = 1;
  let maxWeeks = 1;

  const addItem = (name, oneTime = 0, monthly = 0, tMin = 0, tMax = 0) => {
    items.push({ name, oneTime, monthly });
    totalOneTime += oneTime;
    totalMonthly += monthly;
    minWeeks += tMin;
    maxWeeks += tMax;
  };

  // Website
  const webCheck = document.getElementById('include-website');
  if (webCheck?.checked) {
    const val = document.getElementById('website-type')?.value || 'multi-page';
    const web = {
      'one-page': { name: 'Website (One-page)', oneTime: 650, tMin: 1, tMax: 2 },
      'multi-page': { name: 'Website (Multi-page)', oneTime: 1600, tMin: 2, tMax: 3 },
      'ecommerce': { name: 'Website (eCommerce)', oneTime: 2600, tMin: 3, tMax: 5 },
    };
    const w = web[val] || web['multi-page'];
    addItem(w.name, w.oneTime, 0, w.tMin, w.tMax);
  }

  // Bio
  const bioCheck = document.getElementById('include-bio');
  if (bioCheck?.checked) {
    const val = document.getElementById('bio-type')?.value || 'classic';
    const bio = {
      classic: { name: 'Personal Bio Page', oneTime: 249, tMin: 0.5, tMax: 1 },
      pro: { name: 'Personal Bio (Pro)', oneTime: 399, tMin: 0.5, tMax: 1 },
    };
    const b = bio[val] || bio.classic;
    addItem(b.name, b.oneTime, 0, b.tMin, b.tMax);
  }

  // Hosting (monthly)
  const hostSel = document.getElementById('hosting-tier');
  if (hostSel) {
    const val = hostSel.value || 'pro';
    const host = {
      starter: { name: 'Starter Hosting', monthly: 19 },
      standard: { name: 'Standard Hosting', monthly: 29 },
      pro: { name: 'Pro Hosting', monthly: 39 },
      business: { name: 'Business Hosting', monthly: 49 },
    };
    const h = host[val] || host.pro;
    addItem(h.name, 0, h.monthly, 0, 0);
  }

  // Add-ons (one-time / monthly)
  const addons = {
    copy: { name: 'Copy + Positioning', oneTime: 350, tMin: 0.5, tMax: 1 },
    booking: { name: 'Scheduling + WhatsApp', oneTime: 150, tMin: 0, tMax: 0.5 },
    seo: { name: 'SEO Foundation', oneTime: 450, tMin: 0.5, tMax: 1 },
    aeo: { name: 'AI Overview / AEO Pack', oneTime: 350, tMin: 0.5, tMax: 1 },
    analytics: { name: 'Analytics + Pixels', oneTime: 250, tMin: 0, tMax: 0.5 },
    branding: { name: 'Brand System Lite', oneTime: 550, tMin: 0.5, tMax: 1.5 },
    screens: { name: 'Client Screenshots + Niches', oneTime: 180, tMin: 0, tMax: 0.5 },
    growth: { name: 'Growth Plan (SEO + AEO + Content)', monthly: 699 },
    cro: { name: 'CRO Experiments', monthly: 299 },
    care: { name: 'Reliability Monitoring', monthly: 49 },
  };

  Object.entries(addons).forEach(([key, addon]) => {
    const check = document.getElementById(`addon-${key}`);
    if (check?.checked) {
      addItem(addon.name, addon.oneTime || 0, addon.monthly || 0, addon.tMin || 0, addon.tMax || 0);
    }
  });

  // Normalize timeline to half-week increments
  minWeeks = Math.max(1, Math.round(minWeeks * 2) / 2);
  maxWeeks = Math.max(minWeeks, Math.round(maxWeeks * 2) / 2);

  return {
    items,
    totalOneTime,
    totalMonthly,
    timeline: { minWeeks, maxWeeks },
    clientName: document.getElementById('client-name')?.value || '',
    clientEmail: document.getElementById('client-email')?.value || '',
    clientPhone: document.getElementById('client-phone')?.value || '',
  };
}

// ── Update Pricing Display ──
function updatePricingDisplay() {
  const data = getQuoteData();
  const oneTimeEl = document.getElementById('total-onetime');
  const monthlyEl = document.getElementById('total-monthly');
  const timelineEl = document.getElementById('total-timeline');

  if (oneTimeEl) oneTimeEl.textContent = `$${data.totalOneTime.toLocaleString()}`;
  if (monthlyEl) monthlyEl.textContent = `$${data.totalMonthly.toLocaleString()}/mo`;
  if (timelineEl && data.timeline) timelineEl.textContent = `${data.timeline.minWeeks}–${data.timeline.maxWeeks} wks`;

  // Update breakdown
  const breakdown = document.getElementById('breakdown-list');
  if (breakdown) {
    breakdown.innerHTML = data.items
      .filter(i => (i.oneTime || i.monthly))
      .map(item => `
        <div class="breakdown-row">
          <span class="label">${item.name}</span>
          <span class="value">${item.oneTime ? '$' + item.oneTime.toLocaleString() : ''}${item.monthly ? (item.oneTime ? ' + ' : '') + '$' + item.monthly.toLocaleString() + '/mo' : ''}</span>
        </div>
      `)
      .join('');
  }
}

// ── Initialize Everything ──
document.addEventListener('DOMContentLoaded', () => {
  if (window.AdaI18n) window.AdaI18n.initI18n();
  initAnimations();
  initTabs();
  initMobileNav();
  initBackToTop();
  setActiveNav();
  
  // Pricing page listeners
  const pricingInputs = document.querySelectorAll('#pricing-form input, #pricing-form select');
  pricingInputs.forEach(input => {
    input.addEventListener('change', updatePricingDisplay);
    input.addEventListener('input', updatePricingDisplay);
  });
  
  // Initial pricing update
  if (document.getElementById('pricing-form')) {
    updatePricingDisplay();
  }
});

// Export globals
window.Adawaty = {
  sendToWhatsApp,
  buildQuoteMessage,
  buildContactMessage,
  exportToPDF,
  generateSerial,
  showToast,
  getQuoteData,
  updatePricingDisplay,
  WHATSAPP_NUMBER,
  PHONE_DISPLAY,
};
