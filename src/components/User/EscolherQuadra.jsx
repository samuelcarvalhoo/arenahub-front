import "./EscolherQuadra.css";

import { useState, useEffect } from "react";
import MapaArena from "../../public/MapaArena.png";
import "./EscolherQuadra.css";

const EscolherQuadra = ({ data, updateFieldHandler, autoadvance, arenaId }) => {
  const [quadras, setQuadras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuadras = async () => {
      if (!arenaId) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/quadra/arena/${arenaId}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar quadras');
        }
        const data = await response.json();
        setQuadras(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuadras();
  }, [arenaId]);

  const handleRadioChange = (e) => {
    updateFieldHandler("id_quadra", e.target.value);
    autoadvance();
  };

  const handleLabelClick = (value) => {
    if (data.id_quadra === value) {
      autoadvance();
    }
  };

  if (loading) return <p>Carregando quadras...</p>;
  if (error) return <p>Erro ao carregar quadras: {error}</p>;

  return (
    <div className="escolher-quadra-container">

      <div className="escolher-quadra-main">

        <div className="quadras-grid">
          {quadras.length > 0 ? (
            quadras.map((quadra) => {
              const idQ = quadra.id_quadra || quadra.id;
              return (
                <div key={idQ} className="QuadraCard">
                  <div className="QuadraCard-left">
                    <div className="QuadraCard-thumb">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" style={{ margin: "20px auto", display: "block" }}>
                        <rect x="3" y="3" width="18" height="14" rx="2" stroke="#999" strokeWidth="1.5" fill="none" />
                        <circle cx="8" cy="9" r="2" fill="#999" />
                        <path d="M3 15l5-4 4 3 5-4 4 3v4H3v-2z" fill="#999" />
                      </svg>
                    </div>
                  </div>

                  <div className="QuadraCard-body">
                    <h3 className="QuadraCard-title">
                      {quadra.nome || quadra.nome_quadra || `Quadra ${idQ}`}
                    </h3>
                    <p className="QuadraCard-desc">
                      {quadra.descricao || "Descrição da quadra"}
                    </p>
                    <p className="QuadraCard-price">
                      R$ {quadra.valor_hora ? parseFloat(quadra.valor_hora).toFixed(2) : "XX,XX"} / hora
                    </p>
                  </div>

                  <div className="QuadraCard-right">
                    <button
                      className="QuadraCard-btn"
                      onClick={() => {
                        const idCliente = localStorage.getItem("id_cliente");
                        if (!idCliente) {
                          localStorage.setItem('redirectAfterLogin', window.location.pathname);
                          window.location.href = '/loginUser';
                          return;
                        }

                        const quadraId = quadra.id_quadra;

                        if (!quadraId) {
                          console.error("ID da quadra não encontrado no objeto:", quadra);
                          alert("Erro: ID da quadra não identificado.");
                          return;
                        }

                        updateFieldHandler("id_quadra", quadraId);
                        updateFieldHandler("quadra_valor_hora", quadra.valor_hora);
                        autoadvance();
                      }}
                    >
                      Visualizar horários
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <p>Nenhuma quadra encontrada para esta arena.</p>
          )}
        </div>

        <div className="dividi"> 
          <aside className="arena-info-sidebar">
            <div className="arena-map" style={{ position: 'relative' }}>
              <a
                href="https://www.google.com/maps/search/?api=1&query=R.+Guararapes,+660+-+Monte+Castelo,+Contagem+-+MG,+32285-090"
                target="_blank"
                rel="noopener noreferrer"
                title="Ver no Google Maps"
                style={{ display: 'block', cursor: 'pointer', position: 'relative' }}
              >
                <img
                  src={MapaArena}
                  alt="Mapa da Arena Vegas Sport Beer"
                  className="arena-map-image"
                  style={{ display: 'block', width: '100%' }}
                />

                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    pointerEvents: 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'}
                />
              </a>
            </div>

            <div className="arena-details">
              <h2 className="arena-title">Arena Vegas Sport Beer</h2>
              <div className="arena-address">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#666" />
                </svg>
                <span>R. Guararapes, 660 - Monte Castelo, Contagem - MG, 32285-090</span>
              </div>
            </div>

            <div className="arena-about">
              <h3 className="about-title">SOBRE NÓS</h3>
              <p className="about-text">
                Bem-vindo à Arena Vegas.<br />
                Texto falando um pouco sobre a Arena.
              </p>
            </div>

            <div className="arena-contact">
              <div className="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#666" />
                </svg>
                <span>(31) 99598-4509</span>
              </div>
            </div>

            <div className="arena-schedule">
              <div className="schedule-item">
                <span className="day">Segunda</span>
                <span className="hours">16:00 - 00:00</span>
              </div>
              <div className="schedule-item">
                <span className="day">Terça-Feira</span>
                <span className="hours">16:00 - 00:00</span>
              </div>
              <div className="schedule-item">
                <span className="day">Quarta-Feira</span>
                <span className="hours">16:00 - 00:00</span>
              </div>
              <div className="schedule-item">
                <span className="day">Quinta-Feira</span>
                <span className="hours">16:00 - 00:00</span>
              </div>
              <div className="schedule-item">
                <span className="day">Sexta-Feira</span>
                <span className="hours">16:00 - 00:00</span>
              </div>
              <div className="schedule-item">
                <span className="day">Sábado</span>
                <span className="hours">07:00 - 21:00</span>
              </div>
              <div className="schedule-item">
                <span className="day">Domingo</span>
                <span className="hours">07:00 - 14:00</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EscolherQuadra;