
const API = {
  async request(path, { method='GET', body, auth=false }={}){
    const headers = { 'Content-Type': 'application/json' };
    if(auth){
      const token = localStorage.getItem('token');
      if(token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok){
      const msg = data.message || data.error || 'Error en la solicitud';
      throw new Error(msg);
    }
    return data;
  },
  // Auth
  login: (email, password)=> API.request('/auth/login', { method:'POST', body:{ email, password } }),
  register:(payload)=> API.request('/auth/register', { method:'POST', body:payload }),

  // Productos
  getProducts: ()=> API.request('/products'),
  getProduct: (id)=> API.request(`/products/${id}`),
  createProduct: (payload)=> API.request('/products', { method:'POST', body:payload, auth:true }),
  updateProduct: (id, payload)=> API.request(`/products/${id}`, { method:'PUT', body:payload, auth:true }),
  deleteProduct: (id)=> API.request(`/products/${id}`, { method:'DELETE', auth:true }),

  // Órdenes
  createOrder: (items)=> API.request('/orders', { method:'POST', body:{ items }, auth:true })
};
