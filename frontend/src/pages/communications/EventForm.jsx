import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });

  useEffect(() => {
    if (isEditing) {
      // Lógica para buscar dados do evento para edição
      console.log(`Buscando dados do evento ${id}`);
      // Exemplo: setFormData({ title: 'Evento Existente', ... });
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      console.log('Atualizando evento:', formData);
      // Lógica para atualizar evento
    } else {
      console.log('Criando novo evento:', formData);
      // Lógica para criar novo evento
    }
    navigate('/communications/events'); // Redireciona após submeter
  };

  return (
    <div>
      <h1>{isEditing ? 'Editar Evento' : 'Criar Novo Evento'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Título:</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="description">Descrição:</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="date">Data:</label>
          <input type="datetime-local" id="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="location">Local:</label>
          <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} />
        </div>
        <button type="submit">{isEditing ? 'Atualizar Evento' : 'Criar Evento'}</button>
        <button type="button" onClick={() => navigate('/communications/events')}>Cancelar</button>
      </form>
    </div>
  );
};

export default EventForm;

