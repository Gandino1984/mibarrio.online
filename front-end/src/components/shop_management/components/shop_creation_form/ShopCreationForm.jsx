import React, { useEffect, useState, useRef } from 'react';
import styles from '../../../../../../public/css/ShopCreationForm.module.css';
import { ShopCreationFormUtils } from './ShopCreationFormUtils.jsx';
import { Box } from 'lucide-react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';

import ShopImageUpload from './components/ShopImageUpload.jsx';
import ShopBasicInfo from './components/ShopBasicInfo.jsx';
import ShopSchedule from './components/ShopSchedule.jsx';

import StepTracker from '../../../navigation_components/StepTracker.jsx';
import NavigationButtons from '../../../navigation_components/NavigationButtons.jsx';

const ShopCreationForm = () => {
  const { currentUser } = useAuth();
  
  const { 
    setError,
    setShowErrorCard,
    uploading,
    setUploading,
    setSuccess,
    setShowSuccessCard
  } = useUI();
  
  const {
    newShop, 
    setNewShop,
    shopTypesAndSubtypes,
    selectedShop,
    setShowShopCreationForm,
    setSelectedShop
  } = useShop();

  const {
    handleCreateShop,
    handleUpdateShop,
    validateSchedule,
    handleImageUpload
  } = ShopCreationFormUtils();

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const [hasContinuousSchedule, setHasContinuousSchedule] = useState(false);

  // state for step tracking
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Add debug flag
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

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
      // Detect if shop has continuous schedule
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
      
      // Log the schedule data to ensure it's loaded correctly
      console.log('Shop schedule data loaded:', {
        morning_open: selectedShop.morning_open,
        morning_close: selectedShop.morning_close,
        afternoon_open: selectedShop.afternoon_open,
        afternoon_close: selectedShop.afternoon_close,
        hasContinuousSchedule: shopHasContinuousSchedule
      });
    }
  }, [selectedShop, currentUser?.id_user, setNewShop]);

  // Navigation Utils
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      console.log(`Moving from step ${currentStep} to step ${currentStep + 1}`);
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      console.log(`Moving from step ${currentStep} to step ${currentStep - 1}`);
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
    console.log("Next button clicked at step:", currentStep);
    if (validateCurrentStep()) {
      goToNextStep();
    }
  };

  // Block direct form submission at intermediate steps
  const handleFormSubmit = async (e) => {
    // Always prevent default form submission
    e.preventDefault();

    console.log("Form submit triggered at step:", currentStep);
    
    // Only allow submission at the final step
    if (currentStep !== totalSteps) {
      console.log("Preventing submission - not at final step");
      setError(prevError => ({
        ...prevError,
        shopError: "Por favor complete todos los pasos del formulario primero."
      }));
      setShowErrorCard(true);
      
      // Instead of submitting, go to the next step
      if (validateCurrentStep()) {
        goToNextStep();
      }
      return;
    }
    
    // Now we're at the final step, proceed with submission
    await processFormSubmission(e);
  };
  
  // Extracted the actual form submission logic to a separate function
  const processFormSubmission = async (e) => {
    // Set flag to prevent duplicate submissions
    if (isFormSubmitting) {
      console.log("Submission already in progress, ignoring");
      return;
    }
    
    setIsFormSubmitting(true);
    console.log('Processing form submission with data:', newShop);

    if (!currentUser?.id_user) {
      console.error('No user ID available:', currentUser);
      setError(prevError => ({
        ...prevError,
        shopError: 'Error: Usuario no identificado. Por favor, inicie sesión de nuevo.'
      }));
      setShowErrorCard(true);
      setIsFormSubmitting(false);
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
      
      // If schedule is continuous, set morning_close and afternoon_open as null
      if (hasContinuousSchedule) {
        formData.morning_close = null;
        formData.afternoon_open = null;
      }

      console.log('Submitting form with data:', formData);
      
      // One final schedule validation
      const scheduleValidation = validateSchedule(formData);
      if (!scheduleValidation.isValid) {
        setError(prevError => ({ 
          ...prevError, 
          shopError: scheduleValidation.error 
        }));
        setShowErrorCard(true);
        setIsFormSubmitting(false);
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
          
          // Show success notification
          setSuccess(prevSuccess => ({
            ...prevSuccess,
            shopSuccess: "¡Comercio actualizado exitosamente!"
          }));
          setShowSuccessCard(true);
        }
      } else {
        // Creating new shop
        const result = await handleCreateShop(formData);
        success = !!result && !!result.id_shop;
        
        if (success) {
          console.log('New shop created successfully:', result);
          shopId = result.id_shop;
          createdOrUpdatedShop = result;
          
          // Show success notification
          setSuccess(prevSuccess => ({
            ...prevSuccess,
            shopSuccess: "¡Comercio creado exitosamente!"
          }));
          setShowSuccessCard(true);
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
      
      // If successful, close the form
      if (success) {
        setTimeout(() => {
          setShowShopCreationForm(false);
          setSelectedShop(null);
        }, 1000); // Short delay to allow success message to be seen
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
      setIsFormSubmitting(false);
    }
  };

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

            <StepTracker currentStep={currentStep} totalSteps={totalSteps} />
        </div>   
        
        {/* Use handleFormSubmit instead of handleSubmit */}
        <form onSubmit={handleFormSubmit} className={styles.form}>
          {/* Render step content */}
          {renderStepContent()}
            
          <NavigationButtons 
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNextClick}
            onPrevious={goToPreviousStep}
            isSubmitting={uploading || isFormSubmitting}
            submitLabel={selectedShop ? 'Actualizar' : 'Crear'}
            processingLabel="Procesando..."
            SubmitIcon={Box}
            // Only show submit button on the last step
            showSubmitButton={currentStep === totalSteps}
          />
        </form>
      </div>
    </div>
  );
};

export default ShopCreationForm;