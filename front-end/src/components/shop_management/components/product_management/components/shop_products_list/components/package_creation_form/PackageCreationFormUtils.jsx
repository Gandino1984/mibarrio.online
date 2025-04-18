import { useCallback, useEffect } from 'react';
import { useShop } from '../../../../../../../../app_context/ShopContext.jsx';
// import { useAuth } from '../../../../../../../../app_context/AuthContext.jsx';
import { useProduct } from '../../../../../../../../app_context/ProductContext.jsx';
import { usePackage } from '../../../../../../../../app_context/PackageContext.jsx';
import { useUI } from '../../../../../../../../app_context/UIContext.jsx';
import axiosInstance from '../../../../../../../../utils/app/axiosConfig.js';

const PackageCreationFormUtils = () => {
  // Context hooks
  const { selectedShop } = useShop();
  const { products } = useProduct();
  const { setPackages, refreshPackageList } = usePackage();
  const { setError, setShowErrorCard, setSuccess, setShowSuccessCard } = useUI();

  // ✨ UPDATE: Validate package form inputs
  const validatePackageForm = useCallback((packageData) => {
    const errors = {};

    // Validate required fields
    if (!packageData.name_package || packageData.name_package.trim() === '') {
      errors.name_package = "El nombre del paquete es obligatorio";
    } else if (packageData.name_package.length > 100) {
      errors.name_package = "El nombre del paquete no puede exceder los 100 caracteres";
    }

    // Validate required product
    if (!packageData.id_product1) {
      errors.id_product1 = "Se requiere al menos un producto para crear un paquete";
    }

    // Validate shop ID
    if (!packageData.id_shop) {
      errors.id_shop = "Se requiere un comercio para crear un paquete";
    }

    return errors;
  }, []);

  // ✨ UPDATE: Get product details for selected products
  const getProductDetails = useCallback(async (productIds) => {
    try {
      if (!productIds || productIds.length === 0) {
        return [];
      }

      // First try to find products in the local state
      if (products && products.length > 0) {
        const details = productIds
          .map(id => products.find(p => p.id_product === id))
          .filter(p => p !== undefined);

        if (details.length === productIds.length) {
          console.log('Found all product details in local state:', details);
          return details;
        }
      }

      // If all products not found locally, fetch from API
      console.log('Fetching product details from API for IDs:', productIds);
      const promises = productIds.map(id => 
        axiosInstance.get(`/product/by-id/${id}`)
          .then(response => response.data.data)
          .catch(error => {
            console.error(`Error fetching product ${id}:`, error);
            return null;
          })
      );

      const results = await Promise.all(promises);
      const validResults = results.filter(p => p !== null);
      
      console.log('Fetched product details:', validResults);
      return validResults;
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError(prevError => ({
        ...prevError,
        productError: "Error al obtener detalles de los productos"
      }));
      setShowErrorCard(true);
      return [];
    }
  }, [products, setError, setShowErrorCard]);

  // ✨ UPDATE: Create a new package - updated to match your backend implementation
  const handleCreatePackage = useCallback(async (packageData) => {
    try {
      console.log('Creating package with data:', packageData);
      
      // Ensure there's a product1
      if (!packageData.id_product1) {
        return {
          success: false,
          message: "Se requiere al menos un producto para crear un paquete"
        };
      }

      // Make API call to create package
      const response = await axiosInstance.post('/package/create', {
        id_shop: packageData.id_shop,
        id_product1: packageData.id_product1,
        id_product2: packageData.id_product2,
        id_product3: packageData.id_product3,
        id_product4: packageData.id_product4,
        id_product5: packageData.id_product5,
        name_package: packageData.name_package,
        active_package: packageData.active_package
      });
      
      console.log('Package creation response:', response.data);
      
      if (response.data && response.data.success) {
        // Set success message
        setSuccess(prev => ({
          ...prev,
          productSuccess: response.data.success || "Paquete creado exitosamente"
        }));
        setShowSuccessCard(true);
        
        // Fetch updated packages list
        try {
          const packagesResponse = await axiosInstance.get(`/package/by-shop-id/${selectedShop.id_shop}`);
          if (packagesResponse.data && packagesResponse.data.data) {
            setPackages(packagesResponse.data.data || []);
          }
        } catch (fetchError) {
          console.error('Error fetching updated packages:', fetchError);
        }
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.success
        };
      } else {
        // Handle API error
        setError(prevError => ({
          ...prevError,
          productError: response.data.error || "Error al crear el paquete"
        }));
        setShowErrorCard(true);
        
        return {
          success: false,
          message: response.data.error || "Error al crear el paquete"
        };
      }
    } catch (error) {
      console.error('Error creating package:', error);
      
      const errorMessage = error.response?.data?.error || "Error al crear el paquete";
      
      setError(prevError => ({
        ...prevError,
        productError: errorMessage
      }));
      setShowErrorCard(true);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [selectedShop, setError, setShowErrorCard, setSuccess, setShowSuccessCard, setPackages]);

  // ✨ UPDATE: Fetch packages by shop
  const fetchPackagesByShop = useCallback(async () => {
    try {
      if (!selectedShop?.id_shop) {
        console.error('No shop selected for fetching packages');
        return [];
      }

      console.log(`Fetching packages for shop ID: ${selectedShop.id_shop}`);
      const response = await axiosInstance.get(`/package/by-shop-id/${selectedShop.id_shop}`);
      
      if (response.data && response.data.data) {
        const packages = response.data.data || [];
        console.log(`Fetched ${packages.length} packages for shop ${selectedShop.name_shop}`);
        setPackages(packages);
        return packages;
      } else {
        console.error('Error in package fetch response:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError(prevError => ({
        ...prevError,
        productError: "Error al obtener los paquetes del comercio"
      }));
      setShowErrorCard(true);
      return [];
    }
  }, [selectedShop, setPackages, setError, setShowErrorCard]);

  return {
    validatePackageForm,
    getProductDetails,
    handleCreatePackage,
    fetchPackagesByShop
  };
};

export default PackageCreationFormUtils;