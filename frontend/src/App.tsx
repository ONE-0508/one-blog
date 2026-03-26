import AppRouter from './routes';
import { AuthProvider } from './stores/auth-store';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
