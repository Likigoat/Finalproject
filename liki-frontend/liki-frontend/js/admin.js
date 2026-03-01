
// Guard de rol
Auth.requireRole('admin');

const rows = document.getElementById('rows');
const createForm = document.getElementById('createForm');
const createMsg = document.getElementById('createMsg');

async function loadProducts(){
  const list = await API.getProducts();
  rows.innerHTML = list.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>$${Number(p.price).toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>
        <button class='btn btn-gold' onclick='editProduct(${p.id})'>Editar</button>
        <button class='btn' style='margin-left:6px' onclick='delProduct(${p.id})'>Eliminar</button>
      </td>
    </tr>`
  ).join('');
}

window.editProduct = async function(id){
  const p = await API.getProduct(id);
  const name = prompt('Nombre', p.name);
  if(name===null) return;
  const price = parseFloat(prompt('Precio', p.price));
  if(isNaN(price)) return alert('Precio inválido');
  const stock = parseInt(prompt('Stock', p.stock));
  if(isNaN(stock)) return alert('Stock inválido');
  const description = prompt('Descripción', p.description||'') || undefined;
  const image_url = prompt('URL imagen', p.image_url||'') || undefined;
  await API.updateProduct(id, { name, price, stock, description, image_url });
  await loadProducts();
}

window.delProduct = async function(id){
  if(!confirm('¿Eliminar producto?')) return;
  await API.deleteProduct(id);
  await loadProducts();
}

createForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = {
    name: document.getElementById('pName').value,
    price: Number(document.getElementById('pPrice').value),
    stock: Number(document.getElementById('pStock').value),
    image_url: document.getElementById('pImage').value || undefined,
    description: document.getElementById('pDesc').value || undefined
  };
  try{
    await API.createProduct(payload);
    createMsg.textContent = 'Producto creado';
    createMsg.classList.remove('hidden');
    createForm.reset();
    await loadProducts();
  }catch(err){
    createMsg.textContent = err.message || 'Error al crear';
    createMsg.classList.remove('hidden');
  }
});

loadProducts();
