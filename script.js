// WhatsApp da loja: DDI + DDD + número, apenas dígitos.
const WHATSAPP_NUMBER = "557981136035";

const FALLBACK_ORDER_OPTIONS = window.GUSTAVO_CATALOG?.orderOptions || {
  meal: {
    proteins: ["Frango", "Bisteca", "Calabresa"],
    groups: [
      { id: "rice", title: "Arroz", orderLabel: "Arroz", rule: "required-one", hint: "escolha 1", options: ["Arroz branco", "Arroz temperado"] },
      { id: "beans", title: "Feijão", orderLabel: "Feijão", rule: "optional-one", hint: "escolha no máximo 1", emptyLabel: "Sem feijão", options: ["Feijão tropeiro", "Feijão de caldo"] },
      { id: "pasta", title: "Macarrão", orderLabel: "Macarrão", rule: "optional-many", hint: "opcional", options: ["Macarrão espaguete"] },
      { id: "salad", title: "Saladas", orderLabel: "Salada", rule: "optional-one", hint: "escolha no máximo 1", emptyLabel: "Sem salada", options: ["Vinagrete", "Salada de maionese", "Salada simples (alface, tomate e cebola)"] },
      { id: "extra", title: "Extras", orderLabel: "Extra", rule: "optional-one", hint: "escolha no máximo 1", emptyLabel: "Sem extra", options: ["Purê de batata", "Legumes refogados: batata e cenoura refogadas no alho e na cebola, com uma pitada de orégano"] },
    ],
  },
  drinks: { juiceFlavors: ["Maracujá", "Goiaba", "Acerola", "Laranja"], vitaminFlavors: ["Banana", "Abacate", "Mamão"] },
};
const cloneOrderOptions = (options) => JSON.parse(JSON.stringify(options));
let orderOptions = cloneOrderOptions(FALLBACK_ORDER_OPTIONS);
const JUICE_FLAVORS = orderOptions.drinks.juiceFlavors;
const VITAMIN_FLAVORS = orderOptions.drinks.vitaminFlavors;
const ORDER_OPTIONS_PRODUCT_NAME = "__GUSTAVO_ORDER_OPTIONS__";

