import { useEffect, useState } from 'react';
import api from '../api/axios';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    api.get('/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Usuarios</h2>
      <ul>
        {usuarios.map(u => (
          <li key={u._id}>{u.nombre} - {u.email}</li>
        ))}
      </ul>
    </div>
  );
}

export default Usuarios;