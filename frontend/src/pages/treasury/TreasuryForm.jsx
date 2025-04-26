import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

const TreasuryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    type: 'expense',
    amount: '',
    notes: '',
    attachment: null
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/treasury/categories/');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback categories if API fails
        setCategories([
          { id: 1, name: 'Cuotas' },
          { id: 2, name: 'Donaciones' },
          { id: 3, name: 'Eventos' },
          { id: 4, name: 'Mantenimiento' },
          { id: 5, name: 'Servicios' },
          { id: 6, name: 'Otros' }
        ]);
      }
    };

    fetchCategories();

    if (isEditing) {
      const fetchTransaction = async () => {
        try {
          const response = await axios.get(`/api/treasury/transactions/${id}/`);
          const { description, date, category, type, amount, notes } = response.data;
          setFormData({
            description,
            date: date.split('T')[0],
            category,
            type,
            amount,
            notes: notes || '',
            attachment: null
          });
          setLoading(false);
        } catch (err) {
          setError('Error al cargar los datos de la transacción. Por favor, intente nuevamente.');
          console.error('Error fetching transaction:', err);
          setLoading(false);
        }
      };

      fetchTransaction();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.description || !formData.date || !formData.category || !formData.amount) {
      setError('Por favor complete todos los campos requeridos.');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      setSubmitting(true);
      
      if (isEditing) {
        await axios.put(`/api/treasury/transactions/${id}/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/api/treasury/transactions/', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      navigate('/treasury');
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} la transacción. Por favor, intente nuevamente.`);
      console.error('Error submitting form:', err);
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-4">
      <PageHeader 
        title={isEditing ? 'Editar Transacción' : 'Nueva Transacción'} 
        backLink="/treasury"
        backLabel="Volver a Tesorería"
      />
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Descripción *
            </label>
            <input
              id="description"
              name="description"
              type="text"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Fecha *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Categoría *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Seleccione una categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
              Tipo *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
              Monto *
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="attachment">
              Comprobante
            </label>
            <input
              id="attachment"
              name="attachment"
              type="file"
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            type="button"
            label="Cancelar"
            variant="secondary"
            onClick={() => navigate('/treasury')}
          />
          <Button
            type="submit"
            label={isEditing ? 'Actualizar' : 'Guardar'}
            variant="primary"
            disabled={submitting}
          />
        </div>
      </form>
    </div>
  );
};

export default TreasuryForm;
