import React, { useContext, useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';

import AppContext from '../../app_context/AppContext.js';
import UserManagement from "../user_management/UserManagement.jsx";
import ShopManagement from "../shop_management/ShopManagement.jsx";
// import ShopsByType from "../user_management/shops_by_type/ShopsByType.jsx";

import { LoginRegisterFunctions } from './LoginRegisterFunctions.jsx';
import { FormFields } from './FormFields.jsx';
import { KeyboardSection } from './KeyboardSection';
import { FormActions } from './FormActions';

import styles from '../../../../public/css/LoginRegisterForm.module.css';
import { fadeInScale } from '../../utils/animation/transitions.js';

const LoginRegisterForm = () => {
  const {
    currentUser,
    showShopManagement,
    type_user,
  } = useContext(AppContext);

  // Add debugging logs to track component render decisions
  useEffect(() => {
    console.log('LoginRegisterForm mounted/updated with:', {
      currentUser,
      showShopManagement,
      type_user
    });
  }, [currentUser, showShopManagement, type_user]);

  const transitions = useTransition(!showShopManagement && !currentUser, fadeInScale);

  // Si el usuario está logueado o showShopManagement es true, redireccionamos según el tipo de usuario
  if (showShopManagement || currentUser) {
    console.log('Routing user based on type:', type_user);
    
    // Force a direct check of user type regardless of state race conditions
    // This is critical - we prefer the concrete value stored in currentUser if available
    const userType = currentUser?.type_user || type_user;
    console.log('Determined userType for routing:', userType);
    
    if (userType === 'seller') {
      console.log('Rendering ShopManagement for seller');
      // Los vendedores ven ShopManagement, que a su vez renderizará ShopsListBySeller
      return <ShopManagement />;
    } else if (userType === 'user') {
      console.log('Rendering UserManagement for user');
      // Los usuarios regulares ven UserManagement para seleccionar tipo de comercio
      return <UserManagement />;
    } else {
      console.log('Rendering UserManagement for other type or unknown type:', userType);
      // Otros tipos usan el componente general de manejo de tiendas
      // return <AdminManagement />;
    }
  }

  return transitions((style, show) =>
    show && (
      <animated.div style={style} className={styles.container}>
          <div className={styles.formContainer}>
              <FormActions />
              <div className={styles.formContentWrapper}>
                  <FormContent />
              </div>
          </div>
      </animated.div>
    )
  );
};

const FormContent = () => {
  const { handleFormSubmit } = LoginRegisterFunctions();
  return (
    <form className={styles.formContent} onSubmit={handleFormSubmit}>
      <FormFields />
      <KeyboardSection />
    </form>
  );
};

export default LoginRegisterForm;