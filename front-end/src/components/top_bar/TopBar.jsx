import React, { useContext } from 'react';
import styles from '../../../../public/css/TopBar.module.css';
import { TopBarUtils } from './TopBarUtils.jsx';
import { ArrowLeft, DoorClosed } from 'lucide-react';
import AppContext from '../../app_context/AppContext.js';
import ErrorCard from './components/error_card/ErrorCard.jsx';
import SuccessCard from './components/success_card/SuccessCard.jsx';
import UserInfoCard from './components/user_info_card/UserInfoCard.jsx';
import InfoCard from './components/info_card/InfoCard.jsx';

function TopBar() {
  const {
    error,
    success,
    info,
    showShopCreationForm, 
    selectedShop,
  } = useContext(AppContext);
  
  const {
    handleBack,
    clearUserSession
  } = TopBarUtils();

  return (
    <div className={styles.container}>
    
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
    </div>
  );
}

export default TopBar;