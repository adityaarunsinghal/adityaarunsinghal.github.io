import { personalWorkshopPublication } from "../workshop/publication";

/** Kept in step with the workshop build's explicit rollout setting. */
export const siteWorkshopPublication = personalWorkshopPublication(
  import.meta.env.WORKSHOP_CANONICAL_ORIGIN || undefined,
);
