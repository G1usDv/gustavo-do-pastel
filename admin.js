const supabaseClient = window.supabaseClient;
const state = { products: [], search: "", category: "Todos", orderOptions: null, orders: [], orderFilter: "all" };
const loginScreen = document.querySelector("[data-login-screen]");
const resetScreen = document.querySelector("[data-reset-screen]");
const dashboard = document.querySelector("[data-dashboard]");
const loginForm = document.querySelector("[data-login-form]");
const resetForm = document.querySelector("[data-reset-form]");
const loginStatus = document.querySelector("[data-login-status]");
const resetStatus = document.querySelector("[data-reset-status]");
const panelStatus = document.querySelector("[data-panel-status]");
const productGrid = document.querySelector("[data-admin-products]");
const emptyState = document.querySelector("[data-admin-empty]");
const importButton = document.querySelector("[data-import-catalog]");
const categoryOptions = ["Salgados", "Lanches", "Quentinhas", "Bebidas", "Lasanhas"];
const orderOptionsForm = document.querySelector("[data-order-options-form]");
const orderOptionsStatus = document.querySelector("[data-options-status]");
const ordersList = document.querySelector("[data-orders-list]");
const ordersEmpty = document.querySelector("[data-orders-empty]");
const ordersStatus = document.querySelector("[data-orders-status]");
const ordersWeek = document.querySelector("[data-orders-week]");
const orderFilter = document.querySelector("[data-order-filter]");
let orderRefreshTimer;
const defaultOrderOptions = () => JSON.parse(JSON.stringify(window.GUSTAVO_CATALOG.orderOptions));
const ORDER_OPTIONS_PRODUCT_NAME = "__GUSTAVO_ORDER_OPTIONS__";
const ORDER_STATUS = {
  pending: { label: "Pendente", className: "pending" },
  completed: { label: "Concluído", className: "completed" },
  not_completed: { label: "Não concluído", className: "not-completed" },
};

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[character]));
const moneyInput = (value) => Number(value || 0).toFixed(2).replace(".", ",");
const productIsNew = (product) => String(product.id).startsWith("new-");
const productForDatabase = (product, index) => ({
  name: product.name.trim(),
  category: product.category,
  price: Number(product.price),
  description: product.detail.trim(),
  badge: product.badge || null,
  custom_config: product.custom_config || product.custom || null,
  image_url: product.image_url || product.image || null,
  available: Boolean(product.available),
  sort_order: Number.isFinite(product.sort_order) ? product.sort_order : index,
});

function setPanelStatus(message = "", isError = false) {
  panelStatus.textContent = message;
  panelStatus.style.color = isError ? "#b23e29" : "#258b48";
}

function setOptionsStatus(message = "", isError = false) {
  orderOptionsStatus.textContent = message;
  orderOptionsStatus.style.color = isError ? "#b23e29" : "#258b48";
}

