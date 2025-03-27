import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import styles from '../../../../public/css/TopBar.module.css';
import { TopBarUtils } from './TopBarUtils.jsx';
import { ArrowLeft, DoorClosed } from 'lucide-react';
import { useUI } from '../../app_context/UIContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import ErrorCard from './components/error_card/ErrorCard.jsx';
import SuccessCard from './components/success_card/SuccessCard.jsx';
import UserInfoCard from './components/user_info_card/UserInfoCard.jsx';
import InfoCard from './components/info_card/InfoCard.jsx';
import ImageModal from '../image_modal/ImageModal.jsx';
import { topBarAnimation } from '../../utils/animation/transitions.js';

function TopBar() {
  // Using useUI and useShop hooks instead of AppContext
  const {
    error,
    success,
    info,
  } = useUI();
  
  const {
    showShopCreationForm, 
    selectedShop,
  } = useShop();
  
  const {
    handleBack,
    clearUserSession
  } = TopBarUtils();

  // 🎭 UPDATE: Added state and animation for expandable TopBar
  const [isExpanded, setIsExpanded] = useState(false);
  
  const springProps = useSpring({
    ...(isExpanded ? topBarAnimation.expanded : topBarAnimation.collapsed),
    config: topBarAnimation.config
  });

  const handleContainerClick = (e) => {
    // Only toggle if clicking directly on the container, not on child elements
    if (e.target === e.currentTarget) {
      setIsExpanded(prev => !prev);
    }
  };

  return (
    <animated.div 
      className={styles.container}
      style={springProps}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onClick={handleContainerClick}
    >
      <ImageModal />
      
      <div className={styles.messageWrapper}>
          {error && <ErrorCard />}
          {success && <SuccessCard />}
          {info && <InfoCard />}
      </div>
      
      <div className={styles.contentWrapper}>
          {(selectedShop || showShopCreationForm) && (
            <button
              className={styles.backButton}
              onClick={handleBack}
              title="Volver"
            >
                <ArrowLeft size={16} />
            </button>
          )}

          <UserInfoCard />

          <button 
            type="button" 
            className={styles.logoutButton} 
            onClick={clearUserSession}
            title="Cerrar sesión"
          >
              Cerrar
              <DoorClosed size={16}/>
          </button>
      </div>
    </animated.div>
  );
}

export default TopBar;