let products = [
  ["Pastel de Frango", "Salgados", 3, "Crocante e feito na hora", "Favorito", null, "assets/products/pastel-autoral.jpg"],
  ["Pastel de Frango com Catupiry", "Salgados", 3, "Recheio cremoso", null, null, "assets/products/pastel-autoral.jpg"],
  ["Pastel de Calabresa com Queijo", "Salgados", 3, "Sabor marcante", null, null, "assets/products/pastel-autoral.jpg"],
  ["Pastel de Queijo", "Salgados", 3, "Queijo derretendo", null, null, "assets/products/pastel-autoral.jpg"],
  ["Pastel Misto", "Salgados", 3, "Presunto e queijo", null, null, "assets/products/pastel-autoral.jpg"],
  ["Pastel de Bacon com Queijo", "Salgados", 3, "Bem recheado", null, null, "assets/products/pastel-autoral.jpg"],
  ["Pastel de Charque com Queijo", "Salgados", 3, "Sabor nordestino", null, null, "assets/products/pastel-autoral.jpg"],
  ["Pastel de Carne", "Salgados", 3, "Carne bem temperada", null, null, "assets/products/pastel-autoral.jpg"],
  ["Pastel Romeu e Julieta", "Salgados", 3, "Queijo e goiabada", null, null, "assets/products/pastel-autoral.jpg"],
  ["Coxinha de Frango", "Salgados", 3, "Massa macia e crocante", null, null, "assets/products/coxinha-autoral.jpg"],
  ["Coxinha de Carne", "Salgados", 3, "Recheio caseiro", null, null, "assets/products/coxinha-autoral.jpg"],
  ["Enroladinho de Salsicha", "Salgados", 3, "Perfeito para o lanche", null, null, "assets/products/stock-pastel.jpg"],
  ["Cachorro-Quente", "Lanches", 10, "Lanche completo", null, null, "assets/products/cachorro-quente.jpg"],
  ["Hambúrguer", "Lanches", 8, "Feito com carinho", null, null, "assets/products/hamburguer-autoral.jpg"],
  ["Eggs", "Lanches", 12, "Para matar a fome", null, null, "assets/products/hamburguer-autoral.jpg"],
  ["X-Frango", "Lanches", 13, "Frango saboroso", null, null, "assets/products/x-egg.jpg"],
  ["Misto Quente", "Lanches", 7, "Clássico e quentinho", null, null, "assets/products/stock-misto.jpg"],
  ["Pão com Ovo", "Lanches", 6, "Simples e gostoso", null, null, "assets/products/x-egg.jpg"],
  ["Sanduíche Natural", "Lanches", 6, "Leve e fresquinho", null, null, "assets/products/stock-natural.jpg"],
  ["Pão com Manteiga", "Lanches", 4, "Na chapa", null, null, "assets/products/stock-misto.jpg"],
  ["Quentinha · 1 proteína", "Quentinhas", 15, "Escolha proteína e acompanhamentos", "Almoço", { type: "meal", proteinCount: 1 }, "assets/products/quentinha-frango.jpg"],
  ["Quentinha · 2 proteínas", "Quentinhas", 20, "Escolha proteínas e acompanhamentos", null, { type: "meal", proteinCount: 2 }, "assets/products/quentinha-frango.jpg"],
  ["Quentinha · 3 proteínas", "Quentinhas", 25, "Escolha proteínas e acompanhamentos", null, { type: "meal", proteinCount: 3 }, "assets/products/quentinha-calabresa.jpg"],
  ["Suco · 400 ml", "Bebidas", 5, "Escolha seu sabor", null, { type: "flavor", flavorGroup: "juice", flavors: JUICE_FLAVORS, label: "sabor do suco" }, "assets/products/stock-juice.jpg"],
  ["Suco · 500 ml", "Bebidas", 6, "Escolha seu sabor", null, { type: "flavor", flavorGroup: "juice", flavors: JUICE_FLAVORS, label: "sabor do suco" }, "assets/products/stock-juice.jpg"],
  ["Suco · 1 litro", "Bebidas", 12, "Escolha seu sabor", null, { type: "flavor", flavorGroup: "juice", flavors: JUICE_FLAVORS, label: "sabor do suco" }, "assets/products/stock-juice.jpg"],
  ["Vitamina · 500 ml", "Bebidas", 7, "Escolha seu sabor", null, { type: "flavor", flavorGroup: "vitamin", flavors: VITAMIN_FLAVORS, label: "sabor da vitamina" }, "assets/products/stock-vitamina.jpg"],
  ["Lasanha Bolonhesa · 250 g", "Lasanhas", 10, "Carne bovina e massa artesanal", "Caseira", null, "assets/products/stock-lasanha.jpg"],
  ["Lasanha Bolonhesa · 500 g", "Lasanhas", 20, "Carne bovina e massa artesanal", null, null, "assets/products/stock-lasanha.jpg"],
  ["Lasanha Bolonhesa · 750 g", "Lasanhas", 25, "Carne bovina e massa artesanal", null, null, "assets/products/stock-lasanha.jpg"],
  ["Lasanha de Frango · 250 g", "Lasanhas", 9, "Frango e massa artesanal", null, null, "assets/products/stock-lasanha.jpg"],
  ["Lasanha de Frango · 500 g", "Lasanhas", 18, "Frango e massa artesanal", null, null, "assets/products/stock-lasanha.jpg"],
  ["Lasanha de Frango · 750 g", "Lasanhas", 23, "Frango e massa artesanal", null, null, "assets/products/stock-lasanha.jpg"],
].map(([name, category, price, detail, badge, custom, image], id) => ({ id, name, category, price, detail, badge, custom, image }));

