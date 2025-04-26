import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/library/books/${id}/`);
        setBook(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los detalles del libro. Por favor, intente nuevamente.');
        console.error('Error fetching book details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/library/books/${id}/`);
      navigate('/library');
    } catch (err) {
      setError('Error al eliminar el libro. Por favor, intente nuevamente.');
      console.error('Error deleting book:', err);
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    try {
      setBorrowing(true);
      await axios.post(`/api/library/books/${id}/borrow/`);
      // Actualizar datos del libro
      const response = await axios.get(`/api/library/books/${id}/`);
      setBook(response.data);
      setBorrowing(false);
    } catch (err) {
      setError('Error al solicitar el préstamo. Por favor, intente nuevamente.');
      console.error('Error borrowing book:', err);
      setBorrowing(false);
    }
  };

  const handleReturn = async () => {
    try {
      setReturning(true);
      await axios.post(`/api/library/books/${id}/return/`);
      // Actualizar datos del libro
      const response = await axios.get(`/api/library/books/${id}/`);
      setBook(response.data);
      setReturning(false);
    } catch (err) {
      setError('Error al devolver el libro. Por favor, intente nuevamente.');
      console.error('Error returning book:', err);
      setReturning(false);
    }
  };

  if (loading) return <Loading />;

  if (error) return <Alert type="error" message={error} />;

  if (!book) return <Alert type="warning" message="Libro no encontrado" />;

  return (
    <div className="p-4">
      <PageHeader 
        title="Detalle de Libro" 
        backLink="/library"
        backLabel="Volver a Biblioteca"
      />
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="md:flex">
          {book.cover_image && (
            <div className="md:w-1/3 p-4">
              <img 
                src={book.cover_image} 
                alt={book.title} 
                className="w-full h-auto object-cover rounded"
              />
            </div>
          )}
          
          <div className="md:w-2/3 p-6">
            <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
            
            <div className="mb-4">
              <p className="text-lg">
                <span className="font-medium">Autor:</span> {book.author}
              </p>
              {book.publication_year && (
                <p>
                  <span className="font-medium">Año de publicación:</span> {book.publication_year}
                </p>
              )}
              {book.publisher && (
                <p>
                  <span className="font-medium">Editorial:</span> {book.publisher}
                </p>
              )}
              {book.isbn && (
                <p>
                  <span className="font-medium">ISBN:</span> {book.isbn}
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 text-sm rounded ${
                book.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {book.available ? 'Disponible' : 'Prestado'}
              </span>
              
              {!book.available && book.borrowed_by && book.due_date && (
                <p className="mt-2 text-sm">
                  Prestado a {book.borrowed_by} hasta el {new Date(book.due_date).toLocaleDateString()}
                </p>
              )}
            </div>
            
            {book.categories && book.categories.length > 0 && (
              <div className="mb-4">
                <p className="font-medium mb-1">Categorías:</p>
                <div className="flex flex-wrap gap-2">
                  {book.categories.map(category => (
                    <span key={category} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {book.description && (
              <div className="mb-4">
                <p className="font-medium mb-1">Descripción:</p>
                <p className="text-gray-700">{book.description}</p>
              </div>
            )}
            
            <div className="mt-6 flex flex-wrap gap-2">
              {book.available ? (
                <Button
                  label="Solicitar Préstamo"
                  variant="primary"
                  onClick={handleBorrow}
                  disabled={borrowing}
                />
              ) : (
                book.is_current_borrower && (
                  <Button
                    label="Devolver Libro"
                    variant="secondary"
                    onClick={handleReturn}
                    disabled={returning}
                  />
                )
              )}
              
              <Button
                label="Editar"
                icon="edit"
                variant="secondary"
                as={Link}
                to={`/library/books/edit/${id}`}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        {!deleteConfirm ? (
          <Button
            label="Eliminar"
            icon="trash"
            variant="danger"
            onClick={() => setDeleteConfirm(true)}
          />
        ) : (
          <div className="flex space-x-2">
            <Button
              label="Cancelar"
              variant="secondary"
              onClick={() => setDeleteConfirm(false)}
            />
            <Button
              label="Confirmar Eliminación"
              variant="danger"
              onClick={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;
