let cart = [];
let currentOrderMode = 'delivery'; // 'delivery' or 'pickup'
let activeCategory = 'all';
let searchQuery = '';
let appliedDiscount = 0;
let promoCodeName = '';

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderPricelistTable();
  updateCartUI();
});

function setOrderMode(mode) {
  currentOrderMode = mode;
  const btnDeliv = document.getElementById('mode-delivery');
  const btnPickup = document.getElementById('mode-pickup');
  if (mode === 'delivery') {
    btnDeliv.className = "px-4 py-1.5 rounded-full transition-all bg-brand-600 text-white shadow-sm";
    btnPickup.className = "px-4 py-1.5 rounded-full transition-all text-brand-700 hover:text-brand-900";
    showToast("Mode diubah ke: Pesan Antar");
  } else {
    btnPickup.className = "px-4 py-1.5 rounded-full transition-all bg-brand-600 text-white shadow-sm";
    btnDeliv.className = "px-4 py-1.5 rounded-full transition-all text-brand-700 hover:text-brand-900";
    showToast("Mode diubah ke: Ambil di Tempat");
  }
}

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  let filtered = MENU_PRODUCTS.filter(item => {
    let matchCat = activeCategory === 'all' || item.category === activeCategory;
    let matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-brand-500">Minuman tidak ditemukan.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    let price250 = item.prices[250] ? formatRupiah(item.prices[250]) : '';
    return `
      <div class="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all border border-brand-200/80 flex flex-col justify-between group">
        <div>
          <div class="relative overflow-hidden rounded-2xl mb-4 aspect-square bg-brand-100">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80'">
            ${item.badge ? `<span class="absolute top-3 left-3 bg-terracotta text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">${item.badge}</span>` : ''}
          </div>
          <h3 class="font-serif font-bold text-xl text-brand-800 mb-1">${item.name}</h3>
          <p class="text-xs text-brand-600 line-clamp-2 mb-4">${item.description}</p>
        </div>
        <div>
          <div class="flex items-center justify-between mb-4 pt-3 border-t border-brand-100">
            <span class="text-xs font-medium text-brand-500">Mulai dari</span>
            <span class="font-bold text-brand-700 text-base">${price250}</span>
          </div>
          <button onclick="openCustomizeModal('${item.id}')" class="w-full bg-brand-100 hover:bg-brand-600 hover:text-white text-brand-800 font-semibold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2">
            <span>Pilih Ukuran & Pesan</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderPricelistTable() {
  const tbody = document.getElementById('pricelist-table-body');
  if (!tbody) return;

  tbody.innerHTML = MENU_PRODUCTS.map(item => `
    <tr class="hover:bg-brand-50/50 transition-colors">
      <td class="py-4 px-6 font-semibold text-brand-800">${item.name}</td>
      <td class="py-4 px-6 text-center font-medium text-brand-700">${item.prices[250] ? formatRupiah(item.prices[250]) : '-'}</td>
      <td class="py-4 px-6 text-center font-medium text-brand-700">${item.prices[150] ? formatRupiah(item.prices[150]) : 'Tidak Tersedia'}</td>
      <td class="py-4 px-6 text-right">
        <button onclick="openCustomizeModal('${item.id}')" class="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all">Pesan</button>
      </td>
    </tr>
  `).join('');
}

function filterCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.className = "cat-btn px-5 py-2.5 rounded-xl font-medium text-sm transition-all bg-brand-100 text-brand-700 hover:bg-brand-200 whitespace-nowrap";
  });
  event.target.className = "cat-btn px-5 py-2.5 rounded-xl font-medium text-sm transition-all bg-brand-600 text-white shadow-sm whitespace-nowrap";
  renderProducts();
}

function handleSearch(val) {
  searchQuery = val;
  renderProducts();
}

function openCustomizeModal(itemId) {
  const item = MENU_PRODUCTS.find(p => p.id === itemId);
  if (!item) return;

  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalContainer = document.getElementById('modal-container');

  modalContainer.innerHTML = `
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="font-serif text-2xl font-bold text-brand-800">${item.name}</h3>
        <p class="text-xs text-brand-500">Sesuaikan ukuran dan preferensi rasa Anda</p>
      </div>
      <button onclick="closeModal()" class="p-2 rounded-xl bg-brand-100 text-brand-700 hover:bg-brand-200">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="space-y-5">
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">Pilih Ukuran Botol</label>
        <div class="grid grid-cols-2 gap-3">
          ${item.prices[250] !== null ? `
            <label class="border-2 border-brand-200 rounded-2xl p-3 flex flex-col cursor-pointer hover:border-brand-600 transition-all has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/50">
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-sm text-brand-800">250 ml</span>
                <input type="radio" name="modal-size" value="250" checked class="accent-brand-600" onchange="updateModalPrice()">
              </div>
              <span class="text-xs text-brand-500">Botol Kotak Elegan</span>
              <span class="text-xs font-bold text-brand-700 mt-2">${formatRupiah(item.prices[250])}</span>
            </label>
          ` : ''}
          ${item.prices[150] !== null ? `
            <label class="border-2 border-brand-200 rounded-2xl p-3 flex flex-col cursor-pointer hover:border-brand-600 transition-all has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/50">
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-sm text-brand-800">150 ml</span>
                <input type="radio" name="modal-size" value="150" ${item.prices[250] === null ? 'checked' : ''} class="accent-brand-600" onchange="updateModalPrice()">
              </div>
              <span class="text-xs text-brand-500">Botol Praktis</span>
              <span class="text-xs font-bold text-brand-700 mt-2">${formatRupiah(item.prices[150])}</span>
            </label>
          ` : ''}
        </div>
      </div>
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">Catatan / Opsi Tambahan</label>
        <div class="space-y-2">
          ${TOPPINGS.map(t => `
            <label class="flex items-center justify-between p-3 rounded-xl bg-brand-50 border border-brand-200 cursor-pointer">
              <span class="text-sm font-medium text-brand-800">${t.name}</span>
              <input type="checkbox" value="${t.name}" class="modal-topping accent-brand-600 w-4 h-4 rounded">
            </label>
          `).join('')}
        </div>
      </div>
      <div class="pt-4 border-t border-brand-100 flex items-center justify-between gap-4">
        <div>
          <span class="text-xs text-brand-500 block">Total Harga</span>
          <span id="modal-total-price" class="font-bold text-xl text-brand-800">${formatRupiah(item.prices[250] || item.prices[150])}</span>
        </div>
        <button onclick="addToCartFromModal('${item.id}')" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3.5 px-6 rounded-2xl font-bold shadow-lg shadow-brand-600/20 transition-all text-center">
          Masukkan Keranjang
        </button>
      </div>
    </div>
  `;

  modalBackdrop.classList.remove('hidden');
  setTimeout(() => {
    modalContainer.classList.remove('scale-95', 'opacity-0');
    modalContainer.classList.add('scale-100', 'opacity-100');
  }, 10);
  window.currentModalItem = item;
}

function updateModalPrice() {
  const item = window.currentModalItem;
  const selectedSize = document.querySelector('input[name="modal-size"]:checked').value;
  const price = item.prices[selectedSize];
  document.getElementById('modal-total-price').innerText = formatRupiah(price);
}

function closeModal() {
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalContainer = document.getElementById('modal-container');
  modalContainer.classList.remove('scale-100', 'opacity-100');
  modalContainer.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    modalBackdrop.classList.add('hidden');
  }, 300);
}

function addToCartFromModal(itemId) {
  const item = MENU_PRODUCTS.find(p => p.id === itemId);
  const selectedSize = document.querySelector('input[name="modal-size"]:checked').value;
  const price = item.prices[selectedSize];
  
  const selectedToppings = Array.from(document.querySelectorAll('.modal-topping:checked')).map(el => el.value);

  const cartItem = {
    cartId: Date.now() + Math.random(),
    id: item.id,
    name: `${item.name} (${selectedSize} ml)`,
    price: price,
    size: selectedSize,
    toppings: selectedToppings,
    quantity: 1,
    image: item.image
  };

  cart.push(cartItem);
  closeModal();
  updateCartUI();
  showToast("Berhasil ditambahkan ke keranjang!");
}

function updateCartUI() {
  const badge1 = document.getElementById('cart-badge');
  const badge2 = document.getElementById('cart-badge-mobile');
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (totalItems > 0) {
    badge1.innerText = totalItems;
    badge1.classList.remove('hidden');
    badge2.innerText = totalItems;
    badge2.classList.remove('hidden');
  } else {
    badge1.classList.add('hidden');
    badge2.classList.add('hidden');
  }
}

function toggleCartDrawer(open) {
  const backdrop = document.getElementById('cart-drawer-backdrop');
  const drawer = document.getElementById('cart-drawer');

  if (open) {
    renderCartContent();
    backdrop.classList.remove('hidden');
    setTimeout(() => {
      drawer.classList.remove('translate-x-full');
    }, 10);
  } else {
    drawer.classList.add('translate-x-full');
    setTimeout(() => {
      backdrop.classList.add('hidden');
    }, 300);
  }
}

function renderCartContent() {
  const drawer = document.getElementById('cart-drawer');
  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const discountAmount = (subtotal * appliedDiscount);
  const deliveryFee = currentOrderMode === 'delivery' ? 10000 : 0;
  const finalTotal = subtotal - discountAmount + deliveryFee;

  drawer.innerHTML = `
    <div class="p-6 border-b border-brand-200 flex items-center justify-between bg-brand-50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        </div>
        <div>
          <h2 class="font-serif text-xl font-bold text-brand-800">Keranjang Belanja</h2>
          <span class="text-xs text-brand-500">${currentOrderMode === 'delivery' ? 'Pesan Antar ke Lokasi' : 'Ambil di Tempat'}</span>
        </div>
      </div>
      <button onclick="toggleCartDrawer(false)" class="p-2 rounded-xl bg-white text-brand-700 hover:bg-brand-200 border border-brand-200">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-4">
      ${cart.length === 0 ? `
        <div class="text-center py-16 text-brand-400">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          <p class="font-medium text-brand-600">Keranjang Anda masih kosong</p>
          <p class="text-xs mt-1">Yuk pilih varian minuman favoritmu sekarang!</p>
        </div>
      ` : cart.map(item => `
        <div class="flex gap-4 p-4 rounded-2xl bg-brand-50 border border-brand-200 items-center">
          <img src="${item.image}" class="w-16 h-16 rounded-xl object-cover" onerror="this.src='https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=200&q=80'">
          <div class="flex-1">
            <h4 class="font-bold text-sm text-brand-800">${item.name}</h4>${item.toppings.length > 0 ? `<p class="text-[11px] text-brand-500">${item.toppings.join(', ')}</p>` : ''}
            <span class="font-bold text-sm text-brand-700 block mt-1">${formatRupiah(item.price)}</span>
          </div>
          <div class="flex items-center gap-2 bg-white rounded-xl border border-brand-200 p-1">
            <button onclick="changeQuantity('${item.cartId}', -1)" class="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center font-bold text-brand-800 hover:bg-brand-200">-</button>
            <span class="text-sm font-bold w-5 text-center">${item.quantity}</span>
            <button onclick="changeQuantity('${item.cartId}', 1)" class="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center font-bold text-brand-800 hover:bg-brand-200">+</button>
          </div>
        </div>
      `).join('')}
    </div>

    ${cart.length > 0 ? `
      <div class="p-6 border-t border-brand-200 bg-brand-50 space-y-4">
        <div class="flex gap-2">
          <input type="text" id="promo-input" placeholder="Kode Promo (coba: TITIKBARU)" value="${promoCodeName}" class="flex-1 px-4 py-2.5 rounded-xl bg-white border border-brand-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase">
          <button onclick="applyPromo()" class="bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-brand-800 transition-all">Gunakan</button>
        </div>

        <div class="space-y-1.5 text-xs text-brand-600">
          <div class="flex justify-between"><span>Subtotal</span><span class="font-semibold text-brand-800">${formatRupiah(subtotal)}</span></div>${appliedDiscount > 0 ? `<div class="flex justify-between text-terracotta font-medium"><span>Diskon Promo</span><span>-${formatRupiah(subtotal * appliedDiscount)}</span></div>` : ''}
          ${currentOrderMode === 'delivery' ? `<div class="flex justify-between"><span>Biaya Kirim (Estimasi)</span><span class="font-semibold text-brand-800">${formatRupiah(deliveryFee)}</span></div>` : ''}
          <div class="flex justify-between text-base font-bold text-brand-800 pt-2 border-t border-brand-200"><span>Total Pembayaran</span><span class="text-brand-700">${formatRupiah(finalTotal)}</span></div>
        </div>

        <button onclick="checkoutWhatsApp()" class="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all text-center flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          <span>Checkout via WhatsApp</span>
        </button>
      </div>
    ` : ''}
  `;
}

function changeQuantity(cartId, delta) {
  const item = cart.find(i => i.cartId == cartId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.cartId != cartId);
  }
  updateCartUI();
  renderCartContent();
}

function applyPromo() {
  const code = document.getElementById('promo-input').value.trim().toUpperCase();
  if (code === 'TITIKBARU') {
    appliedDiscount = 0.15;
    promoCodeName = code
