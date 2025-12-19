"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Header from '../../components/User/HeaderUser.jsx';
import ReservationCard from '../../components/User/ReservationCard.jsx';
import EmptyState from '../../components/User/EmptyState.jsx';
import "./MeusAgendamentos.css";

function formatarData(dataStr) {
  const data = new Date(dataStr);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function formatarPreco(preco) {
  return `R$ ${Number(preco).toFixed(2).replace('.', ',')}`;
}

export default function Page() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;
  // const CLIENTE_ID = process.env.NEXT_PUBLIC_CLIENTE_ID; // Removido, usando localStorage

  const carregar = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const clientId = localStorage.getItem("id_cliente");
        if (!clientId) {
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = '/loginUser';
            setLoading(false);
            return; // Bloqueia execução
        }

        // Validação extra: verifica se é um número válido, similar ao Agendar.jsx
        if (isNaN(Number(clientId))) {
            console.error("ID do cliente inválido no localStorage:", clientId);
            setError("Identificação do usuário inválida. Faça login novamente.");
            setLoading(false);
            return;
        }

        // Endpoint existente: /agendamentos/user/:id
        const res = await fetch(`${import.meta.env.VITE_API_URL}/agendamentos/user/${clientId}`);
        
        if (!res.ok) throw new Error(`Erro ao buscar agendamentos (${res.status})`);
        
        const ags = await res.json();

        const reservasFmt = ags.map((a) => {
          const inicio = typeof a.inicio === 'string' ? a.inicio.slice(0,5) : a.inicio;
          const fim = typeof a.fim === 'string' ? a.fim.slice(0,5) : a.fim;
          return {
            id: a.id,
            usuario_id: a.id_cliente,
            quadra_nome: `Quadra ${a.id_quadra}`, // Backend não retorna nome ainda
            quadra_imagem: null,
            quadra_endereco: 'Arena Hub', // Placeholder
            data: a.dia,
            horario: fim ? `${inicio} - ${fim}` : `${inicio}`,
            preco: Number(a.valor_total) || 0,
            status: a.status || 'agendado',
          };
        });

        setReservas(reservasFmt);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
  }, [BASE_URL]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const hojeZerado = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const { futuros, historico } = useMemo(() => {
    const f = [];
    const h = [];
    reservas.forEach((r) => {
      const rDate = new Date(r.data);
      if (isNaN(rDate)) {
        h.push(r);
      } else if (rDate >= hojeZerado) {
        f.push(r);
      } else {
        h.push(r);
      }
    });
    return { futuros: f, historico: h };
  }, [reservas, hojeZerado]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toCancelId, setToCancelId] = useState(null);

  // Lock scroll when modal open
  useEffect(() => {
    if (confirmOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [confirmOpen]);

  const openConfirm = (id) => {
    // Debug: marcar abertura do modal
    if (typeof window !== 'undefined') {
      console.log('Abrindo modal de confirmação para agendamento', id);
    }
    setToCancelId(id);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setToCancelId(null);
  };

  const confirmarCancelamento = async () => {
    if (!toCancelId) return;
    await cancelarReserva(toCancelId);
    closeConfirm();
  };

  const cancelarReserva = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/agendamentos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Falha ao cancelar');
      await carregar();
    } catch (e) {
      alert('Erro ao cancelar agendamento');
    }
  };

  return (
    <div className="page-container">
      <Header paginaAtual="meusagendamentos" />

      <main className="main-content">
        <section className="section-card">
          <h2 className="section-title">Meus agendamentos</h2>
          {loading && <p>Carregando agendamentos...</p>}
          {futuros.length === 0 ? (
            <EmptyState type="futuros" message="Nenhum agendamento em aberto." />
          ) : (
            <div className="reservations-grid">
              {futuros.map((reserva) => (
                <ReservationCard
                  key={reserva.id}
                  reserva={reserva}
                  formatarData={formatarData}
                  formatarPreco={formatarPreco}
                  onCancelar={openConfirm}
                  showCancelButton={reserva.status !== 'cancelado'}
                />
              ))}
            </div>
          )}
        </section>

        <section className="section-card">
          <h2 className="section-title">Histórico de agendamentos</h2>
          {historico.length === 0 ? (
            <EmptyState type="historico" message="Nenhum agendamento realizado." />
          ) : (
            <div className="reservations-grid">
              {historico.map((reserva) => (
                <ReservationCard
                  key={reserva.id}
                  reserva={reserva}
                  formatarData={formatarData}
                  formatarPreco={formatarPreco}
                  onCancelar={openConfirm}
                  showCancelButton={reserva.status !== 'cancelado'}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {mounted && confirmOpen && typeof document !== 'undefined' && createPortal(
        (
          <div
            className="ah-modal-overlay ah-modal-fadein"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-modal-title"
            aria-describedby="cancel-modal-desc"
            onClick={closeConfirm}
          >
            <div
              className="ah-modal-container ah-modal-popin"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="ah-modal-close" aria-label="Fechar" onClick={closeConfirm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="ah-modal-header">
                <div className="ah-modal-icon">
                  <svg width="133" height="124" viewBox="0 0 133 124" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_9738_494)">
                      <path d="M118.564 124.035L14.4902 124.07C11.9479 124.08 9.44794 123.416 7.24342 122.145C5.03889 120.874 3.208 119.041 1.93605 116.831C0.664097 114.621 -0.00377783 112.113 1.60738e-05 109.561C0.00380998 107.009 0.679139 104.503 1.95766 102.298L53.9614 7.26347C55.23 5.05591 57.0552 3.22247 59.2534 1.94742C61.4517 0.672374 63.9455 0.000649283 66.4843 -0.00024325C69.0231 -0.00113578 71.5175 0.668835 73.7166 1.94234C75.9157 3.21584 77.7422 5.048 79.0124 7.25467L131.089 102.263C132.357 104.469 133.024 106.972 133.023 109.52C133.022 112.067 132.353 114.569 131.084 116.775C129.815 118.981 127.99 120.813 125.793 122.087C123.595 123.361 121.103 124.032 118.565 124.033L118.564 124.035ZM1.30775 109.554C1.30775 111.824 12.7917 106.933 13.9813 109.001C16.3613 113.135 9.73272 122.761 14.4895 122.759C14.4895 122.759 127.578 120.251 129.956 116.115C131.123 114.111 131.738 111.832 131.737 109.51C131.736 107.189 131.12 104.91 129.951 102.907L77.8747 7.89862C76.729 5.88491 75.0703 4.21347 73.0686 3.05582C71.0669 1.89817 68.7945 1.296 66.4844 1.31112C61.7297 1.31112 1.30774 107.286 1.30739 109.556L1.30775 109.554Z" fill="#563D3D"/>
                      <path d="M69.187 111.769C89.1978 111.769 105.42 95.4846 105.42 75.3968C105.42 55.309 89.1978 39.0247 69.187 39.0247C49.1761 39.0247 32.9541 55.309 32.9541 75.3968C32.9541 95.4846 49.1761 111.769 69.187 111.769Z" fill="#FF6B35"/>
                      <path d="M66.3203 84.7352L65.9402 52.5833H72.4036L71.9916 84.7352H66.3203ZM69.2035 98.2114C68.6404 98.2206 68.0815 98.1138 67.5611 97.8978C67.0407 97.6817 66.5699 97.3609 66.1778 96.9552C65.7813 96.5591 65.4667 96.0883 65.252 95.5698C65.0373 95.0512 64.9268 94.4953 64.9268 93.9337C64.9268 93.3722 65.0373 92.8162 65.252 92.2977C65.4667 91.7792 65.7813 91.3084 66.1778 90.9123C66.5699 90.5065 67.0407 90.1857 67.5611 89.9697C68.0815 89.7536 68.6404 89.6469 69.2035 89.6561C69.7643 89.646 70.3212 89.7524 70.8391 89.9686C71.3571 90.1847 71.825 90.506 72.2134 90.9123C72.6134 91.3082 72.9293 91.7815 73.1417 92.3036C73.3541 92.8257 73.4586 93.3857 73.449 93.9496C73.4565 94.5085 73.3509 95.0631 73.1385 95.5799C72.9261 96.0966 72.6114 96.5646 72.2134 96.9555C71.825 97.3618 71.3571 97.6831 70.8391 97.8993C70.3212 98.1154 69.7643 98.2218 69.2035 98.2117V98.2114Z" fill="white"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_9738_494">
                        <rect width="133" height="124" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <p id="cancel-modal-desc" className="ah-modal-subtitle">Você realmente deseja cancelar o seu agendamento?</p>
              </div>
              <div className="ah-modal-actions">
                <button className="ah-btn ah-btn-danger" onClick={confirmarCancelamento}>Confirmar Cancelamento</button>
                <button className="ah-btn ah-btn-secondary" onClick={closeConfirm}>Voltar</button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}
    </div>
  );
}