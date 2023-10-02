import { getProcess, getReports } from './api';
import { getLatestProcess, getBeforeAndAfterReports } from '../utils/data'

export const getLastIdsByProcessId = async (processIdsToSearch) => {
    const grouppedProcesses = await Promise.allSettled(processIdsToSearch.map(p => getProcess(p)))
    const lastProcessIds = grouppedProcesses.reduce((acc, result, idx) => {
        const { value, status } = result
        if (status === 'rejected') {
            return { ...acc, [processIdsToSearch[idx]]: null }
        }
        const { data: { procesos } } = value
        const { idProceso } = getLatestProcess(procesos)
        return { ...acc, [processIdsToSearch[idx]]: idProceso }
    })
    return lastProcessIds
}

export const getFilteredReportsByProcessId = async (lastIdsByProcessId, reviewDate) => {
    const reports = await Promise.allSettled(Object.values(lastIdsByProcessId).map(id => id ? getReports(id) : Promise.reject()))
    return Object.keys(lastIdsByProcessId).reduce((acc, processId, idx) => {
        const { value, status } = reports[idx]
        if (status === 'rejected') {
            return { ...acc, [processId]: { status: 'rejected', data: [] } }
        }
        const { before, after } = getBeforeAndAfterReports(value.data.actuaciones, reviewDate)
        return { ...acc, [processId]: { status: 'fulfilled', data: before?.length ? [...after, before[0]] : after } }
    }, {})
}