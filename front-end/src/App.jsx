import { AppContextProvider } from "./app_context/AppContextProvider.jsx";
import styles from '../../public/css/App.module.css';
import '../../public/css/App.css'; // Keep this for global style
import LoginRegisterForm from "../src/components/login_register/LoginRegisterForm.jsx";
import TopBar from "../src/components/top_bar/TopBar.jsx";
import ConfirmationModal from "../src/components/confirmation_modal/ConfirmationModal.jsx";

function App() {
  return (
    <AppContextProvider>
      <div className={styles.mainContainer}>
        <ConfirmationModal />
        <TopBar />
        <LoginRegisterForm />
      </div>
    </AppContextProvider>
  )
}

export default App;