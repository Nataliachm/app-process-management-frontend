"use client";

import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import "./App.css";
import ResultsTable from "../../components/ResultsTable/ResultsTable";
import {
  getLastIdsByProcessId,
  getFilteredReportsByProcessId,
} from "../../utils/data";
import DatePicker from "react-datepicker";
import Spinner from "../../components/spinner/spinner";

var xlsx = require("xlsx");

const App = () => {
  const [processes, setProcesses] = useState([]);
  const [grouppedReports, setGrouppedReports] = useState({});
  const [fetchError, setFetchError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewDate, setReviewDate] = useState(new Date("2023-03-1"));

  const getProcessReports = async (processes) => {
    const processIds = processes && Object.keys(processes);
    if (!processIds || !processIds?.length) return;

    try {
      setLoading(true);
      const lastIdsByProcessId = await getLastIdsByProcessId(processIds);
      const reportsByProcessId = await getFilteredReportsByProcessId(
        lastIdsByProcessId,
        reviewDate
      );
      const reportsWithTitles = processIds.map((processId) => ({
        ...processes[processId],
        ...reportsByProcessId[processId],
      }));
      setFetchError(false);
      setLoading(false);
      setGrouppedReports(reportsWithTitles);
    } catch (error) {
      setLoading(false);
      setFetchError(true);
    }
  };

  function handleFile(e) {
    e.preventDefault();
    if (e.target.files) {
      // read xlsx data
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = xlsx.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsedData = xlsx.utils.sheet_to_json(worksheet, {
          header: 1,
          blankrows: false,
        });
        setProcesses(parsedData);
      };
      reader.readAsArrayBuffer(e.target.files[0]);
    }
  }

  const handleSearch = () => {
    if (!processes?.length) return;
    const processesIds = processes.reduce((acc, [number, name, id]) => {
      if (!id) return acc;
      return { ...acc, [id]: { title: `${number} ${name} - ${id}` } };
    }, {});
    getProcessReports(processesIds);
  };

  return (
    <div className="main">
      <main className="title">
        <h1>Revisión procesos judiciales</h1>
        <input type="file" onChange={handleFile}></input>
        <DatePicker
          selected={reviewDate}
          onChange={(date) => setReviewDate(date)}
        />
        <button onClick={handleSearch}>Buscar</button>
      </main>
      {loading ? (
        <div className="spinner_container">
          <Spinner />
        </div>
      ) : (
        <div className="results">
          {fetchError ? (
            <div>Ocurrió un error mientras se obtenían los processos</div>
          ) : (
            Object.keys(grouppedReports).map(
              (reportKey) =>
                grouppedReports[reportKey] && (
                  <ResultsTable
                    key={reportKey}
                    reports={grouppedReports[reportKey]}
                  />
                )
            )
          )}
        </div>
      )}
    </div>
  );
};

export default App;
