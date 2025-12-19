import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Agendar from "./pages/User/Agendar.jsx";
import LoginUser from "./pages/User/LoginUser.jsx";
import MeusAgendamentos from "./pages/User/MeusAgendamentos.jsx";

import "./App.css";

console.log("Ambiente:", import.meta.env.MODE);
console.log("URL da API:", import.meta.env.VITE_API_URL);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/arena/:id" element={<Agendar />} />
        <Route path="/loginUser" element={<LoginUser />} />
        <Route path="/MeusAgendamentos" element={<MeusAgendamentos />} />
        <Route path="/" element={<h1>Bem-vindo ao Arena Hub</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
