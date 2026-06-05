import useStore from '../store';

export function resolverMaterial(materiaPrimaId) {
  if (!materiaPrimaId) return '-';
  const mp = useStore.getState().materia_prima.find(m => m.id === materiaPrimaId);
  if (!mp) return '-';
  return mp.ref_wnr && mp.ref_wnr !== '-' ? `${mp.ref_wnr} – ${mp.ref_din}` : mp.ref_din;
}

export function calcPeso(forma, c, l, h, de, di, pesoEsp) {
  const p = parseFloat(pesoEsp);
  if (!forma || !p) return '';
  let vol = 0;
  if (forma === 'quadrado') {
    const vc = parseFloat(c), vl = parseFloat(l), vh = parseFloat(h);
    if (!vc || !vl || !vh) return '';
    vol = vc * vl * vh;
  } else if (forma === 'redondo_macico') {
    const vc = parseFloat(c), vde = parseFloat(de);
    if (!vc || !vde) return '';
    vol = Math.PI * Math.pow(vde / 2, 2) * vc;
  } else if (forma === 'redondo_oco') {
    const vc = parseFloat(c), vde = parseFloat(de), vdi = parseFloat(di);
    if (!vc || !vde || !vdi) return '';
    vol = Math.PI * (Math.pow(vde / 2, 2) - Math.pow(vdi / 2, 2)) * vc;
  }
  if (!vol || vol <= 0) return '';
  return (vol / 1000 * p / 1000).toFixed(4);
}

export function calcCustoEstimado(pp, proc) {
  if (pp.tempoEstimado == null) return null;
  const taxa = pp.custoHoraSnapshot ?? Number(proc.custo_hora);
  if (!taxa) return null;
  const horas = pp.unidade_tempo === 'min' ? pp.tempoEstimado / 60 : pp.tempoEstimado;
  return horas * taxa;
}
