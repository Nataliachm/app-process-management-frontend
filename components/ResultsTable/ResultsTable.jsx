import * as React from "react";
import "./ResultsTable.css";
import { downloadDoc, getDoc } from "../../api/api";

export default function ResultsTable({ reports }) {
  const dowloadFile = async (idRegActuacion) => {
    const { data } = await getDoc(idRegActuacion);
    if (data && data.length) {
      const { idRegDocumento, nombre } = data[0];
      downloadDoc(idRegDocumento, nombre);
    }
  };

  return (
    <div className="accordion">
      <div className="accordion-summary">
        <span
          className={`title ${reports.status === "rejected" ? "error" : ""}`}
        >
          {reports.title}
        </span>
      </div>
      <div className="accordion-details">
        {reports.status === "rejected" ? (
          <div>
            {reports.error || "Ocurrio un error obteniendo los reportes"}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th align="right">Fecha de Actuación</th>
                  <th align="right">Actuación</th>
                  <th align="right">Anotación</th>
                  <th align="right">Fecha Inicia Término</th>
                  <th align="right">Fecha Finaliza Término</th>
                  <th align="right">Fecha de Registro</th>
                  <th align="right">Adjunto</th>
                </tr>
              </thead>
              <tbody>
                {reports.data.map((row) => (
                  <tr key={row.idRegActuacion}>
                    <td align="right">{row.fechaActuacion}</td>
                    <td align="right">{row.actuacion}</td>
                    <td align="right">{row.anotacion}</td>
                    <td align="right">{row.fechaInicial}</td>
                    <td align="right">{row.fechaFinal}</td>
                    <td align="right">{row.fechaRegistro}</td>
                    <td align="right">
                      {row.conDocumentos && (
                        <button onClick={() => dowloadFile(row.idRegActuacion)}>
                          Descargar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
