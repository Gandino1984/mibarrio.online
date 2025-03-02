import { useState, useContext, useEffect, useRef } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import { uploadProfileImage, formatImageUrl } from '../../../utils/image/imageUploadService.js';

export const UserInfoCardFunctions = () => {
    const {
        currentUser, setCurrentUser,
        setUploading, setError, uploading
    } = useContext(AppContext);

    const [uploadProgress, setUploadProgress] = useState(0);
    const [localImageUrl, setLocalImageUrl] = useState(null);
    // Store the new image timestamp in a ref to avoid re-renders
    const imageTimestampRef = useRef(null);
    
    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            if (localImageUrl) {
                URL.revokeObjectURL(localImageUrl);
            }
        };
    }, [localImageUrl]);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        
        setError(prevError => ({ ...prevError, imageError: "" }));
        
        if (!file) {
            console.log('-> UserInfoCardFunctions - handleImageUpload() - El usuario canceló la selección de archivo');
            return; // Simplemente retornamos sin mostrar error si el usuario canceló
        }

        try {
            if (!currentUser?.name_user) {
                throw new Error('No hay usuario activo');
            }

            // Create a temporary local URL for immediate display
            const localUrl = URL.createObjectURL(file);
            setLocalImageUrl(localUrl);

            setUploading(true);
            setUploadProgress(0);

            console.log('Comenzando carga de imagen de perfil para usuario:', currentUser.name_user);

            // Use the uploadProfileImage function from our service
            const imagePath = await uploadProfileImage({
                file,
                userName: currentUser.name_user,
                onProgress: (progress) => {
                    console.log('Upload progress:', progress);
                    setUploadProgress(progress);
                },
                onError: (errorMessage) => {
                    console.error('Upload error:', errorMessage);
                    setError(prevError => ({
                        ...prevError,
                        imageError: errorMessage
                    }));
                    // Clear local image URL on error
                    setLocalImageUrl(null);
                }
            });

            console.log('Imagen cargada exitosamente. Ruta recibida:', imagePath);

            // Generate a new timestamp for this specific upload
            imageTimestampRef.current = Date.now();

            // Update user data with new image path
            const updatedUser = {
                ...currentUser,
                image_user: imagePath
            };

            console.log('Actualizando usuario con nueva imagen:', updatedUser);

            // Guardar en localStorage para persistencia entre recargas
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Actualizar el estado global
            setCurrentUser(updatedUser);
            
            // Limpiamos cualquier error previo
            setError(prevError => ({ ...prevError, imageError: '' }));
            
            // Mantener la URL local un poco más para asegurar una transición suave
            setTimeout(() => {
                setLocalImageUrl(null);
                console.log('URL local liberada, usando imagen del servidor');
            }, 2000); // Aumentamos a 2 segundos para dar más tiempo
            
        } catch (err) {
            console.error('Error en la carga de imagen:', err);
            setError(prevError => ({
                ...prevError,
                imageError: err.message || "Error al subir el archivo"
            }));
            // Clear local image URL on error
            setLocalImageUrl(null);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const getImageUrl = (imagePath) => {
        // If we have a local image URL (from recent upload), use that first
        if (localImageUrl) {
            console.log('Using local image URL for immediate display:', localImageUrl);
            return localImageUrl;
        }
        
        if (!imagePath) {
            console.error('-> UserInfoCardFunctions - getImageUrl() - No se ha proporcionado una ruta de imagen');
            return null;
        }
        
        // Get the formatted base URL
        const formattedUrl = formatImageUrl(imagePath);
        
        // Only add the timestamp param if we have uploaded a new image
        if (imageTimestampRef.current) {
            const urlWithCache = formattedUrl + (formattedUrl.includes('?') ? '&' : '?') + '_t=' + imageTimestampRef.current;
            return urlWithCache;
        }
        
        // Regular use case - just return the formatted URL
        return formattedUrl;
    };

    return {
        getImageUrl,
        handleImageUpload,
        uploadProgress,
        localImageUrl
    };
};