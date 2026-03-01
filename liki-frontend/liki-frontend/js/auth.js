
const Auth = {
  async login(email, password){
    const res = await API.login(email, password);
    localStorage.setItem('token', res.token);
    localStorage.setItem('role', res.user.role);
    localStorage.setItem('userName', res.user.name);
    localStorage.setItem('userEmail', res.user.email);
    return res;
  },
  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    location.href = 'index.html';
  },
  requireRole(role){
    const token = localStorage.getItem('token');
    const r = localStorage.getItem('role');
    if(!token || r !== role){
      location.href = 'index.html';
    }
  }
};

// Enlazar logout si existe el botón
window.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('logout');
  if(btn) btn.addEventListener('click', (e)=>{ e.preventDefault(); Auth.logout(); });
});
