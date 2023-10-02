import axios from "axios";
const BASE_URL = 'https://consultaprocesos.ramajudicial.gov.co:448/api/v2'

export const getProcess = (processNumber) =>
  axios.get(
    `${BASE_URL}/Procesos/Consulta/NumeroRadicacion?numero=${processNumber}&SoloActivos=false&pagina=1`
  );
export const getReports = (processId) =>
  axios.get(
    `${BASE_URL}/Proceso/Actuaciones/${processId}?pagina=1`
  );
export const getDoc = (idRegActuacion) =>
  axios.get(
    `${BASE_URL}/Proceso/DocumentosActuacion/${idRegActuacion}`
  );

export const downloadDoc = (idRegDocumento, nombre) =>
  axios({
    url: `${BASE_URL}/Descarga/Documento/${idRegDocumento}`,
    method: 'GET',
    responseType: 'blob',
  }).then(({ data: blob }) => {
    const url = window.URL.createObjectURL(
      new Blob([blob]),
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      nombre,
    );

    document.body.appendChild(link);

    link.click();

    link.parentNode.removeChild(link);
  });

