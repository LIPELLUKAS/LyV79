import React from 'react';
import { useParams } from 'react-router-dom';

const MessageDetail = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Detalhes da Mensagem {id}</h1>
      <p>Esta página exibirá os detalhes da mensagem.</p>
      {/* Conteúdo dos detalhes da mensagem será implementado aqui */}
    </div>
  );
};

export default MessageDetail;

