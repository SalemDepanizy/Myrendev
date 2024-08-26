import moment from 'moment';
import React, { useEffect, useState } from 'react';

interface Appointment {
  date: string;
  creneaux: string[];
  clients: string[][];
  email: string[][];
  monitorId: string[];
}

const processAppointments = (rendezvousData, currentMonitorId) => {
  const filteredRendezvous = rendezvousData?.filter(
    (rendezVous) => rendezVous.monitor?.id === currentMonitorId?.id
  );

  const sameDaySameSlotMap: { [key: string]: any[] } = {};

  filteredRendezvous?.forEach((rendezVous) => {
    const formattedDate = moment(rendezVous.dateTime).format('YYYY-MM-DD');
    const key = rendezVous.monitor?.id + rendezVous.creneau + formattedDate;

    if (!sameDaySameSlotMap[key]) {
      sameDaySameSlotMap[key] = [];
    }

    sameDaySameSlotMap[key].push(rendezVous);
  });

  const exactlyTwoRendezvous = Object.values(sameDaySameSlotMap).filter(
    (group) => group.length === 2
  );

  const exactlyOneRendezvous = Object.values(sameDaySameSlotMap).filter(
    (group) => group.length === 1
  );

  const notExactlyTwoRendezvous = Object.values(sameDaySameSlotMap).filter(
    (group) => group.length < 2
  );

  const appointmentsByDate: { [key: string]: Set<string> } = {};
  const appointmentsByDateSolo: { [key: string]: Set<string> } = {};
  const notAppointmentsByDate: { [key: string]: Set<string> } = {};

  exactlyTwoRendezvous.forEach((group) => {
    const date = moment(group[0].dateTime).format('YYYY-MM-DD');
    if (!appointmentsByDate[date]) {
      appointmentsByDate[date] = new Set();
    }
    group.forEach((rdv) => {
      appointmentsByDate[date].add(rdv.creneau);
    });
  });

  exactlyOneRendezvous.forEach((group) => {
    const date = moment(group[0].dateTime).format('YYYY-MM-DD');
    if (!appointmentsByDateSolo[date]) {
      appointmentsByDateSolo[date] = new Set();
    }
    group.forEach((rdv) => {
      appointmentsByDateSolo[date].add(rdv.creneau);
    });
  });

  notExactlyTwoRendezvous.forEach((group) => {
    const date = moment(group[0].dateTime).format('YYYY-MM-DD');
    if (!notAppointmentsByDate[date]) {
      notAppointmentsByDate[date] = new Set();
    }
    group.forEach((rdv) => {
      notAppointmentsByDate[date].add(rdv.creneau);
    });
  });

  const newAppointmentsArray: Appointment[] = [];
  const newAppointmentsArraySolo: Appointment[] = [];
  const freeAppointmentsArray: Appointment[] = [];

  Object.entries(appointmentsByDate).forEach(([date, creneauxSet]) => {
    const creneaux = Array.from(creneauxSet) as string[];
    newAppointmentsArray.push({
      date,
      creneaux,
      clients: exactlyTwoRendezvous
        .filter((group) => moment(group[0].dateTime).format('YYYY-MM-DD') === date)
        .map((group) => group.map((rdv) => `${rdv.client.name} ${rdv.client.lastname}`)),
      email: exactlyTwoRendezvous
        .filter((group) => moment(group[0].dateTime).format('YYYY-MM-DD') === date)
        .map((group) => group.map((rdv) => rdv.client.email)),
      monitorId: exactlyTwoRendezvous
        .filter((group) => moment(group[0].dateTime).format('YYYY-MM-DD') === date)
        .flatMap((group) => group.map((rdv) => rdv.monitor?.id).filter((id): id is string => !!id)),
    });
  });

  Object.entries(appointmentsByDateSolo).forEach(([date, creneauxSet]) => {
    const creneaux = Array.from(creneauxSet) as string[];
    newAppointmentsArraySolo.push({
      date,
      creneaux,
      clients: exactlyOneRendezvous
        .filter((group) => moment(group[0].dateTime).format('YYYY-MM-DD') === date)
        .map((group) => group.map((rdv) => `${rdv.client.name} ${rdv.client.lastname}`)),
      email: exactlyOneRendezvous
        .filter((group) => moment(group[0].dateTime).format('YYYY-MM-DD') === date)
        .map((group) => group.map((rdv) => rdv.client.email)),
      monitorId: exactlyOneRendezvous
        .filter((group) => moment(group[0].dateTime).format('YYYY-MM-DD') === date)
        .flatMap((group) => group.map((rdv) => rdv.monitor?.id).filter((id): id is string => !!id)),
    });
  });

  Object.entries(notAppointmentsByDate).forEach(([date, creneauxSet]) => {
    const creneaux = Array.from(creneauxSet) as string[];
    freeAppointmentsArray.push({
      date,
      creneaux,
      clients: [],
      email: [],
      monitorId: [],
    });
  });

  return {
    newAppointmentsArray,
    newAppointmentsArraySolo,
    freeAppointmentsArray,
    exactlyTwoRendezvous,
  };
};


export default processAppointments


