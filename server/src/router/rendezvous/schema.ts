import { isValid } from "date-fns";
import { z } from "zod";

export const createRendezvous = z.object({
  title: z.string(),
  dateTime: z.string(),
  description: z.string().optional(),
  clientId: z.string().optional(),
  forfaitId: z.string(),
  monitorId: z.string(),
  creneau: z.string(),
  creator: z.string().optional(),
  enterpriseName: z.string().optional(),
  entrepriseId: z.string().optional(),
  enterpriseContact: z.array(z.string()).optional(),
  relationKey: z.string().optional(),
  isValid: z.boolean().optional(),
  duration: z.string().optional(),
  price: z.string().optional(),
});

export const updateRendezvous = z.object({
 rendezvousId: z.string(), // ID of the rendezvous to update
  title: z.string().optional(), // Optional fields that can be updated
  dateTime: z.string().optional(),
  description: z.string().optional(),
  clientId: z.string().optional(),
  forfaitId: z.string().optional(),
  monitorId: z.string().optional(),
  creneau: z.string().optional(),
  creator: z.string().optional(),
  enterpriseName: z.string().optional(),
  entrepriseId: z.string().optional(),
  images: z.array(
    z.object({
      id: z.string(), // ID of the image to update
      filename: z.string().optional(), // Optional fields that can be updated
      rendezVousId: z.string(), // ID of the rendezvous associated with the image
    })
  ).optional(),
  isValid: z.boolean().optional(),
});

export const updateSchedule = z.object({
 rendezvousId: z.string(), // ID of the rendezvous to update
  dateTime: z.string().optional(),
  creneau: z.string().optional(),

});
export const updateDate = z.object({
//  rendezvousId: z.string(), // ID of the rendezvous to update
  dateTime: z.string().optional(),
  // params: z.object({
  //   id: z.string(), // Define id as a string parameter
  // }),
});



export const majRendezVous = z.object({
   dateTime: z.string().optional(),
   creneau: z.string().optional(),
   relationKey: z.string().optional(),
   isValid: z.boolean().optional(),
   creator: z.string().optional(),
 });
 