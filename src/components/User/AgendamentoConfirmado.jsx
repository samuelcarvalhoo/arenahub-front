import { calcularHorarioFinal } from "../../utils/timeUtils";
import "./AgendamentoConfirmado.css";

const AgendamentoConfirmado = ({ data }) => {
  return (
    <div>
      <div className="agendamento-container">
        <svg
          width="100"
          height="100"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="80" height="80" rx="40" fill="#74AC3D" />
          <path
            d="M63.5 24L31.1875 56L16.5 41.4545"
            stroke="white"
            stroke-width="4.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div className="agendamento-info">
          <h3>Agendamento confirmado com sucesso!</h3>
          <p>Te esperamos na quadra: {data.nome_quadra}, no dia: {data.dia} às: {data.horario} até: {calcularHorarioFinal(data.horario, data.duracao)}</p>
        </div>
      </div>
    </div>
  );
};

export default AgendamentoConfirmado;
