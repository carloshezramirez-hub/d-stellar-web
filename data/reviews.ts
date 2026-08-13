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
export const googleReviews: ReviewQuote[] = [
  {
    author: "Carlos Hernández",
    rating: 5,
    quote:
      "d-stellar es de esos lugares que se disfrutan desde que entras. Es una tienda de galletas con un espacio súper agradable y cuidado, pero lo que más me gustó es que todo se siente auténtico, local y todo está hecho al momento.",
  },
  {
    author: "Gustavo Sánchez",
    rating: 5,
    quote:
      "Son galletas de autor que cambian el menú cada mes. Es un muy buen lugar para quienes disfrutamos de probar propuestas algo fuera de lo común. El lugar es pequeño, muy tranquilo y la ambientación es bastante única.",
  },
  {
    author: "Arely Carrillo",
    rating: 5,
    quote:
      "Tienen muchísimos sabores de galletas. El sabor es delicioso, se nota la calidad y el amor en cada bocado. El lugar es muy tranquilo y al entrar parece que hay estrellas en el techo, lo que lo hace mágico.",
  },
  {
    author: "Karla Mancera",
    rating: 5,
    quote:
      "El chico que me atendió me parece es el dueño y fue súper amable y me explicó el concepto de las galletas, ya que cambia cada mes de sabores. Las preparan al momento, lo cual significa que están frescas. Me encantó la combinación de caramelo con sal.",
  },
  {
    author: "Sandra Careaga",
    rating: 5,
    quote:
      "Cada mes espero con ansias ver cuáles son las nuevas actualizaciones del menú para poder visitarlos, nunca me dejan de sorprender con su gran creatividad al combinar los ingredientes así como las deliciosas bebidas.",
  },
  {
    author: "Z Rodríguez",
    rating: 5,
    quote:
      "He ido alrededor de 5 veces y, honestamente, cada visita me sigue sorprendiendo. El lugar es pequeño, pero muy acogedor. Tiene una iluminación cálida y un techo con efecto de estrellas que le da un toque único y relajante.",
  },
  {
    author: "Alonso Salinas",
    rating: 5,
    quote:
      "Una joya para los amantes de los postres y también para cualquier persona que aprecie la comida gourmet. Lo hacen con esmero y con ingredientes de alta calidad. En cuanto al sabor, un triunfo. Una parada obligatoria en CDMX.",
  },
  {
    author: "Andrea Madrigal Flores",
    rating: 5,
    quote:
      "El lugar súper bonito, amé la decoración y los detalles en el techo. La atención increíble y súper personalizada, los precios bien y los sabores me encantaron. Además amo que cambien de menú tan seguido pero no pierdan calidad.",
  },
  {
    author: "Sam Chávez",
    rating: 5,
    quote:
      "Aprecié mucho que el dueño me puso la galleta vegana que pedí para mi amigo separadita, y yo no sabía por qué, pero él súper enterado de que eso es importante para el veganismo. Esos detalles hacen la diferencia.",
  },
  {
    author: "S Amaya",
    rating: 5,
    quote:
      "No solo las galletas tienen un sabor demasiado bueno, se siente como otro planeta. Literalmente parecía algo sacado de Star Wars y me ilusioné muchísimo.",
  },
  {
    author: "Marissa Careaga",
    rating: 5,
    quote:
      "Yo soy vegana y sé lo complicado que puede ser encontrar opciones para comer postres ricos y aptos. Me gusta que cada mes tengan una nueva opción, porque me dan la oportunidad de seguir descubriendo sabores.",
  },
  {
    author: "emilio_rbalam",
    rating: 5,
    quote:
      "Este lugar desborda cariño, Hernán y Lalo te tratan con amabilidad, te hacen sentir en casa y te demuestran que su trabajo es algo que realmente les encanta. Cada mes te sorprenden con nuevos sabores que reflejan la creatividad e ingenio.",
  },
  {
    author: "Negrete Alan",
    rating: 5,
    quote:
      "Uno se siente muy seguro y tranquilo en este espacio, las galletas son mega ricas, quieres probarlas todas de tan ricas que son. Fui a una reunión para ver un evento ahí y de verdad que la pasé muy a gusto platicando con todos.",
  },
];

// Real, verified against d-stellar's live Google Maps profile — refresh
// this pair together the next time reviews are pulled, don't let one drift
// from the other.
export const googleReviewStats = { average: 5.0, count: 148 };
