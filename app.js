// ═══════════════════════════════════════
//   SITARA COFFEE — App Logic
// ═══════════════════════════════════════

// ─── CART STATE ───
let cart = [];

// ─── PAGE ROUTING ───
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'menu') renderMenu();
  if (id === 'order') renderOrderSummary();
  if (id === 'thankyou') launchConfetti();
}

// ─── CART DRAWER ───
function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartDrawer();
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cart-count');
  badge.textContent = total;
  badge.classList.toggle('visible', total > 0);
}

function addToCart(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  updateCartBadge();
  renderCartDrawer();
  renderOrderSummary();
  showToast(`${item.emoji} ${item.name} added!`);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartBadge();
  renderCartDrawer();
  renderOrderSummary();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else {
    updateCartBadge();
    renderCartDrawer();
    renderOrderSummary();
  }
}

function getCartTotals() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const packaging = cart.length > 0 ? 10 : 0;
  const total = subtotal + tax + packaging;
  return { subtotal, tax, packaging, total };
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items-list');
  const footer = document.getElementById('cart-footer');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <a onclick="closeCart(); showPage('menu')">Browse our menu →</a>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  const { subtotal, tax, packaging, total } = getCartTotals();

  container.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, +1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
      <div style="color:var(--gold);font-family:'Playfair Display',serif;font-size:.95rem;flex-shrink:0;">
        ₹${item.price * item.qty}
      </div>
    </div>
  `).join('');

  document.getElementById('cart-subtotal').textContent = `₹${subtotal}`;
  document.getElementById('cart-tax').textContent = `₹${tax}`;
  document.getElementById('cart-packaging').textContent = `₹${packaging}`;
  document.getElementById('cart-grand-total').textContent = `₹${total}`;
}

// ─── MENU RENDER ───
function renderMenu(tag = 'all') {
  const grid = document.getElementById('menu-grid');
  const items = tag === 'all' ? menuItems : menuItems.filter(i => i.tag === tag);
  const bgMap = { hot: '#F5EFE0', cold: '#E8F4F8', food: '#FFF8F0' };

  grid.innerHTML = items.map(item => {
    const inCart = cart.find(c => c.id === item.id);
    return `
      <div class="menu-card">
        <div class="card-img" style="background:${bgMap[item.tag]}">
          <span style="font-size:4rem">${item.emoji}</span>
          ${item.badge ? `<div class="card-badge">${item.badge}</div>` : ''}
        </div>
        <div class="card-body">
          <div class="card-name">${item.name}</div>
          <div class="card-desc">${item.desc}</div>
          <div class="card-footer">
            <div class="card-price">₹${item.price}</div>
            <button class="add-btn ${inCart ? 'added' : ''}" onclick="addToCart(${item.id}); this.classList.add('added'); this.textContent='✓'; setTimeout(()=>{this.textContent='+';this.classList.remove('added')}, 1000)">
              ${inCart ? '✓' : '+'}
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function filterMenu(tag, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMenu(tag);
}

