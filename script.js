// WhatsApp da loja: DDI + DDD + número, apenas dígitos.
const WHATSAPP_NUMBER = "557981136035";

// Estas são as proteínas que aparecem no cardápio atual. Edite aqui quando o cardápio do dia mudar.
const PROTEIN_OPTIONS = ["Frango", "Bisteca", "Calabresa"];
const RICE_OPTIONS = ["Arroz branco", "Arroz temperado"];
const BEAN_OPTIONS = ["Feijão tropeiro", "Feijão de caldo"];
const PASTA_OPTIONS = ["Macarrão espaguete"];
const SALAD_OPTIONS = ["Vinagrete", "Salada de maionese", "Salada simples (alface, tomate e cebola)"];
const EXTRA_OPTIONS = [
  { label: "Purê de batata", value: "Purê de batata" },
  { label: "Legumes refogados", value: "Legumes: batata e cenoura refogadas no alho e na cebola, com uma pitada de orégano" },
];
const JUICE_FLAVORS = ["Maracujá", "Goiaba", "Acerola", "Laranja"];
const VITAMIN_FLAVORS = ["Banana", "Abacate", "Mamão"];

const products = [
  ["Pastel de Frango", "Salgados", 3, "Crocante e feito na hora", "Favorito"],
  ["Pastel de Frango com Catupiry", "Salgados", 3, "Recheio cremoso"],
  ["Pastel de Calabresa com Queijo", "Salgados", 3, "Sabor marcante"],
  ["Pastel de Queijo", "Salgados", 3, "Queijo derretendo"],
  ["Pastel Misto", "Salgados", 3, "Presunto e queijo"],
  ["Pastel de Bacon com Queijo", "Salgados", 3, "Bem recheado"],
  ["Pastel de Charque com Queijo", "Salgados", 3, "Sabor nordestino"],
  ["Pastel de Carne", "Salgados", 3, "Carne bem temperada"],
  ["Pastel Romeu e Julieta", "Salgados", 3, "Queijo e goiabada"],
  ["Coxinha de Frango", "Salgados", 3, "Massa macia e crocante"],
  ["Coxinha de Carne", "Salgados", 3, "Recheio caseiro"],
  ["Enroladinho de Salsicha", "Salgados", 3, "Perfeito para o lanche"],
  ["Cachorro-Quente", "Lanches", 10, "Lanche completo"],
  ["Hambúrguer", "Lanches", 8, "Feito com carinho"],
  ["Eggs", "Lanches", 12, "Para matar a fome"],
  ["X-Frango", "Lanches", 13, "Frango saboroso"],
  ["Misto Quente", "Lanches", 7, "Clássico e quentinho"],
  ["Pão com Ovo", "Lanches", 6, "Simples e gostoso"],
  ["Sanduíche Natural", "Lanches", 6, "Leve e fresquinho"],
  ["Pão com Manteiga", "Lanches", 4, "Na chapa"],
  ["Quentinha · 1 proteína", "Quentinhas", 15, "Escolha proteína e acompanhamentos", "Almoço", { type: "meal", proteinCount: 1 }],
  ["Quentinha · 2 proteínas", "Quentinhas", 20, "Escolha proteínas e acompanhamentos", null, { type: "meal", proteinCount: 2 }],
  ["Quentinha · 3 proteínas", "Quentinhas", 25, "Escolha proteínas e acompanhamentos", null, { type: "meal", proteinCount: 3 }],
  ["Suco · 400 ml", "Bebidas", 5, "Escolha seu sabor", null, { type: "flavor", flavors: JUICE_FLAVORS, label: "sabor do suco" }],
  ["Suco · 500 ml", "Bebidas", 6, "Escolha seu sabor", null, { type: "flavor", flavors: JUICE_FLAVORS, label: "sabor do suco" }],
  ["Suco · 1 litro", "Bebidas", 12, "Escolha seu sabor", null, { type: "flavor", flavors: JUICE_FLAVORS, label: "sabor do suco" }],
  ["Vitamina · 500 ml", "Bebidas", 7, "Escolha seu sabor", null, { type: "flavor", flavors: VITAMIN_FLAVORS, label: "sabor da vitamina" }],
  ["Lasanha Bolonhesa · 250 g", "Lasanhas", 10, "Carne bovina e massa artesanal", "Caseira"],
  ["Lasanha Bolonhesa · 500 g", "Lasanhas", 20, "Carne bovina e massa artesanal"],
  ["Lasanha Bolonhesa · 750 g", "Lasanhas", 25, "Carne bovina e massa artesanal"],
  ["Lasanha de Frango · 250 g", "Lasanhas", 9, "Frango e massa artesanal"],
  ["Lasanha de Frango · 500 g", "Lasanhas", 18, "Frango e massa artesanal"],
  ["Lasanha de Frango · 750 g", "Lasanhas", 23, "Frango e massa artesanal"],
].map(([name, category, price, detail, badge, custom], id) => ({ id, name, category, price, detail, badge, custom }));

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
const productById = (id) => products.find((product) => product.id === Number(id));
const selectedValues = (selector) => [...customizer.querySelectorAll(selector)].filter((input) => input.checked).map((input) => input.value);

function filteredProducts() {
  const text = state.search.toLocaleLowerCase("pt-BR").trim();
  return products.filter((product) => (state.category === "Todos" || product.category === state.category) && (!text || `${product.name} ${product.detail}`.toLocaleLowerCase("pt-BR").includes(text)));
}

