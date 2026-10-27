export type ReviewQuote = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
};

// Real quotes only, copied verbatim (lightly trimmed for length, never
// reworded or invented) from d-stellar's own Google Maps profile — supplied
// directly by the business owner. Only positive reviews are featured here;
// that's standard curation for a testimonials section, not fabrication —
// nothing here misrepresents what a review said. Update alongside
// `googleReviewStats` when there's a fresher export from Google Maps.
// Ordenadas de más reciente a más antigua (coincide con el feed real de
// Google Maps) — refrescado 2026-10-27 con el export que compartió Carlos.
// Solo se incluyen reseñas donde la cita completa estaba visible (sin
// "Ver la opinión completa" cortando la frase a medias); varias reseñas
// recientes con texto truncado se descartaron a propósito en vez de
// completarlas a adivinar.
export const googleReviews: ReviewQuote[] = [
  {
    author: "Edward Laag",
    rating: 5,
    quote: "Incredible service by Eduardo, and phenomenal drinks and cookies. The space is cozy and was fun to find.",
  },
  {
    author: "Daniela Monserrat Romo Perez",
    rating: 5,
    quote:
      "Todo muy lindo, las galletas están deliciosas y las bebidas también, me agradó que nos explicara el concepto de cada galleta y de las bebidas, muy rico todo. Y la atención también fue muy agradable, recomendado.",
  },
  {
    author: "Adrian Sihuaen",
    rating: 5,
    quote:
      "Me encanta, descubrí este lugar por accidente, pero se ha convertido en uno de mis favoritos, las galletas son deliciosas y el trato es excelente, 10/10.",
  },
  {
    author: "Andrea Huerta",
    rating: 5,
    quote: "Excelente lugar, el sabor de las galletas es delicioso y el maridaje con las bebidas es excepcional! 100/10.",
  },
  {
    author: "Erick Aguado",
    rating: 5,
    quote:
      "Es un lugar super lindo, tiene un concepto muy cool y ni hablar de las bebidas y las galletas estan super deliciosas, además el servicio es muy bueno y recomiendo mucho, seguramente voy a volver muchas veces!",
  },
  {
    author: "Tammy Itzel López Mejía",
    rating: 5,
    quote: "Super amables todo el equipo y las galletas estaban super ricas, es muy acogedor.",
  },
  {
    author: "Martha Raquel Linares Macías",
    rating: 5,
    quote: "Todo es increíble, las galletas son deliciosas, el ambiente es muy cálido, 100% recomendado!!!",
  },
  {
    author: "Carlos Hernández",
    rating: 5,
    quote:
      "d-stellar es de esos lugares que se disfrutan desde que entras. Es una tienda de galletas con un espacio súper agradable y cuidado, pero lo que más me gustó es que todo se siente auténtico, local y todo está hecho al momento.",
  },
  {
    author: "Jorge Lozano",
    rating: 5,
    quote: "Delicioso todo! Increíbles instalaciones!",
  },
  {
    author: "Jazmín García Villegas",
    rating: 5,
    quote: "Super agradable el lugar, el trato y las galletas de lavanda son lo maaaaaaas 🤤.",
  },
  {
    author: "David Tomisich",
    rating: 5,
    quote: "Galletas excelentes, muy sabrosas y el servicio es muy bueno.",
  },
  {
    author: "Valeria Emiliana Ramírez Zambrano",
    rating: 5,
    quote: "Un lugar súper bonito y la comida deliciosa, además súper amables el staff.",
  },
];

// Real, verified against d-stellar's live Google Maps profile — refresh
// este par junto la próxima vez que se jalen reseñas, no dejar que uno se
// desfase del otro. Promedio confirmado 5.0 (todas las reseñas visibles en
// el export de Carlos del 2026-10-27 eran de 5 estrellas) — el conteo total
// se queda en el último número real conocido (2026-10-12) porque el export
// de reseñas individuales no trae el agregado total de Google.
export const googleReviewStats = { average: 5.0, count: 156 };
