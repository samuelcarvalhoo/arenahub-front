import EscolherQuadra from "../../components/User/EscolherQuadra.jsx";
import EscolherData from "../../components/User/EscolherData.jsx";
import EscolherHorario from "../../components/User/EscolherHorario.jsx";
import ConfirmarAgendamento from "../../components/User/ConfirmarAgendamento.jsx"; 
import AgendamentoConfirmado from "../../components/User/AgendamentoConfirmado.jsx";
import Steps from "../../components/User/Steps.jsx";
import HeaderUser from "../../components/User/HeaderUser.jsx"
import { calcularHorarioFinal } from "../../utils/timeUtils.js";

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

import { useForm } from "../../hooks/useForm.jsx";

import "../../App.css";
import "./Agendar.css";

const formTemplate = {
  id_quadra: "",
  nome_quadra: "",
  id_cliente: "",
  dia: "",
  inicio: "",
  fim: "",
  valor: "",
};

function Agendar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(formTemplate);
  const [error, setError] = useState(null);
  const [arenaRealId, setArenaRealId] = useState(null);

  console.log("Agendar State Data:", data);

  useEffect(() => {
      const resolveArenaId = async () => {
          if (!isNaN(id)) {
              setArenaRealId(id);
              return;
          }
          
          try {
               const response = await fetch(`${import.meta.env.VITE_API_URL}/arena`);
             if (response.ok) {
                 const arenas = await response.json();
                 const found = arenas.find(a => a.slug === id || a.nome === id || a.nome_arena === id);
                 if (found) {
                     setArenaRealId(found.id || found.id_arena);
                     console.log("Arena Slug resolvida para ID:", found.id || found.id_arena);
                 } else {
                     console.warn("Arena não encontrada pelo slug:", id);
                     setArenaRealId(id); 
                 }
             }
          } catch (e) {
              console.error("Erro ao resolver slug da arena:", e);
              setArenaRealId(id);
          }
      };

      if (id) resolveArenaId();
  }, [id]);


  const updateFieldHandler = (key, value) => {
    setData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const createAgendamento = async () => {
      setError(null);
      const horarioFinal = calcularHorarioFinal(data.horario, data.duracao);
      
      try {
          const storedIdCliente = localStorage.getItem("id_cliente");
          console.log("Creating appointment. Stored ID Cliente (raw):", storedIdCliente);

          if (!storedIdCliente) {
              const errorMsg = "Sessão expirada ou usuário não identificado. Faça login novamente.";
              console.error(errorMsg);
              setError(errorMsg); 
              return; 
          }

          const idClienteNumber = Number(storedIdCliente);

          if (isNaN(idClienteNumber)) {
             const errorMsg = "ID do cliente inválido no armazenamento local.";
             console.error(errorMsg);
             setError(errorMsg);
             return;
          }

          const response = await fetch(`${import.meta.env.VITE_API_URL}/agendamentos`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
              },
              body: JSON.stringify({
                  "id_quadra": data.id_quadra,
                  "id_cliente": idClienteNumber,
                  "dia": data.dia,
                  "inicio": data.horario,
                  "fim": horarioFinal,
                  "valor_total": 150
              }),
          });

          const result = await response.json();

          if (!response.ok) {
              throw new Error(result.error || result.message || "Erro ao criar agendamento");
          }

          console.log(result);
          changeStep(currentStep + 1);

      } catch (error) {
          console.error('Erro ao criar agendamento:', error);
          setError(error.message);
      }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 3) { 
        createAgendamento();
    } else {
        changeStep(currentStep + 1, e);
    }
  };

  const formComponents = [
    <EscolherQuadra
      key="quadra"
      data={data}
      updateFieldHandler={updateFieldHandler}
      autoadvance = {() => changeStep(currentStep + 1)}
      arenaId={arenaRealId || id}
    />,
    <EscolherData
      key="data"
      data={data}
      updateFieldHandler={updateFieldHandler}
    />,
    <EscolherHorario
      key="horario" 
      data={data}
      updateFieldHandler={updateFieldHandler}
      arenaId={arenaRealId || id}
    />,
    <ConfirmarAgendamento
      key="confirmar"
      data={data}
      updateFieldHandler={updateFieldHandler}
    />,
    <AgendamentoConfirmado
      key="confirmado"
      data={data}
    />,
  ];

  const {
    currentStep,
    currentComponent,
    changeStep,
    isLastStep,
    isFirstStep,
  } = useForm(formComponents);

  return (
    <div className="app">
        <HeaderUser paginaAtual="agendar" />
      <div className="form-container">
        <form onSubmit={handleFormSubmit}>
      {currentStep > 0 && <Steps currentStep={currentStep} id_quadra={data.id_quadra} arenaId={arenaRealId || id} />}
          <div className="inputs-container">
              {currentComponent}
              {error && currentStep === 3 && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
          </div>

          <div className="actions">
            {!isFirstStep && (
              <button
                type="button"
                onClick={() => isLastStep ? changeStep(0) : changeStep(currentStep - 1)}
              >
                <span>{isLastStep ? "Novo Agendamento" : "Voltar"}</span>
              </button>
            )}

            {!isLastStep && !isFirstStep && (
              <button 
               className="button-confirm"
                type="submit"
                disabled={
                    (currentStep === 1 && !data.dia) || 
                    (currentStep === 2 && !data.horario)
                }
                style={{
                    opacity: (currentStep === 1 && !data.dia) || (currentStep === 2 && !data.horario) ? 0.5 : 1,
                    cursor: (currentStep === 1 && !data.dia) || (currentStep === 2 && !data.horario) ? 'not-allowed' : 'pointer'
                }}
              >
                <span>{currentStep === 3 ? "Confirmar Agendamento" : "Avançar"}</span>
              </button>
            )}
            {currentStep === 4 && (
              <button
                type="button"
                onClick={() => navigate("/MeusAgendamentos")}
              >
                <span>Meus agendamentos</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Agendar;
