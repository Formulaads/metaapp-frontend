import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function App() {
  const [mensajes, setMensajes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/api/mensajes')
      .then(res => setMensajes(res.data))
      .catch(err => console.error('Error cargando mensajes:', err));
  }, []);

  const mensajesFiltrados = mensajes.filter((m) => {
    const matchTexto =
      m.from.includes(filtro) ||
      (m.text && m.text.toLowerCase().includes(filtro.toLowerCase()));
    const fechaMensaje = new Date(m.timestamp);
    const matchDesde = desde ? fechaMensaje >= new Date(desde) : true;
    const matchHasta = hasta ? fechaMensaje <= new Date(hasta) : true;
    return matchTexto && matchDesde && matchHasta;
  });

  const exportarExcel = () => {
    const hoja = XLSX.utils.json_to_sheet(
      mensajesFiltrados.map((m) => ({
        De: m.from,
        Mensaje: m.text,
        Fecha: new Date(m.timestamp).toLocaleString(),
      }))
    );
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Mensajes');
    const buffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'mensajes.xlsx');
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <h1>📩 Bandeja de Mensajes WhatsApp</h1>

      <input
        placeholder="Buscar por número o texto..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={{ padding: 8, width: '100%', marginBottom: 10 }}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        <button onClick={exportarExcel} style={{ padding: '0 12px' }}>
          ⬇️ Exportar Excel
        </button>
      </div>

      {mensajesFiltrados.map((msg, i) => (
        <div key={i} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
          <p><strong>De:</strong> {msg.from}</p>
          <p><strong>Mensaje:</strong> {msg.text}</p>
          <p style={{ fontSize: 12, color: '#888' }}>
            {new Date(msg.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default App;
