// Photos that ship with the site, so the Gallery is never empty. Photos Robert uploads in his admin
// appear first; these follow. To add more permanently, drop the file in client/public/images and list it here.
export type SeedPhoto = { src: string; alt: string; caption: string };

export const GALLERY_SEED: SeedPhoto[] = [
  { src: "/images/deye-inverter-battery-crew-member-installation.webp", alt: "Robert Power team member beside a freshly installed Deye hybrid inverter and lithium battery", caption: "Deye hybrid inverter + lithium battery, completed" },
  { src: "/images/cworth-energy-inverter-battery-completed-install.webp", alt: "Cworth Energy inverter and Home LBW battery neatly installed with protection box", caption: "Cworth Energy inverter and battery, clean finish" },
  { src: "/images/cworth-energy-inverter-client-handshake.webp", alt: "Two Robert Power team members shaking hands in front of a Cworth Energy solar inverter installation", caption: "Another happy handover" },
  { src: "/images/deye-inverter-battery-installation.webp", alt: "Deye hybrid inverter and lithium battery installed by Robert Power Solutions", caption: "Deye installation with DC and AC protection" },
  { src: "/images/cworth-energy-inverter-wiring-protection-box.webp", alt: "Cworth Energy solar inverter wiring with surge protection box and changeover", caption: "Wiring, surge protection and changeover in progress" },
  { src: "/images/cworth-energy-installation-technician-hi-vis.webp", alt: "Robert Power technician in a high-visibility vest checking a Cworth Energy solar installation", caption: "Final checks on site" },
  { src: "/images/deye-inverter-wiring-technician.webp", alt: "Robert Power technician wiring a Deye solar inverter and protection devices", caption: "Safe, careful wiring" },
  { src: "/images/solar-dc-protection-box-wiring.webp", alt: "Technician wiring a solar DC protection box next to a Deye inverter", caption: "DC protection box wiring" },
];