function cleanOptionLines(value) {
  const seen = new Set();
  return String(value || "").split(/\r?\n/).map((line) => line.trim()).filter((line) => {
    const key = line.toLocaleLowerCase("pt-BR");
    if (!line || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normaliseOrderOptions(value) {
  const fallback = defaultOrderOptions();
  const savedGroups = Array.isArray(value?.meal?.groups) ? value.meal.groups : [];
  return {
    meal: {
      proteins: Array.isArray(value?.meal?.proteins) && value.meal.proteins.length ? value.meal.proteins : fallback.meal.proteins,
      groups: fallback.meal.groups.map((group) => {
        const savedGroup = savedGroups.find((item) => item.id === group.id);
        return { ...group, options: Array.isArray(savedGroup?.options) ? savedGroup.options : group.options };
      }),
    },
    drinks: {
      juiceFlavors: Array.isArray(value?.drinks?.juiceFlavors) ? value.drinks.juiceFlavors : fallback.drinks.juiceFlavors,
      vitaminFlavors: Array.isArray(value?.drinks?.vitaminFlavors) ? value.drinks.vitaminFlavors : fallback.drinks.vitaminFlavors,
    },
  };
}

function writeOrderOptionsToForm() {
  const options = state.orderOptions || defaultOrderOptions();
  const fieldForGroup = { rice: "[data-option-rice]", beans: "[data-option-beans]", pasta: "[data-option-pasta]", salad: "[data-option-salad]", extra: "[data-option-extra]" };
  document.querySelector("[data-option-proteins]").value = options.meal.proteins.join("\n");
  options.meal.groups.forEach((group) => {
    const field = document.querySelector(fieldForGroup[group.id]);
    if (field) field.value = group.options.join("\n");
  });
  document.querySelector("[data-option-juice]").value = options.drinks.juiceFlavors.join("\n");
  document.querySelector("[data-option-vitamin]").value = options.drinks.vitaminFlavors.join("\n");
}

function readOrderOptionsFromForm() {
  const options = defaultOrderOptions();
  const fieldForGroup = { rice: "[data-option-rice]", beans: "[data-option-beans]", pasta: "[data-option-pasta]", salad: "[data-option-salad]", extra: "[data-option-extra]" };
  options.meal.proteins = cleanOptionLines(document.querySelector("[data-option-proteins]").value);
  options.meal.groups.forEach((group) => { group.options = cleanOptionLines(document.querySelector(fieldForGroup[group.id]).value); });
  options.drinks.juiceFlavors = cleanOptionLines(document.querySelector("[data-option-juice]").value);
  options.drinks.vitaminFlavors = cleanOptionLines(document.querySelector("[data-option-vitamin]").value);
  return options;
}

async function saveOrderOptions() {
  const options = readOrderOptionsFromForm();
  const rice = options.meal.groups.find((group) => group.id === "rice");
  if (!options.meal.proteins.length || !rice.options.length) {
    setOptionsStatus("Preencha pelo menos uma proteína e uma opção de arroz.", true);
    return;
  }
  const button = orderOptionsForm.querySelector("button[type=submit]");
  button.disabled = true;
  button.textContent = "Salvando opções...";
  setOptionsStatus("");
  const configuration = { type: "order-options", orderOptions: options };
  let error;
  if (state.orderOptionsProductId) {
    ({ error } = await supabaseClient.from("products").update({ custom_config: configuration }).eq("id", state.orderOptionsProductId));
  } else {
    ({ error } = await supabaseClient.from("products").insert({
      name: ORDER_OPTIONS_PRODUCT_NAME,
      category: "Configuração interna",
      price: 0,
      description: "Opções editáveis de quentinha e bebidas.",
      custom_config: configuration,
      available: true,
      sort_order: 999999,
    }));
  }
  button.disabled = false;
  button.textContent = "Salvar opções da quentinha e bebidas";
  if (error) {
    setOptionsStatus("Não foi possível salvar agora. Tente novamente.", true);
    return;
  }
  state.orderOptions = options;
  writeOrderOptionsToForm();
  await loadProducts();
  setOptionsStatus("Pronto! As opções já foram atualizadas no site.");
}

function filteredProducts() {
  const query = state.search.toLocaleLowerCase("pt-BR").trim();
  return state.products.filter((product) => (
    (state.category === "Todos" || product.category === state.category)
    && (!query || `${product.name} ${product.detail || product.description || ""}`.toLocaleLowerCase("pt-BR").includes(query))
  ));
}

function renderProducts() {
  const products = filteredProducts();
  productGrid.innerHTML = products.map((product) => {
    const id = escapeHtml(product.id);
    const image = product.image_url || product.image || "";
    const detail = product.detail ?? product.description ?? "";
    const isAvailable = product.available !== false;
    const categoryChoices = categoryOptions.map((category) => `<option ${product.category === category ? "selected" : ""}>${category}</option>`).join("");
    return `
      <article class="editor-card ${isAvailable ? "" : "is-unavailable"}" data-editor-id="${id}">
        <div class="editor-top">
          <div class="editor-photo">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}">` : "<span>Sem foto</span>"}</div>
          <div class="editor-summary"><small>${escapeHtml(product.category)}</small><h2>${escapeHtml(product.name || "Novo produto")}</h2><p>${isAvailable ? "Visível no cardápio" : "Não aparece para os clientes"}</p></div>
          <label class="availability"><input type="checkbox" data-available ${isAvailable ? "checked" : ""} ${productIsNew(product) ? "disabled" : ""}> Disponível</label>
        </div>
        <div class="editor-body">
          <div class="editor-fields">
            <label class="wide">Nome do produto<input required data-name value="${escapeHtml(product.name)}" placeholder="Ex.: Pastel de frango"></label>
            <label>Preço (R$)<input required inputmode="decimal" data-price value="${moneyInput(product.price)}" placeholder="0,00"></label>
            <label>Categoria<select data-category>${categoryChoices}</select></label>
            <label class="wide">Descrição curta<textarea data-detail placeholder="Ex.: Crocante e feito na hora">${escapeHtml(detail)}</textarea></label>
          </div>
          <div class="photo-picker"><p>Trocar foto</p><input type="file" accept="image/jpeg,image/png,image/webp" data-photo></div>
          <div class="editor-footer"><button class="save-product" type="button" data-save>Salvar alterações</button><button class="delete-product" type="button" data-delete>${productIsNew(product) ? "Cancelar" : "Excluir"}</button></div>
        </div>
      </article>`;
  }).join("");
  emptyState.hidden = products.length > 0;
  importButton.hidden = state.products.length > 0;
}

async function loadProducts() {
  setPanelStatus("Carregando cardápio...");
  const { data, error } = await supabaseClient.from("products").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  if (error) {
    setPanelStatus("Não foi possível abrir o cardápio. Confira a configuração do Supabase e o e-mail de administradora.", true);
    return;
  }
  const orderOptionsProduct = data.find((product) => product.name === ORDER_OPTIONS_PRODUCT_NAME);
  state.orderOptionsProductId = orderOptionsProduct?.id || null;
  state.orderOptions = normaliseOrderOptions(orderOptionsProduct?.custom_config?.orderOptions);
  state.products = data.filter((product) => product.name !== ORDER_OPTIONS_PRODUCT_NAME).map((product) => ({ ...product, detail: product.description || "", image: product.image_url || "", available: product.available !== false }));
  writeOrderOptionsToForm();
  setPanelStatus("");
  renderProducts();
}

function setOrdersStatus(message = "", isError = false) {
  ordersStatus.textContent = message;
  ordersStatus.style.color = isError ? "#b23e29" : "#68665d";
}

function orderNumber(order) {
  return `#${String(order?.id || 0).padStart(4, "0")}`;
}

function orderDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function currentWeekBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

function renderWeeklySummary() {
  const { start, end } = currentWeekBounds();
  const completed = state.orders.filter((order) => order.status === "completed" && new Date(order.created_at) >= start && new Date(order.created_at) < end);
  const completedTotal = completed.reduce((total, order) => total + Number(order.total), 0);
  const pending = state.orders.filter((order) => order.status === "pending");
  const dayFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
  ordersWeek.textContent = `Resumo de ${dayFormatter.format(start)} até ${dayFormatter.format(new Date(end.getTime() - 1))}. Pedidos antigos continuam guardados para consulta.`;
  document.querySelector("[data-week-completed-count]").textContent = completed.length;
  document.querySelector("[data-week-completed-total]").textContent = money(completedTotal);
  document.querySelector("[data-pending-count]").textContent = pending.length;
}

function orderItemMarkup(item) {
  const quantity = Number(item.quantity) || 1;
  const total = Number(item.subtotal ?? (Number(item.unit_price) || 0) * quantity);
  const options = Array.isArray(item.options) ? item.options.filter(Boolean) : [];
  return `<li><b>${quantity}x ${escapeHtml(item.name || "Item")}</b> — ${money(total)}${options.length ? `<small>${options.map(escapeHtml).join(" · ")}</small>` : ""}</li>`;
}

function renderOrders() {
  renderWeeklySummary();
  const orders = state.orderFilter === "all" ? state.orders : state.orders.filter((order) => order.status === state.orderFilter);
  ordersList.innerHTML = orders.map((order) => {
    const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
    const items = Array.isArray(order.items) ? order.items : [];
    const actions = order.status === "pending"
      ? `<div class="order-actions"><button class="complete-order" type="button" data-order-action="completed" data-order-id="${order.id}">Concluir</button><button class="cancel-order" type="button" data-order-action="not_completed" data-order-id="${order.id}">Não concluído</button></div>`
      : `<div class="order-actions"><button class="restore-order" type="button" data-order-action="pending" data-order-id="${order.id}">Voltar para pendente</button></div>`;
    return `<article class="order-row">
      <div class="order-row-main">
        <div class="order-meta"><b class="order-code">${orderNumber(order)}</b><span class="order-status-badge ${status.className}">${status.label}</span><span class="order-date">feito em ${orderDate(order.created_at)}</span></div>
        <ul class="order-items">${items.map(orderItemMarkup).join("") || "<li>Itens não informados.</li>"}</ul>
        ${order.note ? `<p class="order-note"><b>Observação:</b> ${escapeHtml(order.note)}</p>` : ""}
      </div>
      <div class="order-row-side"><b class="order-total">${money(Number(order.total))}</b>${actions}</div>
    </article>`;
  }).join("");
  ordersEmpty.hidden = orders.length > 0;
}

async function loadOrders(showStatus = true) {
  if (!supabaseClient) return;
  if (showStatus) setOrdersStatus("Carregando pedidos...");
  const { data, error } = await supabaseClient.from("orders").select("*").order("created_at", { ascending: false }).limit(120);
  if (error) {
    setOrdersStatus("Não foi possível carregar os pedidos. Confira se a configuração foi concluída no Supabase.", true);
    return;
  }
  state.orders = data || [];
  renderOrders();
  setOrdersStatus(state.orders.length ? "" : "Ainda não há pedidos registrados.");
}

async function updateOrderStatus(id, status) {
  const labels = { pending: "pendente", completed: "concluído", not_completed: "não concluído" };
  if (status === "not_completed" && !window.confirm("Marcar este pedido como não concluído? Você poderá desfazer depois.")) return;
  setOrdersStatus("Salvando status do pedido...");
  const { error } = await supabaseClient.from("orders").update({
    status,
    completed_at: status === "completed" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) {
    setOrdersStatus("Não foi possível alterar este pedido agora.", true);
    return;
  }
  await loadOrders(false);
  setOrdersStatus(`Pedido ${labels[status]} com sucesso.`);
}

async function uploadPhoto(file, productName) {
  if (!file) return null;
  if (file.size > 8 * 1024 * 1024) throw new Error("A foto é grande demais. Escolha uma imagem de até 8 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = productName.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "produto";
  const path = `produtos/${Date.now()}-${safeName}.${extension}`;
  const { error } = await supabaseClient.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return supabaseClient.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

async function saveProduct(card) {
  const id = card.dataset.editorId;
  const product = state.products.find((item) => String(item.id) === id);
  if (!product) return;
  const name = card.querySelector("[data-name]").value.trim();
  const typedPrice = card.querySelector("[data-price]").value.trim();
  const rawPrice = typedPrice.includes(",") ? typedPrice.replace(/\./g, "").replace(",", ".") : typedPrice;
  const price = Number(rawPrice);
  if (!name || !Number.isFinite(price) || price < 0) {
    setPanelStatus("Preencha o nome e um preço válido antes de salvar.", true);
    return;
  }
  const button = card.querySelector("[data-save]");
  button.disabled = true;
  button.textContent = "Salvando...";
  try {
    product.name = name;
    product.price = price;
    product.category = card.querySelector("[data-category]").value;
    product.detail = card.querySelector("[data-detail]").value.trim();
    const selectedPhoto = card.querySelector("[data-photo]").files[0];
    if (selectedPhoto) product.image_url = await uploadPhoto(selectedPhoto, name);
    const payload = productForDatabase(product, state.products.indexOf(product));
    let error;
    if (productIsNew(product)) {
      ({ error } = await supabaseClient.from("products").insert(payload));
    } else {
      ({ error } = await supabaseClient.from("products").update(payload).eq("id", product.id));
    }
    if (error) throw error;
    setPanelStatus(`“${name}” foi salvo.`);
    await loadProducts();
  } catch (error) {
    setPanelStatus(error.message || "Não foi possível salvar o produto.", true);
  } finally {
    button.disabled = false;
    button.textContent = "Salvar alterações";
  }
}

async function toggleAvailability(card) {
  const product = state.products.find((item) => String(item.id) === card.dataset.editorId);
  if (!product || productIsNew(product)) return;
  const available = card.querySelector("[data-available]").checked;
  const { error } = await supabaseClient.from("products").update({ available }).eq("id", product.id);
  if (error) {
    card.querySelector("[data-available]").checked = !available;
    setPanelStatus("Não foi possível mudar a disponibilidade.", true);
    return;
  }
  product.available = available;
  setPanelStatus(available ? `“${product.name}” voltou para o cardápio.` : `“${product.name}” foi escondido do cardápio.`);
  renderProducts();
}

async function deleteProduct(card) {
  const product = state.products.find((item) => String(item.id) === card.dataset.editorId);
  if (!product) return;
  if (productIsNew(product)) {
    state.products = state.products.filter((item) => item !== product);
    renderProducts();
    return;
  }
  if (!window.confirm(`Excluir “${product.name}” do cardápio?`)) return;
  const { error } = await supabaseClient.from("products").delete().eq("id", product.id);
  if (error) {
    setPanelStatus("Não foi possível excluir este produto.", true);
    return;
  }
  setPanelStatus(`“${product.name}” foi excluído.`);
  await loadProducts();
}

function addProduct() {
  state.products.unshift({ id: `new-${Date.now()}`, name: "", category: "Salgados", price: 0, detail: "", badge: null, custom_config: null, image_url: "", available: true, sort_order: -1 });
  renderProducts();
  productGrid.querySelector("[data-name]")?.focus();
}

async function importCurrentCatalog() {
  if (!window.confirm("Importar os 33 produtos atuais para que você possa editá-los por aqui?")) return;
  importButton.disabled = true;
  importButton.textContent = "Importando...";
  const rows = window.GUSTAVO_CATALOG.products.map((product, index) => productForDatabase({ ...product, image_url: product.image, detail: product.detail, available: true }, index));
  const { error } = await supabaseClient.from("products").insert(rows);
  if (error) {
    setPanelStatus("Não foi possível importar o cardápio. " + error.message, true);
    importButton.disabled = false;
    importButton.textContent = "Importar cardápio atual";
    return;
  }
  setPanelStatus("Cardápio atual importado. Agora você pode editar tudo por aqui.");
  await loadProducts();
}

async function showDashboard() {
  loginScreen.hidden = true;
  resetScreen.hidden = true;
  dashboard.hidden = false;
  await Promise.all([loadProducts(), loadOrders()]);
  if (!orderRefreshTimer) orderRefreshTimer = window.setInterval(() => { loadOrders(false); }, 30000);
}

function isPasswordRecovery() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return search.get("type") === "recovery" || hash.get("type") === "recovery";
}

function showResetScreen() {
  loginScreen.hidden = true;
  dashboard.hidden = true;
  resetScreen.hidden = false;
}

if (!supabaseClient) {
  loginStatus.textContent = "A conexão com o Supabase ainda não foi configurada.";
} else {
  if (isPasswordRecovery()) supabaseClient.auth.getSession().then(showResetScreen);
  else supabaseClient.auth.getSession().then(({ data }) => { if (data.session) showDashboard(); });
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient) return;
  loginStatus.textContent = "Entrando...";
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: document.querySelector("[data-login-email]").value.trim(),
    password: document.querySelector("[data-login-password]").value,
  });
  if (error) { loginStatus.textContent = "E-mail ou senha inválidos."; return; }
  loginStatus.textContent = "";
  showDashboard();
});

document.querySelector("[data-forgot-password]").addEventListener("click", async () => {
  if (!supabaseClient) return;
  const email = document.querySelector("[data-login-email]").value.trim();
  if (!email) {
    loginStatus.textContent = "Informe seu e-mail acima para receber o link de recuperação.";
    document.querySelector("[data-login-email]").focus();
    return;
  }
  loginStatus.textContent = "Enviando link de recuperação...";
  const redirectTo = new URL("admin.html", window.location.href).href;
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
  loginStatus.textContent = error ? "Não foi possível enviar o link agora. Tente novamente." : "Pronto! Confira seu e-mail para criar uma nova senha.";
});

resetForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabaseClient) return;
  const password = document.querySelector("[data-new-password]").value;
  const confirmation = document.querySelector("[data-confirm-password]").value;
  if (password !== confirmation) { resetStatus.textContent = "As duas senhas precisam ser iguais."; return; }
  resetStatus.textContent = "Salvando nova senha...";
  const { error } = await supabaseClient.auth.updateUser({ password });
  if (error) { resetStatus.textContent = "O link expirou. Peça outro link de recuperação."; return; }
  history.replaceState({}, document.title, "admin.html");
  resetStatus.textContent = "Senha alterada com sucesso.";
  showDashboard();
});

document.querySelector("[data-product-search]").addEventListener("input", (event) => { state.search = event.target.value; renderProducts(); });
document.querySelector("[data-category-filter]").addEventListener("change", (event) => { state.category = event.target.value; renderProducts(); });
document.querySelector("[data-new-product]").addEventListener("click", addProduct);
orderOptionsForm.addEventListener("submit", (event) => { event.preventDefault(); saveOrderOptions(); });
importButton.addEventListener("click", importCurrentCatalog);
orderFilter.addEventListener("change", (event) => { state.orderFilter = event.target.value; renderOrders(); });
document.querySelector("[data-refresh-orders]").addEventListener("click", () => { loadOrders(); });
ordersList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-order-action]");
  if (button) updateOrderStatus(button.dataset.orderId, button.dataset.orderAction);
});
productGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-editor-id]");
  if (!card) return;
  if (event.target.closest("[data-save]")) saveProduct(card);
  if (event.target.closest("[data-delete]")) deleteProduct(card);
});
productGrid.addEventListener("change", (event) => { if (event.target.matches("[data-available]")) toggleAvailability(event.target.closest("[data-editor-id]")); });
document.querySelector("[data-logout]").addEventListener("click", async () => { await supabaseClient.auth.signOut(); window.location.reload(); });
