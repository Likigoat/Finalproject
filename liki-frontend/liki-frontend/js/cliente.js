
// Guard de rol
Auth.requireRole('client');

const grid = document.getElementById('gridProductos');
const carritoVacio = document.getElementById('carritoVacio');
const carritoLista = document.getElementById('carritoLista');
const totalEl = document.getElementById('total');
const comprarBtn = document.getElementById('comprar');

let carrito = JSON.parse(localStorage.getItem('carrito')||'[]');

function renderCarrito(){
  if(!carrito.length){
    carritoVacio.classList.remove('hidden');
    carritoLista.classList.add('hidden');
    comprarBtn.classList.add('hidden');
    totalEl.textContent = '';
    return;
  }
  carritoVacio.classList.add('hidden');
  carritoLista.classList.remove('hidden');
  comprarBtn.classList.remove('hidden');
  carritoLista.innerHTML = carrito.map((it,idx)=>`
    <div class='flex' style='justify-content:space-between'>
      <div>${it.name} × ${it.quantity}</div>
      <div>$${(it.quantity*it.price).toFixed(2)} <button class='btn' onclick='removeItem(${idx})'>Quitar</button></div>
    </div>
  `).join('');
  const total = carrito.reduce((acc,it)=> acc + it.quantity*it.price, 0);
  totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

window.removeItem = function(idx){
  carrito.splice(idx,1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  renderCarrito();
}

// addItem is defined later with signature (id, price, name)

async function loadCatalog(){
  const list = await API.getProducts();
  grid.innerHTML = list.map(p => `
    <div class='card'>
      ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:160px;object-fit:cover;border-radius:10px;">` : ''}
      <h3>${p.name}</h3>
      <p>${p.description || ''}</p>
      <p><strong>$${Number(p.price).toFixed(2)}</strong> · <span class='badge'>Stock: ${p.stock}</span></p>
      <button class='btn btn-gold add-to-cart' data-id="${p.id}" data-name="${(p.name+'').replace(/"/g,'&quot;')}" data-price="${Number(p.price)}">Agregar</button>
    </div>
  `).join('');
    
    // Attach click listeners to add-to-cart buttons (safer than inline onclick)
    const buttons = grid.querySelectorAll('.add-to-cart');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e)=>{
        const id = Number(btn.dataset.id);
        const name = btn.dataset.name;
        const price = Number(btn.dataset.price);
        window.addItem(id, name, price);
      });
    });
}

// Fix for template string inside template: define function separately
window.addItem = function(id, name, price){
  console.log('addItem called', { id, name, price });
  const found = carrito.find(i=>i.product_id===id);
  if(found) found.quantity += 1; else carrito.push({ product_id:id, name, price, quantity:1 });
  localStorage.setItem('carrito', JSON.stringify(carrito));
  renderCarrito();
}

comprarBtn.addEventListener('click', async ()=>{
  if(!carrito.length) return;
  try{
    const items = carrito.map(({product_id, quantity})=>({ product_id, quantity }));
    const res = await API.createOrder(items);
    document.getElementById('orderMsg').textContent = `Compra realizada. Orden #${res.order_id} Total: $${res.total.toFixed(2)}`;
    document.getElementById('orderMsg').classList.remove('hidden');
    carrito = [];
    localStorage.removeItem('carrito');
    renderCarrito();
  }catch(err){
    alert(err.message || 'Error al comprar');
  }
});

loadCatalog();
renderCarrito();
