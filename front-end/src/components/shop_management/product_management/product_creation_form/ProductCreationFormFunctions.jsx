import { useContext, useEffect } from 'react';
import AppContext from '../../../../app_context/AppContext';
import axiosInstance from '../../../../utils/app/axiosConfig';

const ProductCreationFormFunctions = () => {
  const { 
    setNewProductData,
    selectedShop, setError, 
    setShowErrorCard, newProductData, 
    products, setProducts,
    setShowProductManagement,
    selectedProductToUpdate,
    setIsUpdatingProduct,
    setSelectedProductToUpdate, 
  } = useContext(AppContext);

  useEffect(() => {
    if (selectedShop) {
      setNewProductData(prev => ({
        ...prev,
        id_shop: selectedShop.id_shop
      }));
    }
  }, [selectedShop, setNewProductData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'info_product') {
      const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount <= 7) {
        setNewProductData(prev => ({
          ...prev,
          [name]: value
        }));
      } else {
        setError(prevError => ({ ...prevError, productError: "El número de palabras no puede superar los 7"}));
        throw new Error("El número de palabras no puede superar los 7");
      }
    } else {
      setNewProductData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNumericInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price_product') {
      // Handle empty input
      if (value === '') {
        setNewProductData(prev => ({
          ...prev,
          [name]: ''
        }));
        return;
      }

      // Convert to number and validate
      let numValue = parseFloat(value);
      
      if (!isNaN(numValue)) {
        // Format to exactly 2 decimal places
        const formattedValue = Number(numValue.toFixed(2));
        
        // Ensure the value doesn't exceed 2 decimal places
        const decimalPlaces = value.toString().split('.')[1]?.length || 0;
        if (decimalPlaces <= 2) {
          setNewProductData(prev => ({
            ...prev,
            [name]: formattedValue
          }));
        }
      }
    } else {
      // Handle other numeric inputs (stock, discount, etc.)
      const processedValue = value === '' ? '' : Number(value);
      
      if (!isNaN(processedValue)) {
        setNewProductData(prev => ({
          ...prev,
          [name]: processedValue
        }));
      }
    }
  };

  const validateProductData = (newProductData) => {
    try {
      if (!newProductData.id_shop) {
        setError(prevError => ({ ...prevError, productError: "Debe seleccionar una comercio"}));
        throw new Error("Debe seleccionar una comercio");
      }
      if (!newProductData.name_product) {
        setError(prevError => ({ ...prevError, productError: "El nombre de producto es requerido"}));
        throw new Error("El nombre de producto es requerido");
      }
      if (!newProductData.type_product) {
        setError(prevError => ({ ...prevError, productError: "El tipo de producto es requerido"}));
        throw new Error("El tipo de producto es requerido");
      }
      if (newProductData.discount_product < 0 || newProductData.discount_product > 100) {
        setError(prevError => ({ ...prevError, productError: "Valor de descuento fuera del rango permitido"}));
        throw new Error("Valor de descuento fuera del rango permitido");
      }
      if (newProductData.stock_product < 0) {
        setError(prevError => ({ ...prevError, productError: "El Stock no puede ser negativo"}));
        throw new Error("El Stock no puede ser negativo");
      }
      // Validate price format
      if (newProductData.price_product.toString().split('.')[1]?.length > 2) {
        setError(prevError => ({ ...prevError, productError: "El precio debe tener máximo 2 decimales"}));
        throw new Error("El precio debe tener máximo 2 decimales");
      }

      if (!newProductData.subtype_product) {
        setError(prevError => ({ ...prevError, productError: "El subtipo de producto es requerido"}));
        throw new Error("El subtipo de producto es requerido");
      }

      return true;
    } catch (err) {
      console.error('Error validating product data:', err);
      setError(prevError => ({ ...prevError, productError: "Error al validar los datos del producto" }));
      return false;
    }
  };

  const resetNewProductData = () => {
    setNewProductData({
      name_product: '',
      price_product: '',
      discount_product: 0,
      season_product: 'Todo el Año',
      calification_product: 0,
      type_product: '',
      stock_product: 0,
      info_product: '',
      id_shop: selectedShop?.id_shop || '',
      subtype_product: '',
      second_hand: 0
    });
    setError(prevError => ({
      ...prevError,
      productError: '',
    }));
    setIsUpdatingProduct(false);
    setSelectedProductToUpdate(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!validateProductData(newProductData)) return;

      // Ensure price has exactly 2 decimal places before submitting
      const formattedData = {
        ...newProductData,
        price_product: Number(newProductData.price_product).toFixed(2),
        second_hand: 0
      };

      const response = await axiosInstance.post('/product/create', formattedData);

      if (response.data.error) {
        setError(prevError => ({
          ...prevError,
          databaseResponseError: response.data.error
        }));
        setShowErrorCard(true);
        return;
      }

      if (response.data.data) {
        setProducts(prevProducts => [...prevProducts, response.data.data]);
        resetNewProductData();
        setShowProductManagement(false);
      }
    } catch (err) {
      setError(prevError => ({
        ...prevError,
        databaseResponseError: 'Error al crear el producto'
      }));
      setShowErrorCard(true);
      console.error('ProductCreationFormFunctions - handleSubmit() - Error al crear el producto =', err);
      console.error('Error request:', err.request);
      console.error('Error config:', err.config);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!validateProductData(newProductData)) return;
  
      const id_product = selectedProductToUpdate.id_product;
      
      if (!id_product) {
        throw new Error('No product ID found for update');
      }
  
      const updateData = {
        ...newProductData,
        id_product,
        price_product: Number(newProductData.price_product).toFixed(2)
      };
  
      const response = await axiosInstance.patch('/product/update', updateData);
  
      if (!response.data) {
        throw new Error('No response data received');
      }
  
      if (response.data.error) {
        setError(prevError => ({
          ...prevError,
          databaseResponseError: response.data.error
        }));
        setShowErrorCard(true);
        return;
      }
  
      if (response.data.data) {
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id_product === id_product 
              ? response.data.data 
              : product
          )
        );
        
        resetNewProductData();
        setShowProductManagement(false);
        setIsUpdatingProduct(false);
        setSelectedProductToUpdate(null);
      }
    } catch (err) {
      setError(prevError => ({
        ...prevError,
        databaseResponseError: err.message || 'Error al actualizar el producto'
      }));
      setShowErrorCard(true);
      console.error('Error updating product:', err);
    }
  };

  return {
    handleChange,
    handleNumericInputChange,
    handleSubmit,
    handleUpdate,
    resetNewProductData
  };
};

export default ProductCreationFormFunctions;