// ─── ORDER SUMMARY SIDEBAR ───
function renderOrderSummary() {
  const container = document.getElementById('order-summary-content');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="summary-empty">
        <div class="emoji">☕</div>
        <p>Add items from the menu<br>to see your order here</p>
        <a onclick="showPage('menu')" style="color:var(--gold);cursor:pointer;font-size:.82rem;">Browse Menu →</a>
      </div>`;
    return;
  }

  const { subtotal, tax, packaging, total } = getCartTotals();

  container.innerHTML = `
    <div class="os-list">
      ${cart.map(item => `
        <div class="os-item">
          <div class="os-item-left">
            <div class="os-item-emoji">${item.emoji}</div>
            <div>
              <div class="os-item-name">${item.name}</div>
              <span class="os-item-qty">x${item.qty}</span>
            </div>
          </div>
          <div class="os-item-price">₹${item.price * item.qty}</div>
        </div>
      `).join('')}
    </div>
    <div class="os-divider"></div>
    <div class="os-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
    <div class="os-row"><span>Taxes (5%)</span><span>₹${tax}</span></div>
    <div class="os-row"><span>Packaging</span><span>₹${packaging}</span></div>
    <div class="os-divider"></div>
    <div class="os-total"><span>Total</span><span>₹${total}</span></div>
    <p class="os-note">✦ Free delivery on orders above ₹500</p>
  `;
}

// ─── PAYMENT METHOD ───
function handlePaymentChange(val) {
  document.getElementById('card-details').classList.remove('visible');
  document.getElementById('upi-details').classList.remove('visible');
  document.getElementById('cod-details').classList.remove('visible');

  if (val === 'card') document.getElementById('card-details').classList.add('visible');
  if (val === 'upi') document.getElementById('upi-details').classList.add('visible');
  if (val === 'cod') document.getElementById('cod-details').classList.add('visible');
}

function selectUpiApp(el) {
  document.querySelectorAll('.upi-app').forEach(a => a.classList.remove('selected'));
  el.classList.add('selected');
}

function formatCardNumber(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 16);
  val = val.replace(/(.{4})/g, '$1 ').trim();
  input.value = val;
  const icon = document.getElementById('card-type-icon');
  const num = val.replace(/\s/g, '');
  if (num.startsWith('4')) icon.textContent = '💳';
  else if (num.startsWith('5')) icon.textContent = '💳';
  else if (num.startsWith('3')) icon.textContent = '💳';
  else icon.textContent = '💳';
}

function formatExpiry(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 4);
  if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
  input.value = val;
}

// ─── PLACE ORDER ───
function placeOrder() {
  const fname = document.getElementById('ord-fname')?.value?.trim();
  const phone = document.getElementById('ord-phone')?.value?.trim();
  const paymentEl = document.querySelector('input[name="payment"]:checked');

  if (!fname) { showToast('⚠ Please enter your name'); return; }
  if (!phone) { showToast('⚠ Please enter your phone number'); return; }
  if (!paymentEl) { showToast('⚠ Please select a payment method'); return; }
  if (cart.length === 0) { showToast('⚠ Your cart is empty!'); return; }

  // Extra validation for card
  if (paymentEl.value === 'card') {
    const cardNum = document.getElementById('card-number')?.value?.replace(/\s/g, '');
    if (!cardNum || cardNum.length < 16) { showToast('⚠ Enter a valid card number'); return; }
  }
  // Extra validation for UPI
  if (paymentEl.value === 'upi') {
    const upiId = document.getElementById('upi-id')?.value?.trim();
    const upiAppSelected = document.querySelector('.upi-app.selected');
    if (!upiId && !upiAppSelected) { showToast('⚠ Enter UPI ID or select an app'); return; }
  }

  const paymentLabels = { card:'Credit/Debit Card', upi:'UPI Payment', netbanking:'Net Banking', cod:'Cash on Delivery' };
  const orderId = '#SC-' + Math.floor(Math.random() * 9000 + 1000);

  document.getElementById('ty-order-num').textContent = orderId;
  document.getElementById('ty-payment-method').textContent =
    `Paid via ${paymentLabels[paymentEl.value]} · ₹${getCartTotals().total}`;

  // Clear cart after order
  cart = [];
  updateCartBadge();

  showPage('thankyou');
}

// ─── AUTH ───
function toggleAuth() {
  const login = document.getElementById('login-form-box');
  const signup = document.getElementById('signup-form-box');
  if (login.style.display === 'none') {
    login.style.display = 'block'; signup.style.display = 'none';
  } else {
    login.style.display = 'none'; signup.style.display = 'block';
  }
}

function handleLogin() {
  showToast('✦ Welcome to Sitara Coffee!');
  setTimeout(() => showPage('home'), 900);
}

// ─── CONFETTI ───
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#C9943A', '#F5EFE0', '#8B5E3C', '#D4A96A', '#fff'];
  const shapes = ['50%', '2px'];
  for (let i = 0; i < 50; i++) {
    const dot = document.createElement('div');
    dot.className = 'confetti-dot';
    const size = Math.random() * 8 + 4;
    dot.style.cssText = `
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      width:${size}px; height:${size}px;
      border-radius:${shapes[Math.floor(Math.random() * shapes.length)]};
      animation-duration:${Math.random() * 3 + 2}s;
      animation-delay:${Math.random() * 2}s;
    `;
    container.appendChild(dot);
  }
}

// ─── TOAST ───
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();

  // Order type toggle
  const typeSelect = document.getElementById('ord-type');
  if (typeSelect) {
    typeSelect.addEventListener('change', function () {
      document.getElementById('addr-field').style.display =
        this.value === 'Delivery' ? 'block' : 'none';
    });
  }

  // Payment radio listeners
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => handlePaymentChange(radio.value));
  });
});
