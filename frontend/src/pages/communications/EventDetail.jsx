import React from 'react';
import { useParams } from 'react-router-dom';

const EventDetail = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Detalhes do Evento {id}</h1>
      <p>Esta página exibirá os detalhes do evento.</p>
      {/* Conteúdo dos detalhes do evento será implementado aqui */}
    </div>
  );
};

export default EventDetail;

