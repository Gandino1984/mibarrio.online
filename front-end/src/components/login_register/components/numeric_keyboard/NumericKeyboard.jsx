import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { useNumericKeyboardUtils } from './useNumericKeyboardUtils.jsx';
import { Delete, Eraser } from 'lucide-react';
import styles from '../../../../../../public/css/NumericKeyboard.module.css';
import { Banana, Apple, Bean, Beef, Carrot, Beer, Croissant, Drill, Dog, Fish, Drumstick, Gift, Gem, Ham, Palette, Printer, Wrench, Car, Scissors, HeartPulse, BookMarked, Mouse, Cpu, Laptop, Smile, ChefHat, Laugh, Lollipop, Cake, Pizza, ShoppingBasket, Speaker, Amphora, ConciergeBell, Flower, Baby, Shirt, Watch, Sandwich } from 'lucide-react';

// Move the icons array outside the component to prevent recreation on each render
const iconComponents = [Banana, Apple, Bean, Beef, Carrot, Beer, Croissant, Drill, Dog, Fish, Drumstick, Gift, Gem, Ham, Palette, Printer, Wrench, Car, Scissors, HeartPulse, BookMarked, Mouse, Cpu, Laptop, Smile, ChefHat, Laugh, Lollipop, Cake, Pizza, ShoppingBasket, Speaker, Amphora, ConciergeBell, Flower, Baby, Shirt, Watch, Sandwich];

const NumericKeyboard = ({ 
  value, 
  onChange, 
  showMaskedPassword = true, 
  onPasswordComplete   
}) => {
  const { 
    displayedPassword,
    setDisplayedPassword,
    passwordIcons, 
    setPasswordIcons,
    clearUserSession
  } = useAuth();

  const { 
    error,
    setError 
  } = useUI();

  // Use useMemo to memoize the icons array
  const icons = useMemo(() => iconComponents, []);
  
  useEffect(() => {
    if (showMaskedPassword) {
      if (passwordIcons.length < value.length) {
        const newIcons = Array(value.length - passwordIcons.length).fill().map(() => icons[Math.floor(Math.random() * icons.length)]);
        setPasswordIcons([...passwordIcons, ...newIcons]);
      } else if (passwordIcons.length > value.length) {
        setPasswordIcons(passwordIcons.slice(0, value.length));
      }
    } else {
      setPasswordIcons([]);
    }
  }, [value, showMaskedPassword, passwordIcons, setPasswordIcons, icons]);

  useEffect(() => {
    if (showMaskedPassword) {
      setDisplayedPassword(passwordIcons.map((Icon, index) => <Icon key={index} size={18} />));
    } else {
      setDisplayedPassword(value);
    }
  }, [passwordIcons, showMaskedPassword, value, setDisplayedPassword]);

  const {
    handleKeyClick,
    handleBackspace,
  } = useNumericKeyboardUtils(value, onChange, onPasswordComplete);

  const handleBackspaceClick = (event) => {
    handleBackspace(event);
    if (error) {
      setError(prevError => ({ ...prevError, passwordError: "" }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.passwordDisplay}>
        {displayedPassword}
      </div>

      <div className={styles.keyboard}>
        <div className={styles.row}>
          {[1, 2, 3].map(num => (
            <button 
              key={num} 
              className={styles.key} 
              onClick={(e) => handleKeyClick(num.toString(), e)}
            >
              {num}
            </button>
          ))}
        </div>
        <div className={styles.row}>
          {[4, 5, 6].map(num => (
            <button 
              key={num} 
              className={styles.key} 
              onClick={(e) => handleKeyClick(num.toString(), e)}
            >
              {num}
            </button>
          ))}
        </div>
        <div className={styles.row}>
          {[7, 8, 9].map(num => (
            <button 
              key={num} 
              className={styles.key} 
              onClick={(e) => handleKeyClick(num.toString(), e)}
            >
              {num}
            </button>
          ))}
        </div>
        <div className={styles.row}>
          <button 
            className={`${styles.key} ${styles.zero}`} 
            onClick={(e) => handleKeyClick('0', e)}
          >
            0
          </button>
          <button 
            className={`${styles.key} ${styles.clear}`} 
            onClick={(e) => handleBackspaceClick(e)}
            title="Borrar"
          >
            <Delete size={16} />
          </button>
          <button 
            className={styles.key} 
            onClick={clearUserSession}
            title="Borrar todo"
          >
            <Eraser size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Add PropTypes validation
NumericKeyboard.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  showMaskedPassword: PropTypes.bool,
  onPasswordComplete: PropTypes.func.isRequired
};

export default NumericKeyboard;