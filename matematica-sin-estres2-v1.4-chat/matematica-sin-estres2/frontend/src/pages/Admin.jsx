import React, { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, BookOpen, ClipboardList, GraduationCap, KeyRound, LayoutDashboard, Loader2, RefreshCw, Users } from 'lucide-react';
import { useDatos } from '../hooks/useDatos';
import { AdminContext, estadoEfectivo } from './admin/contexto';
import CambiarPassword from '../components/CambiarPassword';
import PanelShell from '../components/PanelShell';
import { ToastProvider } from '../components/ui/Toast';
import { BOTON_SECUNDARIO } from '../components/ui/ui';
import Dashboard from './admin/Dashboard';
import Matriculas from './admin/Matriculas';
import Clases from './admin/Clases';
import Usuarios from './admin/Usuarios';
import Solicitudes from './admin/Solicitudes';
import Auditoria from './admin/Auditoria';

const PESTANAS = ['resumen', 'matriculas', 'clases', 'usuarios', 'solicitudes', 'auditoria', 'cuenta'];

const TITULOS = {
  resumen: ['Panel de administración', 'Visión general de la academia: ingresos, matrículas y lo que necesita tu atención.'],
  matriculas: ['Matrículas', 'Valida pagos, renueva vigencias y matricula alumnos manualmente.'],
  clases: ['Clases grabadas', 'Publica, oculta y organiza las sesiones que ven los alumnos.'],
  usuarios: ['Usuarios', 'Cuentas, accesos y soporte a alumnos.'],
  solicitudes: ['Solicitudes de información', 'Interesados que pidieron su clase de diagnóstico.'],
  auditoria: ['Auditoría de seguridad', 'Inicios de sesión, bloqueos y cambios sensibles.'],
  cuenta: ['Mi cuenta', 'Seguridad de tu acceso de administrador.'],
};

function AdminPanel() {
  const [params, setParams] = useSearchParams();
  const pestana = PESTANAS.includes(params.get('seccion')) ? params.get('seccion') : 'resumen';
  const preset = params.get('filtro') || '';
  const [actualizando, setActualizando] = useState(false);

  const resumen = useDatos('/api/admin/resumen');
  const matriculas = useDatos('/api/admin/matriculas');
  const usuarios = useDatos('/api/admin/usuarios');
  const clases = useDatos('/api/admin/clases');
  const solicitudes = useDatos('/api/admin/solicitudes');
  const auditoria = useDatos('/api/admin/auditoria');
  const niveles = useDatos('/api/public/niveles', { auth: false });
  const horarios = useDatos('/api/public/horarios', { auth: false });

  const irA = useCallback((id, filtro = '') => {
    const siguiente = {};
    if (id !== 'resumen') siguiente.seccion = id;
    if (filtro) siguiente.filtro = filtro;
    setParams(siguiente);
    window.scrollTo({ top: 0 });
  }, [setParams]);

  const recargarTodo = useCallback(async () => {
    setActualizando(true);
    await Promise.all([resumen, matriculas, usuarios, clases, solicitudes, auditoria].map((r) => r.recargar()));
    setActualizando(false);
  }, [resumen, matriculas, usuarios, clases, solicitudes, auditoria]);

  const contexto = useMemo(() => ({
    irA,
    resumen, matriculas, usuarios, clases, solicitudes, auditoria, niveles, horarios,
    recargarTodo,
  }), [irA, resumen, matriculas, usuarios, clases, solicitudes, auditoria, niveles, horarios, recargarTodo]);

  // Indicadores de la barra lateral
  const pendientes = (matriculas.datos || []).filter((m) => estadoEfectivo(m) === 'PENDIENTE').length;
  const sinAtender = (solicitudes.datos || []).filter((s) => !s.atendida).length;
  const items = [
    { id: 'resumen', texto: 'Resumen', Icono: LayoutDashboard },
    { id: 'matriculas', texto: 'Matrículas', Icono: GraduationCap, cuenta: pendientes, alerta: true },
    { id: 'clases', texto: 'Clases grabadas', Icono: BookOpen },
    { id: 'usuarios', texto: 'Usuarios', Icono: Users },
    { id: 'solicitudes', texto: 'Solicitudes', Icono: ClipboardList, cuenta: sinAtender, alerta: true },
    { id: 'auditoria', texto: 'Auditoría', Icono: Activity },
    { id: 'cuenta', texto: 'Mi cuenta', Icono: KeyRound },
  ];

  const claveVista = `${pestana}:${preset}`;
  const contenido = {
    resumen: <Dashboard />,
    matriculas: <Matriculas key={claveVista} filtroInicial={preset} />,
    clases: <Clases key={claveVista} filtroInicial={preset} />,
    usuarios: <Usuarios key={claveVista} filtroInicial={preset} />,
    solicitudes: <Solicitudes key={claveVista} filtroInicial={preset} />,
    auditoria: <Auditoria key={claveVista} filtroInicial={preset} />,
    cuenta: <CambiarPassword />,
  }[pestana];

  return (
    <AdminContext.Provider value={contexto}>
      <PanelShell titulo={TITULOS[pestana][0]} subtitulo={TITULOS[pestana][1]} items={items} activo={pestana} onCambiar={(id) => irA(id)} rolEtiqueta="Administrador"
        acciones={pestana !== 'cuenta' && (
          <button type="button" onClick={recargarTodo} disabled={actualizando} className={BOTON_SECUNDARIO}>
            {actualizando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="w-4 h-4" aria-hidden="true" />} Actualizar datos
          </button>
        )}>
        {contenido}
      </PanelShell>
    </AdminContext.Provider>
  );
}

export default function Admin() {
  return (
    <ToastProvider>
      <AdminPanel />
    </ToastProvider>
  );
}
