import React, { useEffect } from 'react';
import { useProduct } from '../../../../../../app_context/ProductContext.jsx';
import { X, Star, ShoppingCart, Tag, Calendar, Package, MapPin, Globe } from 'lucide-react';
import styles from '../../../../../../../../public/css/ProductCard.module.css';
import { formatImageUrl } from '../../../../../../utils/image/imageUploadService.js';

// UPDATE: Refactored to use specialized context hooks instead of AppContext
const ProductCard = ({ onClose }) => {
  const { selectedProductDetails, setSelectedProductDetails } = useProduct();

  useEffect(() => {
    // Cleanup function
    return () => {
      // Reset selected product when component unmounts
      setSelectedProductDetails(null);
    };
  }, [setSelectedProductDetails]);

  if (!selectedProductDetails) {
    return null;
  }

  const {
    name_product,
    price_product,
    sold_product,
    discount_product,
    season_product,
    type_product,
    subtype_product,
    info_product,
    calification_product,
    image_product,
    country_product,
    locality_product
  } = selectedProductDetails;

  // Calculate discounted price if there's a discount
  const discountedPrice = discount_product > 0 
    ? (price_product - (price_product * discount_product / 100)).toFixed(2) 
    : null;

  // Create stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullRating = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullRating) {
        stars.push(<Star key={i} className={styles.starFilled} size={18} fill="gold" stroke="gold" />);
      } else if (i === fullRating && hasHalfStar) {
        stars.push(<Star key={i} className={styles.starHalf} size={18} fill="gold" stroke="gold" />);
      } else {
        stars.push(<Star key={i} className={styles.starEmpty} size={18} stroke="gray" />);
      }
    }
    
    return stars;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.productCard}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className={styles.cardContent}>
          <div className={styles.imageContainer}>
            {image_product ? (
              <img 
                src={formatImageUrl(image_product)} 
                alt={name_product} 
                className={styles.productImage} 
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src);
                  e.target.style.display = 'none';
                  // Show fallback content
                  const fallback = document.createElement('div');
                  fallback.className = styles.noImage;
                  fallback.innerHTML = `<Package size="60" /><p>Sin imagen</p>`;
                  e.target.parentNode.appendChild(fallback);
                }}
              />
            ) : (
              <div className={styles.noImage}>
                <Package size={60} />
                <p>Sin imagen</p>
              </div>
            )}
          </div>
          
          <div className={styles.productInfo}>
            <h2 className={styles.productName}>{name_product}</h2>
            
            <div className={styles.ratingContainer}>
              {renderStars(calification_product)}
              <span className={styles.ratingText}>
                {calification_product.toFixed(1)}
              </span>
            </div>
            
            <div className={styles.priceContainer}>
              {discount_product > 0 ? (
                <>
                  <span className={styles.originalPrice}>€{Number(price_product).toFixed(2)}</span>
                  <span className={styles.discountedPrice}>€{discountedPrice}</span>
                  <span className={styles.discountBadge}>-{discount_product}%</span>
                </>
              ) : (
                <span className={styles.price}>€{Number(price_product).toFixed(2)}</span>
              )}
            </div>
            
            <div className={styles.soldInfo}>
              <ShoppingCart size={18} />
              <span>Vendidos: {sold_product}</span>
            </div>  
            
            <div className={styles.categoryInfo}>
              <div className={styles.infoItem}>
                <Tag size={18} />
                <span>Tipo: {type_product}</span>
              </div>
              
              {subtype_product && (
                <div className={styles.infoItem}>
                  <Tag size={18} />
                  <span>Subtipo: {subtype_product}</span>
                </div>
              )}
              
              <div className={styles.infoItem}>
                <Calendar size={18} />
                <span>Temporada: {season_product}</span>
              </div>

              {/* Nuevos campos de origen */}
              {country_product && (
                <div className={styles.infoItem}>
                  <Globe size={18} />
                  <span>País de origen: {country_product}</span>
                </div>
              )}
              
              {locality_product && (
                <div className={styles.infoItem}>
                  <MapPin size={18} />
                  <span>Localidad: {locality_product}</span>
                </div>
              )}
            </div>
            
            {info_product && (
              <div className={styles.description}>
                <h3>Información adicional:</h3>
                <p>{info_product}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;