function renderProducts() {
  const selected = filteredProducts();
  grid.innerHTML = selected.map((product) => `
    <article class="product">
      <div class="photo-slot" data-category="${product.category}">
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
        <span>+ foto em breve</span>
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

function openCustomizer(product) {
  state.customProduct = product;
  customTitle.textContent = product.name;
  const custom = product.custom;
  if (custom.type === "flavor") {
    customContent.innerHTML = `<p class="custom-intro">Escolha o ${custom.label}:</p><div class="option-chips">${custom.flavors.map((flavor, index) => `<label><input type="radio" name="flavor" value="${flavor}" ${index === 0 ? "checked" : ""}><span>${flavor}</span></label>`).join("")}</div><p class="custom-error" data-custom-error></p><button class="confirm-custom" type="button" data-confirm-custom>Adicionar ao pedido <span>+</span></button>`;
  } else {
    state.customProteinCounts = Object.fromEntries(PROTEIN_OPTIONS.map((protein) => [protein, 0]));
    customContent.innerHTML = `
      <p class="custom-intro">Escolha <b>${custom.proteinCount} ${custom.proteinCount === 1 ? "proteína" : "proteínas"}</b>. Você pode repetir a mesma opção se quiser.</p>
      <p class="option-label">Proteínas <b data-protein-counter>0 de ${custom.proteinCount}</b></p>
      <div class="protein-picker">${PROTEIN_OPTIONS.map((protein) => `<div class="protein-line" data-protein-line="${protein}"><span>${protein}</span><div><button type="button" data-protein-change data-protein-name="${protein}" data-amount="-1" aria-label="Remover uma porção de ${protein}">−</button><b data-protein-count="${protein}">0</b><button type="button" data-protein-change data-protein-name="${protein}" data-amount="1" aria-label="Adicionar uma porção de ${protein}">+</button></div></div>`).join("")}</div>
      <section class="meal-group">
        <p class="option-label sides-label">Guarnições <small>monte como preferir</small></p>
        <p class="meal-choice-label">Arroz <b>escolha 1</b></p>
        <div class="option-chips">${RICE_OPTIONS.map((rice) => `<label><input type="radio" name="rice" value="${rice}"><span>${rice}</span></label>`).join("")}</div>
        <p class="meal-choice-label">Feijão <small>escolha no máximo 1</small></p>
        <div class="option-chips side-chips">${["Nenhum", ...BEAN_OPTIONS].map((bean, index) => `<label><input type="radio" name="beans" value="${bean}" ${index === 0 ? "checked" : ""}><span>${bean === "Nenhum" ? "Sem feijão" : bean}</span></label>`).join("")}</div>
        <p class="meal-choice-label">Macarrão <small>opcional</small></p>
        <div class="option-chips side-chips">${PASTA_OPTIONS.map((pasta) => `<label><input type="checkbox" data-pasta value="${pasta}"><span>${pasta}</span></label>`).join("")}</div>
      </section>
      <section class="meal-group">
        <p class="option-label sides-label">Saladas <small>escolha no máximo 1</small></p>
        <div class="option-chips side-chips">${["Nenhuma", ...SALAD_OPTIONS].map((salad, index) => `<label><input type="radio" name="salad" value="${salad}" ${index === 0 ? "checked" : ""}><span>${salad === "Nenhuma" ? "Sem salada" : salad}</span></label>`).join("")}</div>
      </section>
      <section class="meal-group">
        <p class="option-label sides-label">Extras <small>escolha no máximo 1</small></p>
        <div class="option-chips side-chips">${[{ label: "Sem extra", value: "Nenhum" }, ...EXTRA_OPTIONS].map((extra, index) => `<label><input type="radio" name="extra" value="${extra.value}" ${index === 0 ? "checked" : ""}><span>${extra.label}</span></label>`).join("")}</div>
      </section>
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
    const flavor = customizer.querySelector("input[name=flavor]:checked").value;
    addToCart(product, [`Sabor: ${flavor}`]);
  } else {
    const proteins = Object.entries(state.customProteinCounts).filter(([, quantity]) => quantity > 0);
    const max = product.custom.proteinCount;
    const proteinCount = proteins.reduce((total, [, quantity]) => total + quantity, 0);
    if (proteinCount !== max) {
      showCustomizerError(`Escolha exatamente ${max} ${max === 1 ? "proteína" : "proteínas"}.`);
      return;
    }
    const rice = customizer.querySelector("input[name=rice]:checked")?.value;
    if (!rice) {
      showCustomizerError("Escolha arroz branco ou arroz temperado.");
      return;
    }
    const beans = customizer.querySelector("input[name=beans]:checked")?.value;
    const pasta = selectedValues("[data-pasta]");
    const salad = customizer.querySelector("input[name=salad]:checked")?.value;
    const extra = customizer.querySelector("input[name=extra]:checked")?.value;
    const options = [
      `Proteína${max > 1 ? "s" : ""}: ${proteins.map(([protein, quantity]) => `${quantity}x ${protein}`).join(", ")}`,
      `Arroz: ${rice}`,
      beans !== "Nenhum" ? `Feijão: ${beans}` : "",
      pasta.length ? `Macarrão: ${pasta.join(", ")}` : "",
      salad !== "Nenhuma" ? `Salada: ${salad}` : "",
      extra !== "Nenhum" ? `Extra: ${extra}` : "",
    ].filter(Boolean);
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
