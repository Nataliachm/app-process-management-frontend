import { getProcess, getReports } from "../api/api";

export const getLatestProcess = (processes = []) => {
  if (!processes.length) {
    return { idProceso: null }
  }
  if (processes.length === 1) {
    return processes[0];
  }
  return processes.sort(function (a, b) {
    return (
      new Date(b.fechaUltimaActuacion || b.fechaProceso) -
      new Date(a.fechaUltimaActuacion || a.fechaProceso)
    );
  })[0];
};

export const getBeforeAndAfterReports = (reports, referenceDate) => {
  return reports.reduce(
    (acc, actuacion) => {
      const reportDate = new Date(actuacion.fechaActuacion).getTime();
      const referenceDateTime = referenceDate.getTime();
      if (reportDate >= referenceDateTime) {
        return { ...acc, after: [...acc.after, actuacion] };
      }

      return { ...acc, before: [...acc.before, actuacion] };
    },
    {
      before: [],
      after: [],
    }
  );
};

export const getLastIdsByProcessId = async (processIdsToSearch) => {
  const grouppedProcesses = await Promise.allSettled(
    processIdsToSearch.map((p) => getProcess(p))
  );
  const lastProcessIds = grouppedProcesses.reduce((acc, result, idx) => {
    const { value, status } = result;
    if (status === "rejected") {
      return { ...acc, [processIdsToSearch[idx]]: null };
    }

    try {
      const {
        data: { procesos },
      } = value;

      const { idProceso } = getLatestProcess(procesos);
      return { ...acc, [processIdsToSearch[idx]]: idProceso };
    } catch (e) {
      return { ...acc, [processIdsToSearch[idx]]: null };
    }
  }, {});
  return lastProcessIds;
};

export const getFilteredReportsByProcessId = async (
  lastIdsByProcessId,
  reviewDate
) => {
  const reports = await Promise.allSettled(
    Object.values(lastIdsByProcessId).map((id) =>
      id ? getReports(id) : Promise.reject()
    )
  );
  return Object.keys(lastIdsByProcessId).reduce((acc, processId, idx) => {
    const { value, status } = reports[idx];
    if (status === "rejected") {
      return { ...acc, [processId]: { status: "rejected", data: [] } };
    }
    const { before, after } = getBeforeAndAfterReports(
      value.data.actuaciones,
      reviewDate
    );
    return {
      ...acc,
      [processId]: {
        status: "fulfilled",
        data: before?.length ? [...after, before[0]] : after,
      },
    };
  }, {});
};