const state = { category: "Todos", search: "", cart: [], customProduct: null, customProteinCounts: {} };
const grid = document.querySelector("[data-product-grid]");
const empty = document.querySelector("[data-empty]");
const tip = document.querySelector("[data-menu-tip]");
const layer = document.querySelector("[data-cart-layer]");
const cartItems = document.querySelector("[data-cart-items]");
const cartEmpty = document.querySelector("[data-cart-empty]");
const cartNote = document.querySelector("[data-cart-note]");
const totalRow = document.querySelector("[data-cart-total-row]");
const sendButton = document.querySelector("[data-send-order]");
const phoneNote = document.querySelector("[data-phone-note]");
const customizer = document.querySelector("[data-customizer]");
const customTitle = document.querySelector("[data-custom-title]");
const customContent = document.querySelector("[data-custom-content]");

const money = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const productById = (id) => products.find((product) => String(product.id) === String(id));
const selectedValues = (selector) => [...customizer.querySelectorAll(selector)].filter((input) => input.checked).map((input) => input.value);

function filteredProducts() {
  const text = state.search.toLocaleLowerCase("pt-BR").trim();
  return products.filter((product) => (state.category === "Todos" || product.category === state.category) && (!text || `${product.name} ${product.detail}`.toLocaleLowerCase("pt-BR").includes(text)));
}

