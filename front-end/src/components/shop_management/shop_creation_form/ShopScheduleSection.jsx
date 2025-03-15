import React, { useContext, useState, useEffect } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopCreationForm.module.css';
import { Clock } from 'lucide-react';

const ShopScheduleSection = () => {
  const { 
    newShop, 
    setNewShop,
    selectedShop
  } = useContext(AppContext);

  const [hasContinuousSchedule, setHasContinuousSchedule] = useState(false);

  // Initialize schedule type based on selected shop data
  useEffect(() => {
    if (selectedShop) {
      const shopHasContinuousSchedule = !selectedShop.morning_close || !selectedShop.afternoon_open;
      setHasContinuousSchedule(shopHasContinuousSchedule);
    }
  }, [selectedShop]);

  const handleScheduleTypeChange = (e) => {
    const isContinuous = e.target.checked;
    setHasContinuousSchedule(isContinuous);
    
    if (isContinuous) {
      // If changed to continuous schedule, clear morning closing and afternoon opening fields
      setNewShop(prev => ({
        ...prev,
        morning_close: '',
        afternoon_open: ''
      }));
    } else {
      // If changed back to split schedule, initialize morning_close and afternoon_open
      // with default values to avoid validation errors
      setNewShop(prev => ({
        ...prev,
        morning_close: prev.morning_close || '14:00',
        afternoon_open: prev.afternoon_open || '16:00'
      }));
    }
  };

  return (
    <section className={styles.scheduleContainer}>
      {/* Toggle for continuous or split schedule */}
      <div className={styles.scheduleTypeToggle}>
        <input 
          type="checkbox"
          id="continuous-schedule"
          checked={hasContinuousSchedule}
          onChange={handleScheduleTypeChange}
        />
        <label htmlFor="continuous-schedule" className={styles.scheduleToggleLabel}>
          <Clock size={16} />
          Horario continuo (sin periodo de descanso)
        </label>
      </div>
    
      <div className={styles.schedulesContainer}>
        {hasContinuousSchedule ? (
          // Continuous schedule: only show opening and closing
          <div className={styles.scheduleSimple}>
            <h4 className={styles.scheduleTitle}>Horario de apertura y cierre</h4>
            <div className={styles.scheduleFields}>
              <div className={styles.timeFieldGroup}>
                <label className={styles.timeFieldLabel}>Abre:</label>
                <input
                  type="time"
                  value={newShop.morning_open || ''}
                  onChange={(e) => setNewShop({...newShop, morning_open: e.target.value})}
                  className={styles.timeInput}
                  required
                />
              </div>
              
              <div className={styles.timeFieldGroup}>
                <label className={styles.timeFieldLabel}>Cierra:</label>
                <input
                  type="time"
                  value={newShop.afternoon_close || ''}
                  onChange={(e) => setNewShop({...newShop, afternoon_close: e.target.value})}
                  className={styles.timeInput}
                  required
                />
              </div>
            </div>
          </div>
        ) : (
          // Schedule with rest period: show all 4 fields
          <>
            <div>
              <h4 className={styles.scheduleTitle}>Horario de la mañana</h4>
              <div className={styles.scheduleFields}>
                <input
                  type="time"
                  value={newShop.morning_open || ''}
                  onChange={(e) => setNewShop({...newShop, morning_open: e.target.value})}
                  className={styles.timeInput}
                  required
                />
                <span>a</span>
                <input
                  type="time"
                  value={newShop.morning_close || ''}
                  onChange={(e) => setNewShop({...newShop, morning_close: e.target.value})}
                  className={styles.timeInput}
                  required
                />
              </div>
            </div>

            <div>
              <h4 className={styles.scheduleTitle}>Horario de la tarde</h4>
              <div className={styles.scheduleFields}>
                <input
                  type="time"
                  value={newShop.afternoon_open || ''}
                  onChange={(e) => setNewShop({...newShop, afternoon_open: e.target.value})}
                  className={styles.timeInput}
                  required
                />
                <span>a</span>
                <input
                  type="time"
                  value={newShop.afternoon_close || ''}
                  onChange={(e) => setNewShop({...newShop, afternoon_close: e.target.value})}
                  className={styles.timeInput}
                  required
                />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ShopScheduleSection;