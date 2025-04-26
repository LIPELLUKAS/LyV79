import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MessageForm = () => {
  const { id, replyToId } = useParams(); // Assuming replyToId might be used
  const navigate = useNavigate();
  const isReplying = Boolean(replyToId);
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    body: '',
  });

  useEffect(() => {
    if (isReplying) {
      // Lógica para buscar dados da mensagem original para responder
      console.log(`Preparando resposta para mensagem ${replyToId}`);
      // Exemplo: setFormData({ recipient: 'remetente_original', subject: 'Re: Assunto Original', ... });
    } else {
      // Lógica para nova mensagem (talvez preencher destinatário se vindo de um perfil)
      console.log('Preparando nova mensagem');
    }
  }, [replyToId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReplying) {
      console.log('Enviando resposta:', formData);
      // Lógica para enviar resposta
    } else {
      console.log('Enviando nova mensagem:', formData);
      // Lógica para enviar nova mensagem
    }
    navigate('/communications/messages'); // Redireciona após submeter
  };

  return (
    <div>
      <h1>{isReplying ? 'Responder Mensagem' : 'Nova Mensagem'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="recipient">Destinatário:</label>
          <input type="text" id="recipient" name="recipient" value={formData.recipient} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="subject">Assunto:</label>
          <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="body">Mensagem:</label>
          <textarea id="body" name="body" value={formData.body} onChange={handleChange} required rows="10" />
        </div>
        <button type="submit">Enviar Mensagem</button>
        <button type="button" onClick={() => navigate('/communications/messages')}>Cancelar</button>
      </form>
    </div>
  );
};

export default MessageForm;