function renderProducts() {
  const selected = filteredProducts();
  grid.innerHTML = selected.map((product) => `
    <article class="product">
      <div class="photo-slot ${product.image ? "has-photo" : ""}" data-category="${product.category}">
        ${product.image ? `<img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">` : "<span>+ foto em breve</span>"}
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
      </div>
      <div class="product-body">
        <div class="product-top"><small>${product.category}</small><b>${money(product.price)}</b></div>
        <h3>${product.name}</h3><p>${product.detail}</p>
        <button class="add ${product.custom ? "choose" : ""}" type="button" aria-label="${product.custom ? `Escolher opções de ${product.name}` : `Adicionar ${product.name}`}" ${product.custom ? `data-custom="${product.id}"` : `data-add="${product.id}"`}>
          ${product.custom ? "Escolher opções" : "Adicionar"} <span>${product.custom ? "→" : "+"}</span>
        </button>
      </div>
    </article>`).join("");
  empty.hidden = selected.length > 0;
  const tips = {
    Todos: "Todos os salgados por apenas <b>R$ 3,00</b> cada.",
    Salgados: "Todos os salgados por apenas <b>R$ 3,00</b> cada.",
    Quentinhas: "<b>Quentinha do seu jeito:</b> escolha suas proteínas e apenas os acompanhamentos que você quiser.",
    Bebidas: "Escolha o sabor dos seus sucos e vitaminas antes de adicionar ao pedido.",
  };
  tip.innerHTML = tips[state.category] || "Escolha seus favoritos e envie o pedido pelo WhatsApp.";
}

function addToCart(product, options = []) {
  const cartId = `${product.id}:${options.join("|")}`;
  const item = state.cart.find((cartItem) => cartItem.cartId === cartId);
  if (item) item.quantity += 1;
  else state.cart.push({ ...product, cartId, options, quantity: 1 });
  renderCart();
}

function changeQuantity(cartId, amount) {
  const item = state.cart.find((cartItem) => cartItem.cartId === cartId);
  if (item) item.quantity += amount;
  state.cart = state.cart.filter((cartItem) => cartItem.quantity > 0);
  renderCart();
}

function renderCart() {
  const count = state.cart.reduce((total, item) => total + item.quantity, 0);
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((element) => { element.textContent = count; });
  document.querySelectorAll("[data-cart-total]").forEach((element) => { element.textContent = money(total); });
  document.querySelector(".floating-cart").classList.toggle("is-visible", count > 0);
  cartEmpty.hidden = count > 0;
  cartNote.hidden = count === 0;
  totalRow.hidden = count === 0;
  sendButton.hidden = count === 0;
  phoneNote.hidden = count === 0 || Boolean(WHATSAPP_NUMBER);
  cartItems.innerHTML = state.cart.map((item) => `
    <div class="cart-item"><div><h3>${item.name}</h3>${item.options.length ? `<small class="cart-options">${item.options.join("<br>")}</small>` : ""}<p>${money(item.price)} cada</p>
    <div class="qty"><button type="button" data-quantity="${item.cartId}" data-amount="-1" aria-label="Remover uma unidade">−</button><b>${item.quantity}</b><button type="button" data-quantity="${item.cartId}" data-amount="1" aria-label="Adicionar uma unidade">+</button></div></div>
    <strong>${money(item.price * item.quantity)}</strong></div>`).join("");
}

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[character]));

function flavorOptionsFor(product) {
  const custom = product.custom || {};
  const group = custom.flavorGroup || (product.name.toLocaleLowerCase("pt-BR").includes("vitamina") ? "vitamin" : "juice");
  const settingsFlavors = group === "vitamin" ? orderOptions.drinks.vitaminFlavors : orderOptions.drinks.juiceFlavors;
  return settingsFlavors.length ? settingsFlavors : (custom.flavors || []);
}

function renderMealGroup(group, index) {
  if (!group.options.length) return "";
  const required = group.rule === "required-one";
  const multiple = group.rule === "optional-many";
  const inputType = multiple ? "checkbox" : "radio";
  const inputName = `meal-${group.id}`;
  const className = index > 0 ? "meal-group" : "meal-group meal-group-first";
  const emptyOption = !required && !multiple
    ? `<label><input type="radio" name="${inputName}" value="" checked><span>${escapeHtml(group.emptyLabel || "Nenhum")}</span></label>`
    : "";
  const options = group.options.map((option) => `<label><input type="${inputType}" name="${inputName}" value="${escapeHtml(option)}" data-meal-option="${group.id}"><span>${escapeHtml(option)}</span></label>`).join("");
  return `<section class="${className}" data-meal-group="${group.id}"><p class="meal-choice-label">${escapeHtml(group.title)} <small>${escapeHtml(group.hint || "opcional")}</small></p><div class="option-chips side-chips">${emptyOption}${options}</div></section>`;
}

function openCustomizer(product) {
  state.customProduct = product;
  customTitle.textContent = product.name;
  const custom = product.custom || {};
  if (custom.type === "flavor") {
    const flavors = flavorOptionsFor(product);
    if (!flavors.length) {
      customContent.innerHTML = `<p class="custom-intro">Não há sabores disponíveis no momento.</p><p class="custom-error">A loja ainda não cadastrou os sabores desta bebida.</p>`;
    } else {
      customContent.innerHTML = `<p class="custom-intro">Escolha o ${escapeHtml(custom.label || "sabor")}:</p><div class="option-chips">${flavors.map((flavor, index) => `<label><input type="radio" name="flavor" value="${escapeHtml(flavor)}" ${index === 0 ? "checked" : ""}><span>${escapeHtml(flavor)}</span></label>`).join("")}</div><p class="custom-error" data-custom-error></p><button class="confirm-custom" type="button" data-confirm-custom>Adicionar ao pedido <span>+</span></button>`;
    }
  } else {
    const meal = orderOptions.meal;
    state.customProteinCounts = Object.fromEntries(meal.proteins.map((protein) => [protein, 0]));
    customContent.innerHTML = `
      <p class="custom-intro">Escolha <b>${custom.proteinCount} ${custom.proteinCount === 1 ? "proteína" : "proteínas"}</b>. Você pode repetir a mesma opção se quiser.</p>
      <p class="option-label">Proteínas <b data-protein-counter>0 de ${custom.proteinCount}</b></p>
      <div class="protein-picker">${meal.proteins.map((protein) => `<div class="protein-line" data-protein-line="${escapeHtml(protein)}"><span>${escapeHtml(protein)}</span><div><button type="button" data-protein-change data-protein-name="${escapeHtml(protein)}" data-amount="-1" aria-label="Remover uma porção de ${escapeHtml(protein)}">−</button><b data-protein-count="${escapeHtml(protein)}">0</b><button type="button" data-protein-change data-protein-name="${escapeHtml(protein)}" data-amount="1" aria-label="Adicionar uma porção de ${escapeHtml(protein)}">+</button></div></div>`).join("")}</div>
      <p class="option-label sides-label">Acompanhamentos <small>monte como preferir</small></p>
      ${meal.groups.map(renderMealGroup).join("")}
      <p class="custom-error" data-custom-error></p><button class="confirm-custom" type="button" data-confirm-custom>Adicionar ao pedido <span>+</span></button>`;
  }
  customizer.hidden = false;
  document.body.classList.add("no-scroll");
}

function closeCustomizer() {
  customizer.hidden = true;
  state.customProduct = null;
  if (layer.hidden) document.body.classList.remove("no-scroll");
}

function updateProteinCounter() {
  const count = Object.values(state.customProteinCounts).reduce((total, quantity) => total + quantity, 0);
  const max = state.customProduct.custom.proteinCount;
  const counter = customizer.querySelector("[data-protein-counter]");
  counter.textContent = `${count} de ${max}`;
}

function changeProteinQuantity(protein, amount) {
  const current = state.customProteinCounts[protein];
  const selected = Object.values(state.customProteinCounts).reduce((total, quantity) => total + quantity, 0);
  const max = state.customProduct.custom.proteinCount;
  if ((amount < 0 && current === 0) || (amount > 0 && selected === max)) return;
  state.customProteinCounts[protein] += amount;
  const quantity = state.customProteinCounts[protein];
  customizer.querySelector(`[data-protein-count="${protein}"]`).textContent = quantity;
  customizer.querySelector(`[data-protein-line="${protein}"]`).classList.toggle("selected", quantity > 0);
  customizer.querySelector("[data-custom-error]").textContent = "";
  updateProteinCounter();
}

function showCustomizerError(message) {
  customizer.querySelector("[data-custom-error]").textContent = message;
}

function databaseProductToCatalog(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    detail: product.description || "",
    badge: product.badge || null,
    custom: product.custom_config || null,
    image: product.image_url || null,
  };
}

async function loadCatalogFromSupabase() {
  if (!window.supabaseClient) return;
  const { data, error } = await window.supabaseClient
    .from("products")
    .select("id, name, category, price, description, badge, custom_config, image_url")
    .eq("available", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.warn("Não foi possível carregar o cardápio online.", error.message);
    return;
  }
  const orderOptionsProduct = data.find((product) => product.name === ORDER_OPTIONS_PRODUCT_NAME);
  applySavedOrderOptions(orderOptionsProduct?.custom_config?.orderOptions);
  const catalogProducts = data.filter((product) => product.name !== ORDER_OPTIONS_PRODUCT_NAME);
  if (!catalogProducts.length) return;
  products = catalogProducts.map(databaseProductToCatalog);
  renderProducts();
}

function applySavedOrderOptions(saved) {
  if (!saved) return;
  const fallback = cloneOrderOptions(FALLBACK_ORDER_OPTIONS);
  const savedGroups = Array.isArray(saved?.meal?.groups) ? saved.meal.groups : [];
  orderOptions = {
    meal: {
      proteins: Array.isArray(saved?.meal?.proteins) && saved.meal.proteins.length ? saved.meal.proteins : fallback.meal.proteins,
      groups: fallback.meal.groups.map((group) => {
        const savedGroup = savedGroups.find((item) => item.id === group.id);
        return { ...group, options: Array.isArray(savedGroup?.options) ? savedGroup.options : group.options };
      }),
    },
    drinks: {
      juiceFlavors: Array.isArray(saved?.drinks?.juiceFlavors) ? saved.drinks.juiceFlavors : fallback.drinks.juiceFlavors,
      vitaminFlavors: Array.isArray(saved?.drinks?.vitaminFlavors) ? saved.drinks.vitaminFlavors : fallback.drinks.vitaminFlavors,
    },
  };
}

document.querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => {
  state.category = button.dataset.category;
  document.querySelectorAll("[data-category]").forEach((item) => item.classList.toggle("active", item === button));
  renderProducts();
}));
document.querySelector("[data-search]").addEventListener("input", (event) => { state.search = event.target.value; renderProducts(); });
grid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button?.dataset.add) addToCart(productById(button.dataset.add));
  if (button?.dataset.custom) openCustomizer(productById(button.dataset.custom));
});
cartItems.addEventListener("click", (event) => { const button = event.target.closest("[data-quantity]"); if (button) changeQuantity(button.dataset.quantity, Number(button.dataset.amount)); });
document.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", () => { layer.hidden = false; document.body.classList.add("no-scroll"); }));
document.querySelectorAll("[data-close-cart]").forEach((button) => button.addEventListener("click", () => { layer.hidden = true; if (customizer.hidden) document.body.classList.remove("no-scroll"); }));
document.querySelectorAll("[data-close-customizer]").forEach((button) => button.addEventListener("click", closeCustomizer));

customizer.addEventListener("click", (event) => {
  const proteinButton = event.target.closest("[data-protein-change]");
  if (proteinButton) {
    changeProteinQuantity(proteinButton.dataset.proteinName, Number(proteinButton.dataset.amount));
    return;
  }
  const button = event.target.closest("[data-confirm-custom]");
  if (!button) return;
  const product = state.customProduct;
  if (product.custom.type === "flavor") {
    const flavor = customizer.querySelector("input[name=flavor]:checked")?.value;
    if (!flavor) return;
    addToCart(product, [`Sabor: ${flavor}`]);
  } else {
    const proteins = Object.entries(state.customProteinCounts).filter(([, quantity]) => quantity > 0);
    const max = product.custom.proteinCount;
    const proteinCount = proteins.reduce((total, [, quantity]) => total + quantity, 0);
    if (proteinCount !== max) {
      showCustomizerError(`Escolha exatamente ${max} ${max === 1 ? "proteína" : "proteínas"}.`);
      return;
    }
    const selectedGroups = [];
    for (const group of orderOptions.meal.groups) {
      const values = [...customizer.querySelectorAll(`[data-meal-option="${group.id}"]:checked`)].map((input) => input.value).filter(Boolean);
      if (group.rule === "required-one" && values.length !== 1) {
        showCustomizerError(`Escolha uma opção de ${group.title.toLocaleLowerCase("pt-BR")}.`);
        return;
      }
      if (values.length) selectedGroups.push(`${group.orderLabel}: ${values.join(", ")}`);
    }
    const options = [
      `Proteína${max > 1 ? "s" : ""}: ${proteins.map(([protein, quantity]) => `${quantity}x ${protein}`).join(", ")}`,
      ...selectedGroups,
    ];
    addToCart(product, options);
  }
  closeCustomizer();
});

sendButton.addEventListener("click", () => {
  const note = document.querySelector("[data-note]").value.trim();
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const categories = [
    ["Salgados", "*SALGADOS*"],
    ["Lanches", "*LANCHES*"],
    ["Quentinhas", "*QUENTINHAS*"],
    ["Bebidas", "*BEBIDAS*"],
    ["Lasanhas", "*LASANHAS*"],
  ];
  const messageLines = ["Olá! Gostaria de fazer este pedido:", ""];
  categories.forEach(([category, title]) => {
    const items = state.cart.filter((item) => item.category === category);
    if (!items.length) return;
    messageLines.push(title);
    items.forEach((item) => {
      messageLines.push(`- ${item.quantity}x *${item.name}* - ${money(item.price * item.quantity)}`);
      item.options.forEach((option) => messageLines.push(`  - ${option}`));
    });
    messageLines.push("");
  });
  if (note) messageLines.push("*OBSERVAÇÕES*", note, "");
  messageLines.push(`*TOTAL: ${money(total)}*`, "", "Pode me confirmar, por favor?");
  const message = messageLines.join("\n");
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

renderProducts();
renderCart();
loadCatalogFromSupabase();
