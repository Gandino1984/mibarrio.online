import React, { memo, useState, useEffect, useRef } from 'react';
import { Camera, Loader } from 'lucide-react';
import { useShop } from '../../../../../../app_context/ShopContext.jsx';
import { ShopCoverImageUtils } from './ShopCoverImageUtils.jsx';
import styles from '../../../../../../../../public/css/ShopCoverImage.module.css';

const ShopCoverImage = ({ id_shop }) => {
  // Using useShop hook instead of AppContext
  const { selectedShop, shops } = useShop();
  const [imageKey, setImageKey] = useState(Date.now()); // Force re-render when needed
  const fileInputRef = useRef(null); // 🖱️ UPDATE: Added ref for direct file input access
  
  const {
    handleContainerClick,
    handleUploadButtonClick,
    handleImageUpload,
    getShopCoverUrl,
    uploading,
    uploadProgress,
    localImageUrl,
    lastUpdated
  } = ShopCoverImageUtils();

  const shop = shops.find(s => s.id_shop === id_shop);
  const isSelected = selectedShop?.id_shop === id_shop;
  
  // Solo actualizar la clave de imagen cuando realmente sea necesario
  useEffect(() => {
    const newKey = Date.now();
    setImageKey(newKey);
  }, [shop?.image_shop, localImageUrl, lastUpdated]);
  
  // Reducir registro de logs innecesarios
  useEffect(() => {
    if (isSelected && shop?.image_shop) {
      console.log(`Selected shop ${id_shop} image path:`, getShopCoverUrl(shop.image_shop));
    }
  }, [isSelected, shop?.image_shop, getShopCoverUrl, id_shop]);

  // 🖱️ UPDATE: New direct click handler for one-click upload
  const handleDirectClick = (e) => {
    if (isSelected && !uploading && fileInputRef.current) {
      e.stopPropagation();
      fileInputRef.current.click();
    }
  };

  // Get the appropriate image URL with fallbacks
  const getImageSource = () => {
    // First check if there's a local image URL from a recent upload
    if (localImageUrl) {
      return localImageUrl;
    }
    
    // Then try to get the formatted URL from the server path
    if (shop?.image_shop) {
      return getShopCoverUrl(shop.image_shop);
    }
    
    // If the selected shop has a different image path, use that as a fallback
    if (isSelected && selectedShop?.image_shop) {
      return getShopCoverUrl(selectedShop.image_shop);
    }
    
    return null;
  };

  const imageSource = getImageSource();

  return (
    // Added aspect-ratio container to maintain consistent 800x300 (2.67:1) ratio
    <div className={styles.container}>
      <div 
        className={`${styles.imageWrapper} ${isSelected ? styles.selectedShop : ''}`}
        onClick={handleDirectClick} // 🖱️ UPDATE: Changed to direct click handler
      >
        {imageSource ? (
          <img
            key={`shop-cover-${id_shop}-${imageKey}`} // Force image reload when key changes
            src={imageSource}
            alt={`${shop?.name_shop || 'Shop'} cover`}
            className={styles.image}
          />
        ) : (
          <div className={styles.noImage}>
            <span className={styles.noImageText}>
              {isSelected ? 'Imagen de portada' : 'No hay imagen'}
            </span>
          </div>
        )}

        {/* 🖱️ UPDATE: Hidden file input that's directly triggered on container click */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          onChange={(e) => handleImageUpload(e, id_shop)}
          className={styles.fileInput}
          id={`shop-cover-input-${id_shop}`}
          disabled={uploading}
        />

        {uploading && (
          <div className={styles.loader}>
            <Loader size={24} className={styles.loaderIcon} />
            {uploadProgress > 0 && (
              <div className={styles.progressContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span className={styles.progressText}>{uploadProgress}%</span>
              </div>
            )}
          </div>
        )}
        
        {isSelected && !uploading && (
          <div className={styles.editOverlay}>
            <Camera size={20} className={styles.editIcon} />
            <span className={styles.editText}>{shop?.image_shop ? 'Cambiar imagen' : 'Subir imagen'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Mejorar la función de comparación de memoización para evitar rerenderizados innecesarios
export default memo(ShopCoverImage, (prevProps, nextProps) => {
  // Solo re-renderizar cuando cambia el ID de la tienda
  return prevProps.id_shop === nextProps.id_shop;
});