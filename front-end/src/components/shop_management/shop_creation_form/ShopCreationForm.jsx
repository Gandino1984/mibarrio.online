import React, { useContext, useEffect, useState, useRef } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopCreationForm.module.css';
import { ShopCreationFormFunctions } from './ShopCreationFormFunctions.jsx';
import { Box, ArrowLeft, Camera, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';

// UPDATE: Import new step components
import ShopImageUpload from './ShopImageUpload.jsx';
import ShopBasicInfo from './ShopBasicInfo.jsx';
import ShopSchedule from './ShopSchedule.jsx';

const ShopCreationForm = () => {
  const { 
    newShop, 
    setNewShop,
    shopTypesAndSubtypes,
    selectedShop,
    setError,
    setShowErrorCard,
    currentUser,
    setShowShopCreationForm,
    setSelectedShop,
    uploading,
    setUploading
  } = useContext(AppContext);

  const {
    handleCreateShop,
    handleUpdateShop,
    validateSchedule,
    handleImageUpload
  } = ShopCreationFormFunctions();

  // UPDATE: Enhanced image handling states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // UPDATE: Added state for continuous schedule
  const [hasContinuousSchedule, setHasContinuousSchedule] = useState(false);

  // UPDATE: Added state for step tracking
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Modified useEffect to properly handle user ID
  useEffect(() => {
    if (currentUser?.id_user) {
      setNewShop(prev => {
        // Only update if the ID is different to avoid unnecessary rerenders
        if (prev?.id_user !== currentUser.id_user) {
          console.log('Updating user ID in form:', currentUser.id_user);
          return {
            ...prev,
            id_user: currentUser.id_user
          };
        }
        return prev;
      });
    }
  }, [currentUser?.id_user, setNewShop]); 

  useEffect(() => {
    if (selectedShop && currentUser?.id_user) {
      // UPDATE: Detect if shop has continuous schedule
      const shopHasContinuousSchedule = !selectedShop.morning_close || !selectedShop.afternoon_open;
      setHasContinuousSchedule(shopHasContinuousSchedule);
      
      setNewShop({
        name_shop: selectedShop.name_shop,
        type_shop: selectedShop.type_shop,
        subtype_shop: selectedShop.subtype_shop,
        location_shop: selectedShop.location_shop,
        id_user: currentUser.id_user, // Ensure we always set the current user ID
        calification_shop: selectedShop.calification_shop,
        image_shop: selectedShop.image_shop,
        morning_open: selectedShop.morning_open || '',
        morning_close: selectedShop.morning_close || '',
        afternoon_open: selectedShop.afternoon_open || '',
        afternoon_close: selectedShop.afternoon_close || ''
      });

      // Set image preview if exists
      if (selectedShop.image_shop) {
        try {
          // If the image is already a complete URL
          if (selectedShop.image_shop.startsWith('http') || 
              selectedShop.image_shop.startsWith('data:') || 
              selectedShop.image_shop.startsWith('blob:')) {
            setImagePreview(selectedShop.image_shop);
          } else {
            // Build the relative URL to the base
            const baseUrl = window.location.origin;
            const cleanPath = selectedShop.image_shop.replace(/^\/+/, '');
            const imageUrl = `${baseUrl}/${cleanPath}`;
            console.log('Setting preview URL:', imageUrl);
            setImagePreview(imageUrl);
          }
        } catch (err) {
          console.error('Error formatting image URL:', err);
        }
      }
    }
  }, [selectedShop, currentUser?.id_user, setNewShop]);

  // UPDATE: Navigation functions
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validate current step before proceeding
  const validateCurrentStep = () => {
    switch(currentStep) {
      case 1: // Image upload - optional, so always valid
        return true;
      case 2: // Basic info
        if (!newShop.name_shop || !newShop.type_shop || !newShop.subtype_shop || !newShop.location_shop) {
          setError(prevError => ({
            ...prevError,
            shopError: "Completa todos los campos obligatorios antes de continuar."
          }));
          setShowErrorCard(true);
          return false;
        }
        return true;
      case 3: // Schedule
        const scheduleValidation = validateSchedule(newShop);
        if (!scheduleValidation.isValid) {
          setError(prevError => ({
            ...prevError,
            shopError: scheduleValidation.error
          }));
          setShowErrorCard(true);
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // Handle next button with validation
  const handleNextClick = () => {
    if (validateCurrentStep()) {
      goToNextStep();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitting form with currentUser:', currentUser);
    console.log('Form data:', newShop);

    if (!currentUser?.id_user) {
      console.error('No user ID available:', currentUser);
      setError(prevError => ({
        ...prevError,
        shopError: 'Error: Usuario no identificado. Por favor, inicie sesión de nuevo.'
      }));
      setShowErrorCard(true);
      return;
    }

    // Disable submit button during processing
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const formData = {
        ...newShop,
        id_user: currentUser.id_user
      };
      
      // UPDATE: If schedule is continuous, set morning_close and afternoon_open as null
      if (hasContinuousSchedule) {
        formData.morning_close = null;
        formData.afternoon_open = null;
      }

      console.log('Submitting form with data:', formData);
      
      // Validate schedule
      const scheduleValidation = validateSchedule(formData);
      
      if (!scheduleValidation.isValid) {
        setError(prevError => ({ 
          ...prevError, 
          shopError: scheduleValidation.error 
        }));
        setShowErrorCard(true);
        return;
      }

      let success = false;
      let shopId = null;
      let createdOrUpdatedShop = null;

      if (selectedShop) {
        // Updating existing shop
        const result = await handleUpdateShop(selectedShop.id_shop, formData);
        success = !!result;
        shopId = selectedShop.id_shop;
        
        if (success) {
          console.log('Shop updated successfully:', result);
          createdOrUpdatedShop = result;
        }
      } else {
        // Creating new shop
        const result = await handleCreateShop(formData);
        success = !!result && !!result.id_shop;
        
        if (success) {
          console.log('New shop created successfully:', result);
          shopId = result.id_shop;
          createdOrUpdatedShop = result;
          
          // Force update the shops list in AppContext immediately
          // This is critical for ensuring the new shop appears in the list
          console.log('Updating shop list with newly created shop');
        }
      }

      // Upload image if one was selected and the save operation was successful
      if (success && selectedImage && shopId) {
        console.log(`Shop ${selectedShop ? 'updated' : 'created'} successfully, ID: ${shopId}`);
        
        try {
          setUploading(true);
          await handleImageUpload(
            selectedImage, 
            shopId, 
            (progress) => setUploadProgress(progress)
          );
          console.log('Shop image uploaded successfully');
          
          // Clear the image selection after successful upload
          setSelectedImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Error uploading shop image:', error);
          setError(prevError => ({
            ...prevError,
            imageError: error.message || "Error uploading shop image"
          }));
          setShowErrorCard(true);
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error processing form:', error);
      setError(prevError => ({
        ...prevError,
        shopError: error.message || "Error processing form"
      }));
      setShowErrorCard(true);
    } finally {
      // Re-enable submit button
      if (submitButton) submitButton.disabled = false;
    }
  };

  // UPDATE: Function to handle back button
  // const handleBack = () => {
  //   // Clear form state
  //   setNewShop({
  //     name_shop: '',
  //     type_shop: '',
  //     subtype_shop: '',
  //     location_shop: '',
  //     id_user: currentUser?.id_user || '',
  //     calification_shop: 0, 
  //     image_shop: '',
  //     morning_open: '00:00',
  //     morning_close: '00:00',
  //     afternoon_open: '00:00',
  //     afternoon_close: '00:00',
  //     has_delivery: false,
  //   });
    
  //   // Clear selected shop
  //   setSelectedShop(null);
    
  //   // Hide form to return to list
  //   setShowShopCreationForm(false);
  // };

  //Render the appropriate step component based on currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ShopImageUpload 
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            uploading={uploading}
            uploadProgress={uploadProgress}
            setUploadProgress={setUploadProgress}
            fileInputRef={fileInputRef}
            setError={setError}
            setShowErrorCard={setShowErrorCard}
          />
        );
      case 2:
        return (
          <ShopBasicInfo 
            newShop={newShop}
            setNewShop={setNewShop}
            shopTypesAndSubtypes={shopTypesAndSubtypes}
          />
        );
      case 3:
        return (
          <ShopSchedule 
            newShop={newShop}
            setNewShop={setNewShop}
            hasContinuousSchedule={hasContinuousSchedule}
            setHasContinuousSchedule={setHasContinuousSchedule}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>   
            <h1 className={styles.headerTitle}>
              {selectedShop ? 'Actualizar comercio' : 'Crear un comercio'}
            </h1>
            
            {/* <button 
              className={styles.backButton}
              onClick={handleBack}
              type="button"
            >
              <ArrowLeft size={18} />
              Volver a la lista
            </button> */}

            {/* Step Tracker */}
            <div className={styles.stepTracker}>
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div 
                  key={index}
                  className={`${styles.stepDot} ${currentStep === index + 1 ? styles.active : ''}`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
        </div>
        
        
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* UPDATE: Render step content */}
          {renderStepContent()}
            
          {/* UPDATE: Navigation buttons */}
          <div className={styles.navigationButtons}>
            {currentStep > 1 && (
              <button 
                type="button" 
                className={styles.navButton}
                onClick={goToPreviousStep}
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button 
                type="button" 
                className={styles.navButton}
                onClick={handleNextClick}
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={uploading}
                style={{ 
                  opacity: uploading ? 0.6 : 1,
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? 'Procesando...' : (selectedShop ? 'Actualizar' : 'Crear')}
                {!uploading && <Box size={17} style={{ marginLeft: '5px' }} />}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopCreationForm;