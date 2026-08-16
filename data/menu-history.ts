export type CookieStory = {
  number: string;
  name: string;
  tagline: { es: string; en: string };
  story: { es: string[]; en: string[] };
  pullQuote?: { es: string; en: string };
};

export type GalleryImage = {
  src: string;
  alt: { es: string; en: string };
};

export type MonthlyStory = {
  slug: string;
  chapterNumber?: number;
  monthLabel: { es: string; en: string };
  title: { es: string; en: string };
  hook: { es: string; en: string };
  flavorNames: string[];
  sectionEyebrow: { es: string; en: string };
  sectionTitle: { es: string; en: string };
  intro: { es: string[]; en: string[] };
  cookies: CookieStory[];
  closingEyebrow: { es: string; en: string };
  closingTitle: { es: string; en: string };
  closing: { es: string[]; en: string[] };
  oneLiner: { es: string; en: string };
  heroImage: string;
  heroAlt: { es: string; en: string };
  gallery: GalleryImage[];
};

// Real monthly menu narratives, written in-house by d-stellar and supplied
// as .docx files ("Historias de los Menús/"), condensed and translated here
// — never invented. August has no entry yet: it's the current, still-open
// month, with no finished write-up. See PROJECT_NOTES.md → "Historias del
// menú" for how to add the next chapter.
export const menuHistory: MonthlyStory[] = [
  {
    slug: "julio-2026",
    chapterNumber: 8,
    monthLabel: { es: "Julio 2026", en: "July 2026" },
    title: { es: "ALL STARS", en: "ALL STARS" },
    hook: {
      es: "Las cinco cookies más votadas por nuestra familia regresaron para contar quiénes habíamos sido y qué sabores ya se habían vuelto de todxs.",
      en: "The five cookies our community voted back returned to tell us who we'd been — and which flavors already belonged to everyone.",
    },
    flavorNames: ["COCOA Y CANELA", "TORONJA", "LAVANDA Y MIEL", "PLÁTANO", "ARROZ CON LECHE"],
    sectionEyebrow: { es: "Julio · el menú que ustedes eligieron", en: "July · the menu you chose" },
    sectionTitle: { es: "Cuando la familia eligió las estrellas", en: "When the family chose the stars" },
    intro: {
      es: [
        "Julio trajo uno de los momentos más esperados por nuestra comunidad: ALL STARS. Por primera vez, el menú no nació solamente de lo que queríamos imaginar en cocina, sino de una votación. Nuestrxs clientes —nuestra familia— recorrieron los sabores de los meses anteriores y eligieron las cinco piezas que deseaban volver a encontrar.",
        "El resultado fue una constelación inesperada. De diciembre regresaron Moonlight e Inferno Banana; enero volvió a la mesa con Arroz con Leche; y el bouquet de marzo recuperó dos de sus flores más queridas, Grapefruit Brulee y Lavender Nectar. No había una sola familia de sabores que explicara la selección — había cocoa, canela, toronja, lavanda, miel, plátano y una receta de casa.",
        "ALL STARS fue el instante en que el menú dejó de ser únicamente nuestro y se convirtió en un archivo construido entre todxs.",
      ],
      en: [
        "July brought one of our community's most anticipated moments: ALL STARS. For the first time, the menu didn't come only from what we wanted to imagine in the kitchen — it came from a vote. Our customers, our family, went back through every past month's flavors and chose the five pieces they wanted to see again.",
        "The result was an unexpected constellation. December sent back Moonlight and Inferno Banana; January's Arroz con Leche returned to the table; and March's bouquet gave back two of its most loved flowers, Grapefruit Brulee and Lavender Nectar. No single family of flavors explained the selection — there was cocoa, cinnamon, grapefruit, lavender, honey, banana, and a recipe from home.",
        "ALL STARS was the moment the menu stopped being only ours and became an archive built together with everyone.",
      ],
    },
    cookies: [
      {
        number: "01",
        name: "Moonlight",
        tagline: {
          es: "Cocoa, canela y una nube que hizo de la noche un refugio.",
          en: "Cocoa, cinnamon, and a cloud that turned the night into a refuge.",
        },
        story: {
          es: [
            "Moonlight había formado parte de las primeras cinco cookies que recibieron a nuestra familia en diciembre. La base de cocoa sostenía un marshmallow fluff de canela, ligero como una nube iluminada en mitad de la noche.",
            "Moonlight volvió porque algunas noches no se olvidan: se convierten en el lugar al que queremos regresar.",
          ],
          en: [
            "Moonlight was one of the first five cookies that welcomed our family in December. A cocoa base held a cinnamon marshmallow fluff, light as a cloud lit up in the middle of the night.",
            "Moonlight came back because some nights aren't forgotten — they become the place you want to return to.",
          ],
        },
      },
      {
        number: "02",
        name: "Grapefruit Brulee",
        tagline: {
          es: "Una toronja luminosa escondida bajo un casco de azúcar caramelizada.",
          en: "A luminous grapefruit hiding under a shell of caramelized sugar.",
        },
        story: {
          es: [
            "Llegó por primera vez con el bouquet de marzo. Sobre la cookie de toronja descansaba un curd cremoso y ácido, coronado por una cubierta de azúcar caramelizada que había que romper para llegar al centro.",
            "Su lugar en ALL STARS confirmó que una cookie también puede ser un ritual, y que el espectáculo empieza antes del primer bocado.",
          ],
          en: [
            "It first arrived with March's bouquet. On top of the grapefruit cookie sat a creamy, tart curd, capped with a caramelized-sugar shell you had to crack to reach the center.",
            "Its place in ALL STARS confirmed a cookie can also be a ritual — and that the show starts before the first bite.",
          ],
        },
      },
      {
        number: "03",
        name: "Lavender Nectar",
        tagline: {
          es: "Lavanda, mascarpone y miel: la delicadeza convertida en fuerza.",
          en: "Lavender, mascarpone, and honey: delicacy turned into strength.",
        },
        story: {
          es: [
            "También nació en marzo. Una crema montada de mascarpone infusionada con lavanda dibujaba una flor sobre la cookie, y en el centro la miel floral aparecía como néctar.",
            "Que nuestra familia la eligiera para volver fue una señal poderosa: también había lugar para las ideas sutiles y aromáticas.",
          ],
          en: [
            "It was also born in March. A lavender-infused whipped mascarpone cream drew a flower across the cookie, with floral honey at its center like nectar.",
            "That our family chose it to come back was a powerful signal: there was room for subtle, aromatic ideas too.",
          ],
        },
      },
      {
        number: "04",
        name: "Inferno Banana",
        tagline: {
          es: "Plátano al fuego: un sabor conocido que decidió volverse irreverente.",
          en: "Banana set to fire: a familiar flavor that decided to turn irreverent.",
        },
        story: {
          es: [
            "Había estado ahí desde diciembre. Sobre la base de vainilla aparecía un curd de plátano flameado y rostizado, acompañado por esferas de caramelo sabor plátano.",
            "Su regreso resumió una parte esencial de d-stellar: tomar algo conocido, acercarlo al fuego y devolverlo transformado.",
          ],
          en: [
            "It had been there since December. On a vanilla base sat a flambéed, roasted banana curd, alongside little spheres of banana caramel.",
            "Its return summed up something essential about d-stellar: take something familiar, bring it near the fire, and hand it back transformed.",
          ],
        },
      },
      {
        number: "05",
        name: "Arroz con Leche",
        tagline: {
          es: "Nuez moscada, cremosidad y una receta familiar elegida por otra familia.",
          en: "Nutmeg, creaminess, and a family recipe chosen by another family.",
        },
        story: {
          es: [
            "Había nacido en enero, a partir de la receta de la mamá de Lalo y el postre favorito de Hernán. La cookie, especiada con nuez moscada, guardaba al centro un arroz con leche goloso y extraordinariamente cremoso.",
            "Que llegara a ALL STARS confirmó que el hogar también puede construirse alrededor de una cookie.",
          ],
          en: [
            "It was born in January, from Lalo's mom's recipe and Hernán's favorite dessert. The nutmeg-spiced cookie held a rich, extraordinarily creamy rice pudding at its center.",
            "Reaching ALL STARS confirmed that home can also be built around a cookie.",
          ],
        },
      },
    ],
    closingEyebrow: { es: "Lo que julio dejó en d-stellar", en: "What July left at d-stellar" },
    closingTitle: { es: "Nuestra historia también pertenece a quienes la prueban", en: "Our story also belongs to the people who taste it" },
    closing: {
      es: [
        "Nuestro primer ALL STARS fue un espejo diferente. Hasta entonces, cada colección había mostrado quiénes queríamos ser desde nuestra propia mirada. Julio nos permitió observar esa historia a través de quienes la habían probado, recomendado, extrañado y convertido en parte de sus propios recuerdos.",
        "Las cinco elegidas no compartían una fórmula. Precisamente por eso representaban tan bien a d-stellar: nuestra familia no votó por la uniformidad, sino por la diversidad, el riesgo y la emoción de encontrar algo que no se parece a todo lo demás.",
      ],
      en: [
        "Our first ALL STARS was a different kind of mirror. Until then, every collection had shown who we wanted to be from our own point of view. July let us see that story through the people who'd tasted it, recommended it, missed it, and made it part of their own memories.",
        "The five chosen pieces didn't share a formula. That's exactly why they represented d-stellar so well: our family didn't vote for uniformity — they voted for diversity, risk, and the thrill of finding something that doesn't look like everything else.",
      ],
    },
    oneLiner: {
      es: "Cinco regresos, un voto colectivo y la certeza de que nuestras estrellas ya brillaban en la memoria de alguien más.",
      en: "Five comebacks, one collective vote, and the certainty that our stars were already shining in someone else's memory.",
    },
    heroImage: "/images/historias/julio-2026/hero.webp",
    heroAlt: {
      es: "Caja ALL STARS de d-stellar con las cinco cookies más votadas de julio 2026",
      en: "d-stellar's ALL STARS box with July 2026's five most-voted cookies",
    },
    gallery: [
      {
        src: "/images/historias/julio-2026/gallery-1.webp",
        alt: { es: "Caja abierta con la colección ALL STARS de julio", en: "Open box with July's ALL STARS collection" },
      },
    ],
  },
  {
    slug: "junio-2026",
    chapterNumber: 7,
    monthLabel: { es: "Junio 2026", en: "June 2026" },
    title: { es: "Glow with Pride", en: "Glow with Pride" },
    hook: {
      es: "El menú que dejó la ficción para mirar de frente la historia, la memoria y el futuro que todavía estamos construyendo.",
      en: "The menu that set fiction aside to look straight at history, memory, and the future we're still building.",
    },
    flavorNames: ["BUGAMBILIA", "TÉ BLANCO", "CEREZA COLA", "MEZCAL E HIGO", "LIMÓN"],
    sectionEyebrow: { es: "Junio · el orgullo como memoria", en: "June · pride as memory" },
    sectionTitle: { es: "La luz que heredamos", en: "The light we inherited" },
    intro: {
      es: [
        "Junio fue uno de nuestros meses más difíciles en ventas. También fue uno de los más importantes para entender quiénes somos.",
        "Después de jugar con historias de ficción, decidimos detenernos y mirar la historia real: la de quienes ocuparon escenarios que parecían negarles un lugar, la de quienes marcharon por derechos que no alcanzarían a disfrutar y la de quienes todavía hacen de su existencia una forma de resistencia.",
        "La narrativa reunió a dos íconos de la cultura popular que desobedecieron los límites de su tiempo —Juan Gabriel y Cristina Ortiz, La Veneno— y tres momentos de una misma historia: agradecer a quienes nos precedieron, reconocer a quienes arden en el presente y confiar en la luz de quienes vendrán.",
      ],
      en: [
        "June was one of our hardest months in sales. It was also one of the most important for understanding who we are.",
        "After playing with fictional stories, we decided to stop and look at the real one: the story of people who took stages that seemed to deny them a place, who marched for rights they wouldn't live to enjoy, and who still make their own existence a form of resistance.",
        "The narrative brought together two pop-culture icons who defied the limits of their time — Juan Gabriel and Cristina Ortiz, La Veneno — and three moments of the same story: thanking those who came before us, honoring those burning brightly today, and trusting the light of those still to come.",
      ],
    },
    cookies: [
      {
        number: "01",
        name: "Lo que se ve no se pregunta",
        tagline: {
          es: "Bugambilia, rosa mexicano y la decisión de ocupar el escenario completo.",
          en: "Bougainvillea, Mexican pink, and the decision to take up the whole stage.",
        },
        story: {
          es: [
            "Nació de Juan Gabriel, quien sin entregar explicaciones sobre su vida privada convirtió el escenario en un espacio donde podía existir por completo. La estética partió de sus vestuarios: bugambilia y rosas, una ganache de chocolate blanco y hojas de bugambilia hidratadas con su propio jarabe.",
            "Como Juan Gabriel, esta pieza no pedía permiso para ser intensa, mexicana, sensible y espectacular.",
          ],
          en: [
            "Born from Juan Gabriel, who — without ever explaining his private life — turned the stage into a place where he could exist fully. The look drew from his stage costumes: bougainvillea and roses, a white chocolate ganache, and bougainvillea leaves hydrated in their own syrup.",
            "Like Juan Gabriel, this piece didn't ask permission to be intense, Mexican, sensitive, and spectacular.",
          ],
        },
      },
      {
        number: "02",
        name: "Por quienes brillaron antes",
        tagline: {
          es: "Una nube blanca para nombrar la ausencia y agradecer el camino.",
          en: "A white cloud to name absence and give thanks for the road.",
        },
        story: {
          es: [
            "La pausa más silenciosa de Glow with Pride: no celebraba a una figura, sino a quienes marcharon, gritaron y amaron imaginando un mundo que quizá no alcanzarían a ver. La cookie de té blanco sostenía una crema tan aireada que parecía una nube; al centro, un gel de durazno blanco.",
            "La tratamos como una pieza de luto, gratitud y profundo respeto.",
          ],
          en: [
            "The quietest pause in Glow with Pride: it didn't celebrate one figure, but everyone who marched, shouted, and loved while imagining a world they might not live to see. The white tea cookie held a cream so airy it looked like a cloud, with a white peach gel at its center.",
            "We treated it as a piece of mourning, gratitude, and deep respect.",
          ],
        },
      },
      {
        number: "03",
        name: "Veneno pa' tu piel",
        tagline: {
          es: "Cereza cola, brillo y una vida que se negó a pasar inadvertida.",
          en: "Cherry cola, shimmer, and a life that refused to go unnoticed.",
        },
        story: {
          es: [
            "Cristina Ortiz, La Veneno, fue una de las primeras mujeres trans en alcanzar visibilidad masiva en televisión. Sobre una base de vainilla, cerezas en almíbar aludían a las marcas de las violencias que atravesó; una crema roja y sedosa representaba su transición.",
            "Su brillo no borraba las heridas: afirmaba que ninguna de ellas podía arrebatarle el derecho a ser vista. Se convirtió en una de las favoritas de nuestra comunidad.",
          ],
          en: [
            "Cristina Ortiz, La Veneno, was one of the first trans women to reach mass visibility on television. On a vanilla base, cherries in syrup nodded to the marks left by the violence she survived; a silky red cream stood for her transition.",
            "Her shine didn't erase the wounds — it affirmed that none of them could take away her right to be seen. It became one of our community's favorites.",
          ],
        },
      },
      {
        number: "04",
        name: "Arde Insurrecta",
        tagline: {
          es: "Maguey, higo y mezcal para quienes crecen incluso cuando el entorno les exige desaparecer.",
          en: "Agave, fig, and mezcal for those who grow even when the world tells them to disappear.",
        },
        story: {
          es: [
            "El maguey se aferra a la vida en paisajes secos y da origen al mezcal. La base de vainilla llevaba una crema mineral de mezcal y, al centro, una compota de higo con más mezcal.",
            "El alcohol ya no formaba parte de la experiencia, pero permanecían sus notas amaderadas: el recuerdo de una celebración por ser, finalmente, quien siempre se quiso ser.",
          ],
          en: [
            "Agave clings to life in dry, difficult landscapes, and gives rise to mezcal. The vanilla base carried a mineral mezcal cream and, at the center, a fig compote with more mezcal.",
            "The alcohol was no longer part of the experience, but its woody notes stayed — the memory of a celebration for finally being who you always wanted to be.",
          ],
        },
      },
      {
        number: "05",
        name: "Mañana también brilla",
        tagline: {
          es: "Limón, un corazón orgulloso y un arcoíris que explota en cada bocado.",
          en: "Lemon, a proud heart, and a rainbow that pops in every bite.",
        },
        story: {
          es: [
            "La cookie de limón guardaba en el centro un arcoíris con un corazón lleno de orgullo; por encima, una crema ácida sostenía popping bobas de manzana verde, blueberry y pink lemonade.",
            "El mañana no brilla por accidente: se ilumina con cada persona que hoy decide no volver a esconderse.",
          ],
          en: [
            "The lemon cookie held a rainbow with a proud heart at its center; on top, a tart cream carried popping boba in green apple, blueberry, and pink lemonade.",
            "Tomorrow doesn't shine by accident — it lights up with every person who today decides not to hide again.",
          ],
        },
      },
    ],
    closingEyebrow: { es: "Lo que junio dejó en d-stellar", en: "What June left at d-stellar" },
    closingTitle: { es: "El orgullo no se mide únicamente en ventas", en: "Pride isn't measured in sales alone" },
    closing: {
      es: [
        "Junio fue uno de nuestros peores meses en ventas. Esa verdad también pertenece a la historia. Sin embargo, dejó una de las colecciones que mejor explicó por qué existe d-stellar: para crear desde la identidad, abrir espacio a la diversidad y convertir cada sabor en una conversación que valga la pena tener.",
        "Tal vez el menú no fue el más vendido; fue, en cambio, uno de los que más profundamente se pareció a nosotrxs.",
      ],
      en: [
        "June was one of our worst months in sales. That truth belongs to the story too. And yet it left behind one of the collections that best explains why d-stellar exists: to create from identity, make room for diversity, and turn every flavor into a conversation worth having.",
        "Maybe the menu wasn't the best-selling one. It was, instead, one of the ones that looked most like us.",
      ],
    },
    oneLiner: {
      es: "Cinco luces para quienes abrieron camino, quienes resisten hoy y quienes todavía están por encenderse.",
      en: "Five lights for those who paved the way, those resisting today, and those still waiting to catch fire.",
    },
    heroImage: "/images/historias/junio-2026/hero.webp",
    heroAlt: {
      es: "Caja de d-stellar con la colección Glow with Pride de junio 2026",
      en: "d-stellar box with June 2026's Glow with Pride collection",
    },
    gallery: [
      {
        src: "/images/historias/junio-2026/gallery-1.webp",
        alt: { es: "Fila de cinco cookies de la colección Glow with Pride", en: "Row of five cookies from the Glow with Pride collection" },
      },
      {
        src: "/images/historias/junio-2026/gallery-2.webp",
        alt: { es: "Parte del equipo de d-stellar horneando la colección de junio", en: "Part of the d-stellar team baking June's collection" },
      },
    ],
  },
  {
    slug: "mayo-2026",
    chapterNumber: 6,
    monthLabel: { es: "Mayo 2026", en: "May 2026" },
    title: { es: "May the Force BE You", en: "May the Force BE You" },
    hook: {
      es: "El menú galáctico que dejó de buscar la fuerza afuera y decidió convertirla en valentía, resiliencia e identidad.",
      en: "The galactic menu that stopped looking for the force out there and decided to turn it into courage, resilience, and identity.",
    },
    flavorNames: ["AGUACATE", "JAMAICA", "LIMÓN", "MARACUYÁ", "BLUEBERRIES"],
    sectionEyebrow: { es: "Mayo · una alianza desde otra galaxia", en: "May · an alliance from another galaxy" },
    sectionTitle: { es: "Cuando no había fecha, inventamos un universo", en: "When there was no date, we invented a universe" },
    intro: {
      es: [
        "Mayo comenzó con una dificultad real: no encontrábamos una fecha o celebración que nos ayudara a expresar con honestidad la visión de d-stellar. Entonces apareció una colaboración con CDMX Secreta, y con ella, un viaje hacia un universo que ha acompañado a generaciones enteras: con la llegada de The Mandalorian & Grogu a los cines, creamos un menú inspirado en sabores, planetas y personajes de Star Wars.",
        "May the Force be with you se convirtió en May the Force BE You. El cambio de una sola palabra transformó la historia: ser la fuerza significa elegir con valentía, resistir después de las caídas y defender aquello que nos vuelve distintxs.",
        "Baby Latto habló del poder que puede habitar en algo pequeño; Ashokah's Montrals, de escuchar la propia brújula; Twin Sun Sands, de caminar hacia horizontes nuevos; Lava Castle, de atravesar el fuego; y Dstellar Noomies, de conservar el asombro.",
      ],
      en: [
        "May started with a real problem: we couldn't find a date or occasion that would let us honestly express d-stellar's vision. Then a collaboration with CDMX Secreta appeared, and with it, a trip into a universe that's accompanied whole generations: with The Mandalorian & Grogu hitting theaters, we built a menu inspired by Star Wars flavors, planets, and characters.",
        "\"May the Force be with you\" became \"May the Force BE You.\" Changing a single word transformed the whole story: being the force means choosing courage, standing back up after falling, and defending what makes you different.",
        "Baby Latto spoke to the power that can live in something small; Ashokah's Montrals, to listening to your own compass; Twin Sun Sands, to walking toward new horizons; Lava Castle, to crossing through fire; and Dstellar Noomies, to holding onto wonder.",
      ],
    },
    cookies: [
      {
        number: "01",
        name: "Baby Latto",
        tagline: {
          es: "Una presencia pequeña, adorable y verde con un corazón imposible de anticipar.",
          en: "A small, adorable, green presence with a heart you'd never see coming.",
        },
        story: {
          es: [
            "Recuperó la imagen de un personaje pequeño y verde. Al centro, un gelato de aguacate elaborado en casa retomaba su color y lo convertía en una decisión culinaria inesperada.",
            "Baby Latto demostraba que la fuerza también puede presentarse con ojos enormes, color verde y una ternura imposible de ignorar.",
          ],
          en: [
            "It borrowed the image of a small green character. At its center, a house-made avocado gelato echoed his color and turned it into an unexpected culinary choice.",
            "Baby Latto proved the force can also show up with huge eyes, green skin, and a tenderness impossible to ignore.",
          ],
        },
      },
      {
        number: "02",
        name: "Ashokah's Montrals",
        tagline: {
          es: "Una silueta reconocible convertida en color, acidez y movimiento.",
          en: "A recognizable silhouette turned into color, tartness, and movement.",
        },
        story: {
          es: [
            "Tomó la silueta de las montrals de una raza galáctica y la convirtió en una pieza enrollada, rellena de mermelada de jamaica intensa y ácida, con un glaseado azul coloreado con espirulina.",
            "La pieza hablaba de convicción: escuchar la intuición incluso cuando el camino propio obliga a separarse de lo esperado.",
          ],
          en: [
            "It took the silhouette of a galactic species' head-tails and turned it into a rolled piece, filled with an intense, tart hibiscus jam, finished with a spirulina-blue glaze.",
            "The piece spoke of conviction: listening to your intuition even when your own path forces you away from what's expected.",
          ],
        },
      },
      {
        number: "03",
        name: "Twin Sun Sands",
        tagline: {
          es: "La luz de dos soles convertida en vainilla, limón y deseo de explorar.",
          en: "The light of two suns turned into vanilla, lemon, and the urge to explore.",
        },
        story: {
          es: [
            "Imaginaba mirar un horizonte donde dos soles caen al mismo tiempo. La base de vainilla aportaba calidez; sobre ella, una ganache de limón introducía brillo y acidez.",
            "La cookie representaba el instante previo al viaje, cuando quedarse es posible, pero explorar se vuelve irresistible.",
          ],
          en: [
            "It imagined watching a horizon where two suns set at once. The vanilla base brought warmth; on top, a lemon ganache added brightness and tartness.",
            "The cookie captured the moment right before a journey — when staying is still possible, but exploring becomes irresistible.",
          ],
        },
      },
      {
        number: "04",
        name: "Lava Castle",
        tagline: {
          es: "Una batalla canónica convertida en oscuridad, acidez y ríos de lava.",
          en: "A canon battle turned into darkness, tartness, and rivers of lava.",
        },
        story: {
          es: [
            "La cookie de cocoa alcalina construía un paisaje oscuro y amargo. Encima, un gel de maracuyá naranja y amarillo simulaba corrientes de lava atravesando el cacao con acidez y luz.",
            "No era una pieza sobre la derrota, sino sobre lo que queda después de cruzar el incendio: la posibilidad de resistir, aprender y reconstruirse.",
          ],
          en: [
            "The alkalized-cocoa cookie built a dark, bitter landscape. On top, an orange-and-yellow passionfruit gel simulated lava currents cutting through the cocoa with acidity and light.",
            "It wasn't a piece about defeat, but about what's left after crossing the fire: the chance to endure, learn, and rebuild.",
          ],
        },
      },
      {
        number: "05",
        name: "Dstellar Noomies",
        tagline: {
          es: "Un macaron azul que convirtió el antojo más tierno de la galaxia en el último bocado.",
          en: "A blue macaron that turned the galaxy's sweetest craving into the last bite.",
        },
        story: {
          es: [
            "Nació de la comida favorita de nuestro pequeño alien verde: un macaron delicado por fuera, con un relleno de crema de mascarpone y gel de blueberries en su interior.",
            "Recordaba que incluso quienes cargan una misión enorme necesitan detenerse por algo que les haga feliz.",
          ],
          en: [
            "It came from our little green alien's favorite snack: a macaron, delicate on the outside, filled with mascarpone cream and a blueberry gel.",
            "A reminder that even those carrying an enormous mission need to stop for something that makes them happy.",
          ],
        },
      },
    ],
    closingEyebrow: { es: "Lo que mayo dejó en d-stellar", en: "What May left at d-stellar" },
    closingTitle: { es: "La fuerza dejó de ser una promesa y se volvió identidad", en: "The force stopped being a promise and became identity" },
    closing: {
      es: [
        "La colaboración con CDMX Secreta demostró que una dificultad creativa también puede abrir un portal. Cuando el calendario no nos entregó una historia, construimos una constelación propia: cinco piezas capaces de conversar con un fandom inmenso sin perder el sabor, el humor ni la personalidad de d-stellar.",
        "Mayo convirtió esa enseñanza en una declaración: la fuerza no solo está contigo. La fuerza puedes ser tú.",
      ],
      en: [
        "The collaboration with CDMX Secreta proved a creative dead end can also open a portal. When the calendar didn't hand us a story, we built our own constellation: five pieces able to speak to a massive fandom without losing d-stellar's flavor, humor, or personality.",
        "May turned that lesson into a statement: the force isn't just with you. The force can be you.",
      ],
    },
    oneLiner: {
      es: "Cinco piezas, una galaxia y la decisión de convertirnos en nuestra propia fuerza.",
      en: "Five pieces, one galaxy, and the decision to become our own force.",
    },
    heroImage: "/images/historias/mayo-2026/hero.webp",
    heroAlt: {
      es: "Cookie con forma de Grogu de la colección May the Force BE You",
      en: "Grogu-shaped cookie from the May the Force BE You collection",
    },
    gallery: [
      { src: "/images/historias/mayo-2026/gallery-1.webp", alt: { es: "Cookie estrella con crema de la colección de mayo", en: "Star-shaped cookie with cream from May's collection" } },
      { src: "/images/historias/mayo-2026/gallery-2.webp", alt: { es: "Lava Castle, cookie de cocoa alcalina con gel de maracuyá", en: "Lava Castle, the alkalized-cocoa cookie with passionfruit gel" } },
      { src: "/images/historias/mayo-2026/gallery-3.webp", alt: { es: "Dstellar Noomies, macaron azul con blueberries", en: "Dstellar Noomies, the blue macaron with blueberries" } },
    ],
  },
  {
    slug: "abril-2026",
    chapterNumber: 5,
    monthLabel: { es: "Abril 2026", en: "April 2026" },
    title: { es: "Cuando el mundo cabía en una cookie", en: "When the whole world fit inside a cookie" },
    hook: {
      es: "Cinco recuerdos de infancia traídos al presente para mirar, con emoción, todo lo que habíamos crecido.",
      en: "Five childhood memories brought into the present to look, with real feeling, at how far we'd grown.",
    },
    flavorNames: ["FLAN", "PASTEL", "OSITO", "CEREAL", "BANANA SPLIT"],
    sectionEyebrow: { es: "Abril · la memoria se vuelve menú", en: "April · memory becomes menu" },
    sectionTitle: { es: "Volver también era avanzar", en: "Going back was also moving forward" },
    intro: {
      es: [
        "Para Lalo, abril tenía una emoción especial: tomar recuerdos que habían vivido durante años en la memoria y convertirlos en algo que pudiera compartirse. Un flan preparado por mamá, un pastel con demasiado chocolate, un osito de compañía, la leche que quedaba después del cereal o un banana split podían abrir una puerta completa hacia el pasado.",
        "La intención no era copiar esos postres exactamente, sino recuperar lo que nos hacían sentir. Por primera vez cambiamos la forma de nuestra estrella, llevamos el chocolate hasta su versión más exuberante y demostramos que un recuerdo tan tradicional como el flan podía renacer sin productos de origen animal.",
      ],
      en: [
        "For Lalo, April carried a special feeling: taking memories that had lived for years and turning them into something shareable. A flan mom used to make, a cake with too much chocolate, a stuffed bear, the milk left over after cereal, a banana split — each one could open a whole door back to the past.",
        "The goal wasn't to copy those desserts exactly, but to recover what they made us feel. For the first time we changed our star's shape, pushed chocolate to its most exuberant version, and proved a memory as traditional as flan could be reborn without any animal products.",
      ],
    },
    cookies: [
      {
        number: "01",
        name: "Golden Hug",
        tagline: {
          es: "El flan especial de Lalito, convertido en un abrazo dorado y completamente vegano.",
          en: "Lalito's special flan, turned into a golden, fully vegan hug.",
        },
        story: {
          es: [
            "En la casa de Lalo, el flan significaba algo más que un postre: cada vez que su mamá quería sorprenderlo preparaba el flan especial de Lalito. Golden Hug tomó aquel gesto y lo llevó al lenguaje de d-stellar en una cookie de caramelo cubierta con crema de flan cien por ciento vegana.",
            "Golden Hug no imitaba un flan: recordaba la forma en que una mamá puede decir 'te quiero' sin pronunciar una palabra.",
          ],
          en: [
            "In Lalo's house, flan meant more than dessert — whenever his mom wanted to surprise him, she'd make Lalito's special flan. Golden Hug took that gesture and translated it into d-stellar's language: a caramel cookie topped with a 100% vegan flan cream.",
            "Golden Hug wasn't imitating a flan — it was recalling the way a mom can say \"I love you\" without saying a word.",
          ],
        },
      },
      {
        number: "02",
        name: "Midnight Cake",
        tagline: {
          es: "Todo el chocolate que nuestro niño interior llevaba tiempo pidiendo.",
          en: "All the chocolate our inner child had been asking for.",
        },
        story: {
          es: [
            "Nuestra comunidad siempre pedía más y más chocolate. Fue, hasta ese momento, nuestra cookie más monchosa: base de chocolate semiamargo, tres leches de cocoa, ganache, crumble de chocolate y caramelo salado.",
            "Era abundante y descarada, pero cada contraste estaba pensado para conservar el balance.",
          ],
          en: [
            "Our community always asked for more and more chocolate. It was, up to that point, our most decadent cookie yet: a semi-sweet chocolate base, cocoa tres leches, ganache, chocolate crumble, and salted caramel.",
            "It was generous and unapologetic, but every contrast was built to keep the balance intact.",
          ],
        },
      },
      {
        number: "03",
        name: "Teddy Bear",
        tagline: {
          es: "La primera vez que nuestra estrella cambió de forma para mostrar el rostro de un recuerdo.",
          en: "The first time our star changed shape to show the face of a memory.",
        },
        story: {
          es: [
            "Por primera vez en la historia de d-stellar, la estrella cedió su silueta: Teddy Bear apareció con una carita de osito, de vainilla con chocolate con leche y un mochi de vainilla escondido en su interior, simbolizando el corazón del peluche.",
            "El cambio de forma no alejaba a d-stellar de su identidad; demostraba que una marca también puede crecer sin olvidar a quien la acompañó desde el principio.",
          ],
          en: [
            "For the first time in d-stellar's history, the star gave up its silhouette: Teddy Bear showed up with a little bear face, made of vanilla and milk chocolate with a vanilla mochi hidden inside, standing in for the stuffed animal's heart.",
            "Changing shape didn't pull d-stellar away from its identity — it proved a brand can grow without forgetting who's been with it from the start.",
          ],
        },
      },
      {
        number: "04",
        name: "Rainbow Milk",
        tagline: {
          es: "La última cucharada del cereal era apenas el comienzo.",
          en: "The last spoonful of cereal was only the beginning.",
        },
        story: {
          es: [
            "Rainbow Milk nació de esa alquimia cotidiana: el fondo del tazón convertido en un recuerdo dulce, tostado y lleno de color, sobre una cookie de leche tostada con bombones de cereal.",
            "El final era un dust de malvaviscos liofilizados y acidificados: colorido, crujiente y con un toque ácido que despertaba el conjunto.",
          ],
          en: [
            "Rainbow Milk was born from that everyday alchemy: the bottom of the bowl turned into a sweet, toasty, colorful memory, built on a toasted-milk cookie with cereal marshmallows.",
            "The finish was a dust of freeze-dried, acidified marshmallow — colorful, crunchy, and tangy enough to wake up the whole thing.",
          ],
        },
      },
      {
        number: "05",
        name: "Nana Split",
        tagline: {
          es: "Un banana split convertido en cookie, construido para volver a mirar hacia arriba con asombro.",
          en: "A banana split turned into a cookie, built to make you look up in wonder again.",
        },
        story: {
          es: [
            "Partía de una cookie sabor plátano con rebanadas de plátano fresco, dos cremas que sabían a helado sin perder firmeza, fresa liofilizada, crema batida y una cereza que coronaba todo.",
            "Nana Split no pedía discreción: llegaba a la mesa como una celebración completa.",
          ],
          en: [
            "It started with a banana-flavored cookie topped with fresh banana slices, two creams built to taste like ice cream without losing their structure, freeze-dried strawberry, whipped cream, and a cherry on top.",
            "Nana Split didn't ask to be understated — it arrived at the table like a full-blown celebration.",
          ],
        },
      },
    ],
    closingEyebrow: { es: "Lo que abril dejó en d-stellar", en: "What April left at d-stellar" },
    closingTitle: { es: "Mirar atrás nos enseñó cuánto habíamos crecido", en: "Looking back taught us how much we'd grown" },
    closing: {
      es: [
        "Abril no fue un intento de escapar hacia el pasado. Fue una manera de agradecerlo. Cada cookie tomó una memoria específica y le dio un lenguaje nuevo: el flan se volvió vegano, el pastel se convirtió en una experiencia de chocolate sin reservas, el osito cambió nuestra silueta.",
        "Al traerlas al presente, d-stellar convirtió vulnerabilidad en creatividad, ternura en atrevimiento y nostalgia en una razón para seguir creciendo.",
      ],
      en: [
        "April wasn't an attempt to escape into the past — it was a way of thanking it. Each cookie took a specific memory and gave it a new language: flan turned vegan, cake became an unrestrained chocolate experience, the teddy bear changed our own silhouette.",
        "By bringing them into the present, d-stellar turned vulnerability into creativity, tenderness into boldness, and nostalgia into a reason to keep growing.",
      ],
    },
    oneLiner: {
      es: "Cinco recuerdos de infancia convertidos en cookies para volver, agradecer y seguir creciendo.",
      en: "Five childhood memories turned into cookies, so we could go back, say thank you, and keep growing.",
    },
    heroImage: "/images/historias/abril-2026/hero.webp",
    heroAlt: {
      es: "Caja con las cinco cookies de la colección de abril, incluyendo Teddy Bear",
      en: "Box with April's five cookies, including Teddy Bear",
    },
    gallery: [
      {
        src: "/images/historias/abril-2026/gallery-1.webp",
        alt: { es: "Fila completa de las cinco cookies de abril en su caja", en: "Full row of April's five cookies in their box" },
      },
    ],
  },
  {
    slug: "marzo-2026",
    chapterNumber: 4,
    monthLabel: { es: "Marzo 2026", en: "March 2026" },
    title: { es: "Un bouquet que podía comerse", en: "A bouquet you could eat" },
    hook: {
      es: "La colección que abrió la primavera con flores, cítricos, aromas frescos y cinco maneras distintas de florecer.",
      en: "The collection that opened spring with flowers, citrus, fresh scents, and five different ways to bloom.",
    },
    flavorNames: ["LAVANDA", "TORONJA", "MATCHA", "DURAZNO", "MANGO"],
    sectionEyebrow: { es: "Marzo · la primavera entra al menú", en: "March · spring enters the menu" },
    sectionTitle: { es: "Un jardín hecho de sabor", en: "A garden made of flavor" },
    intro: {
      es: [
        "Después de narrar en febrero las etapas del enamoramiento, marzo nos pidió mirar hacia afuera. Así nació una colección de flores: un bouquet de cinco cookies en el que cada sabor ocupaba un lugar distinto. Lavender Nectar era el perfume suave; Grapefruit Brulee, el destello cítrico; Emerald Bloom, el brote verde; Peach Star, el abrazo tibio; y Mango Bloom, la flor tropical que cerraba el arreglo encendida por el fuego.",
        "No se trataba únicamente de usar ingredientes florales o frutales. La primavera también tenía que suceder frente a quien recibía la cookie: había un centro de miel por descubrir, una costra de azúcar que debía quebrarse, un merengue que se transformaba con la flama.",
      ],
      en: [
        "After telling the stages of falling in love in February, March asked us to look outward. That's how a collection of flowers was born: a bouquet of five cookies where every flavor held its own place. Lavender Nectar was the soft perfume; Grapefruit Brulee, the citrus spark; Emerald Bloom, the green shoot; Peach Star, the warm hug; and Mango Bloom, the tropical flower that closed the arrangement, lit by fire.",
        "It wasn't only about using floral or fruity ingredients. Spring also had to happen in front of whoever received the cookie: a honey center waiting to be discovered, a sugar shell that had to crack, a meringue transformed by an open flame.",
      ],
    },
    cookies: [
      {
        number: "01",
        name: "Lavender Nectar",
        tagline: {
          es: "Una flor construida pétalo por pétalo alrededor de un corazón de miel.",
          en: "A flower built petal by petal around a heart of honey.",
        },
        story: {
          es: [
            "Cookie de lavanda inglesa y chocolate blanco, coronada con una crema de mascarpone montada e infusionada con lavanda que seguía la silueta de la estrella. Al centro, miel floral: el néctar de aquella flor comestible.",
            "Lavender Nectar no quería saber a perfume: quería capturar el instante en que una flor comienza a soltar su aroma.",
          ],
          en: [
            "An English lavender and white chocolate cookie, crowned with a lavender-infused whipped mascarpone cream that traced the star's silhouette. At the center, floral honey — the nectar of that edible flower.",
            "Lavender Nectar didn't want to taste like perfume — it wanted to capture the instant a flower starts releasing its scent.",
          ],
        },
      },
      {
        number: "02",
        name: "Grapefruit Brulee",
        tagline: {
          es: "Una coraza de caramelo que había que romper para llegar a la primavera.",
          en: "A caramel shell you had to break to reach spring.",
        },
        story: {
          es: [
            "Cookie de toronja cítrica y vivaz, con un curd cremoso y envolvente encima. La sorpresa estaba en la superficie: una capa de azúcar caramelizada formaba un pequeño casco que debía quebrarse para llegar al curd.",
            "Ese crujido era parte del sabor y también de la historia: una cookie que invitaba a romper la superficie para descubrir su centro fresco.",
          ],
          en: [
            "A bright, citrusy grapefruit cookie with a creamy, enveloping curd on top. The surprise was on the surface: a layer of caramelized sugar formed a small shell you had to crack to reach the curd.",
            "That crack was part of the flavor and part of the story too — a cookie that invited you to break the surface to find its fresh center.",
          ],
        },
      },
      {
        number: "03",
        name: "Emerald Bloom",
        tagline: {
          es: "El brote verde: matcha ceremonial, coco tostado y una flor completamente vegana.",
          en: "The green shoot: ceremonial matcha, toasted coconut, and a fully vegan flower.",
        },
        story: {
          es: [
            "Cookie vegana de matcha ceremonial con trozos de coco tostado, crema de matcha cien por ciento vegana y, al centro, un curd vegano de coco tostado.",
            "En este bouquet, la opción vegana no ocupaba un rincón: era una de las flores centrales.",
          ],
          en: [
            "A vegan ceremonial-matcha cookie with toasted coconut pieces, a 100% vegan matcha cream, and a vegan toasted-coconut curd at the center.",
            "In this bouquet, the vegan option didn't sit off in a corner — it was one of the central flowers.",
          ],
        },
      },
      {
        number: "04",
        name: "Peach Star",
        tagline: {
          es: "El abrazo tibio de un cobbler convertido en una estrella de primavera.",
          en: "The warm hug of a cobbler turned into a spring star.",
        },
        story: {
          es: [
            "Base de canela con un peach cobbler jugoso y perfumado, streusel de mantequilla y un glaseado que unía cada capa.",
            "Era luminosa sin perder calidez: fresca como una tarde de primavera y, al mismo tiempo, tan reconfortante como un postre recién salido de casa.",
          ],
          en: [
            "A cinnamon base with a juicy, fragrant peach cobbler, a buttery streusel, and a glaze tying every layer together.",
            "It was bright without losing its warmth — as fresh as a spring afternoon, and as comforting as a dessert straight out of home.",
          ],
        },
      },
      {
        number: "05",
        name: "Mango Bloom",
        tagline: {
          es: "Una flor de mango donde ningún bocado sabía exactamente igual al anterior.",
          en: "A mango flower where no bite tasted exactly like the last.",
        },
        story: {
          es: [
            "Masa de mango salpicada de trozos deshidratados, con una flor dibujada en merengue suizo y una compota de mango dulce al centro. La flama tostaba el merengue y liberaba un aroma nuevo.",
            "Mango Bloom no cerraba el jardín: lo dejaba encendido.",
          ],
          en: [
            "A mango dough studded with dehydrated mango pieces, topped with a flower drawn in Swiss meringue and a sweet mango compote at the center. An open flame toasted the meringue and released a new aroma.",
            "Mango Bloom didn't close the garden — it left it burning.",
          ],
        },
      },
    ],
    closingEyebrow: { es: "Lo que marzo dejó en d-stellar", en: "What March left at d-stellar" },
    closingTitle: { es: "Aprendimos que un menú también puede florecer", en: "We learned a menu can bloom too" },
    closing: {
      es: [
        "Marzo confirmó que una colección puede funcionar como un arreglo floral: cada pieza conserva su personalidad, pero crece cuando conversa con las demás.",
        "También reafirmó algo esencial para d-stellar: la innovación no vive solo en un sabor inesperado. Está en la experiencia completa, en la inclusión desde el diseño y en esos gestos que hacen memorable un bocado.",
      ],
      en: [
        "March confirmed a collection can work like a flower arrangement: every piece keeps its own personality, but grows when it's in conversation with the others.",
        "It also reaffirmed something essential to d-stellar: innovation doesn't live only in an unexpected flavor. It lives in the whole experience, in inclusion built into the design, and in the small gestures that make a bite memorable.",
      ],
    },
    oneLiner: {
      es: "Cinco flores, cinco perfumes y un bouquet hecho para comerse con todos los sentidos.",
      en: "Five flowers, five scents, and a bouquet made to be eaten with every sense.",
    },
    heroImage: "/images/historias/marzo-2026/hero.webp",
    heroAlt: {
      es: "Tres cookies con forma de flor de la colección de marzo en su caja",
      en: "Three flower-shaped cookies from March's collection in their box",
    },
    gallery: [
      { src: "/images/historias/marzo-2026/gallery-1.webp", alt: { es: "Caja con tres cookies del bouquet de marzo", en: "Box with three cookies from March's bouquet" } },
      { src: "/images/historias/marzo-2026/gallery-2.webp", alt: { es: "Charola con las cookies florales de marzo", en: "Tray with March's floral cookies" } },
    ],
  },
  {
    slug: "febrero-2026",
    chapterNumber: 3,
    monthLabel: { es: "Febrero 2026", en: "February 2026" },
    title: { es: "Cinco tiempos para contar el amor", en: "Five acts to tell a love story" },
    hook: {
      es: "No quisimos celebrar un amor perfecto. Quisimos seguirlo desde la primera mirada hasta la decisión de permanecer.",
      en: "We didn't want to celebrate a perfect love. We wanted to follow it from the first glance to the decision to stay.",
    },
    flavorNames: ["PRIMERA MIRADA", "PRIMER BESO", "CUERPO", "CONTRASTE", "PARA SIEMPRE"],
    sectionEyebrow: { es: "Febrero · nuestra primera historia", en: "February · our first story" },
    sectionTitle: { es: "El amor servido en cinco tiempos", en: "Love, served in five acts" },
    intro: {
      es: [
        "Por primera vez, cada cookie dejó de ser un capítulo aislado: juntas debían conducir a quien las probara a través de una misma historia. Elegimos las etapas del enamoramiento porque el amor nunca tiene un solo sabor: floral y luminoso al imaginar a alguien, aterciopelado en el primer beso, oscuro y corporal en la intimidad, amargo cuando la rutina rompe la fantasía y sereno cuando deja de depender de la euforia.",
        "Rose Crush, Milk n Berries, Pera Noir, Bitter Kiss y The Forever eran cinco escenas de una montaña rusa mucho más honesta que San Valentín. Febrero también rompió otra frontera: inventamos nuestras primeras cookies saladas, y descubrimos que el formato podía contar historias más allá del postre.",
      ],
      en: [
        "For the first time, no cookie stood alone as its own chapter — together they had to carry whoever tasted them through a single story. We chose the stages of falling in love because love never has just one flavor: floral and luminous when you first imagine someone, velvety at the first kiss, dark and physical in intimacy, bitter when routine breaks the fantasy, and serene once it stops depending on euphoria.",
        "Rose Crush, Milk n Berries, Pera Noir, Bitter Kiss, and The Forever were five scenes from a far more honest rollercoaster than Valentine's Day usually gets. February also broke another boundary: we invented our first savory cookies, and discovered the format could tell stories beyond dessert.",
      ],
    },
    cookies: [
      {
        number: "01",
        name: "Rose Crush",
        tagline: {
          es: "La primera mirada: todavía no conoces a alguien, pero ya imaginas un universo entero.",
          en: "The first glance: you don't know them yet, but you're already imagining a whole universe.",
        },
        story: {
          es: [
            "Masa que sabía a rosas, con una ganache de praliné de pistache y popping bobas de rosas al centro que estallaban como esas primeras ideas imposibles de contener.",
            "Antes de enamorarnos de una persona, solemos enamorarnos de todo lo que imaginamos que podría ser.",
          ],
          en: [
            "A rose-flavored dough with a pistachio praline ganache and rose popping boba at the center, bursting like those first impossible-to-contain ideas.",
            "Before we fall for a person, we usually fall for everything we imagine they could be.",
          ],
        },
      },
      {
        number: "02",
        name: "Milk n Berries",
        tagline: {
          es: "El primer beso: el momento en que la vida parece tener más aire.",
          en: "The first kiss: the moment life seems to have more air in it.",
        },
        story: {
          es: [
            "Cookie de fresas liofilizadas con una ganache aterciopelada de chocolate blanco y fresa, y una lluvia de fresa liofilizada triturada.",
            "Como un beso que cambia el color de todo lo que viene después.",
          ],
          en: [
            "A freeze-dried strawberry cookie with a velvety white chocolate and strawberry ganache, finished with a dusting of crushed freeze-dried strawberry.",
            "Like a kiss that changes the color of everything that comes after.",
          ],
        },
      },
      {
        number: "03",
        name: "Pera Noir",
        tagline: {
          es: "La entrega: una conexión que también se entiende sin palabras.",
          en: "Surrender: a connection that's also understood without words.",
        },
        story: {
          es: [
            "Cookie vegana y especiada, con una cama de peras reducidas en vino tinto, perfumadas con canela, clavo y anís estrella, suavizada por una crema batida vegetal.",
            "Pera Noir no hablaba de poseer a alguien; hablaba de encontrarse, confiar y habitar el mismo instante.",
          ],
          en: [
            "A vegan, spiced cookie with a bed of pears reduced in red wine, perfumed with cinnamon, clove, and star anise, softened by a whipped plant-based cream.",
            "Pera Noir wasn't about possessing someone — it was about finding each other, trusting, and inhabiting the same moment.",
          ],
        },
      },
      {
        number: "04",
        name: "Bitter Kiss",
        tagline: {
          es: "El cambio de sabor: los días grises también pertenecen a la historia.",
          en: "The flavor shift: gray days belong to the story too.",
        },
        story: {
          es: [
            "Cookie de cacao con nibs, coronada con ganache de chocolate blanco y más nibs. El amargor interrumpía el dulzor y, al hacerlo, le daba sentido.",
            "Porque una parte no podría existir sin la otra: el contraste también es lo que vuelve maravilloso al amor.",
          ],
          en: [
            "A cacao cookie with nibs, topped with white chocolate ganache and more nibs. The bitterness interrupted the sweetness — and in doing so, gave it meaning.",
            "Because one couldn't exist without the other: contrast is also what makes love wonderful.",
          ],
        },
      },
      {
        number: "05",
        name: "The Forever",
        tagline: {
          es: "La permanencia: elegirse cada día, incluso después de que cambia la euforia.",
          en: "Permanence: choosing each other every day, even after the euphoria fades.",
        },
        story: {
          es: [
            "Cookie de almendras con un gel de frambuesa al centro, coronada con una flor de fondant: algo delicado que no permanece vivo por inercia, sino porque se atiende.",
            "El amor eterno no era el que nunca cambia; era el que decide volver después de cada cambio.",
          ],
          en: [
            "An almond cookie with a raspberry gel at the center, crowned with a fondant flower — something delicate that doesn't stay alive by inertia, but because it's tended to.",
            "Forever love wasn't the kind that never changes — it was the kind that decides to come back after every change.",
          ],
        },
      },
    ],
    closingEyebrow: { es: "Lo que febrero cambió en d-stellar", en: "What February changed at d-stellar" },
    closingTitle: { es: "Un menú podía tener ritmo, tensión y memoria", en: "A menu could have rhythm, tension, and memory" },
    closing: {
      es: [
        "Febrero fue la primera vez que contamos una historia en tiempos. Cada cookie tenía una función dentro del relato y cada bocado preparaba emocionalmente el siguiente.",
        "También fue el mes en que nacieron nuestras primeras cookies saladas, una ruptura que ensanchó lo que d-stellar podía llegar a ser.",
      ],
      en: [
        "February was the first time we told a story in acts. Every cookie had a role inside the narrative, and every bite emotionally set up the next one.",
        "It was also the month our first savory cookies were born — a break that widened what d-stellar could become.",
      ],
    },
    oneLiner: {
      es: "Cinco etapas del enamoramiento convertidas en sabor: de imaginar a alguien a decidir permanecer, con toda la dulzura y el contraste del camino.",
      en: "Five stages of falling in love turned into flavor: from imagining someone to deciding to stay, with all the sweetness and contrast along the way.",
    },
    heroImage: "/images/historias/febrero-2026/hero.webp",
    heroAlt: {
      es: "Vitrina iluminada con las cinco cookies de la colección de febrero",
      en: "Lit display case with February's five cookies",
    },
    gallery: [
      { src: "/images/historias/febrero-2026/gallery-1.webp", alt: { es: "Cookie con pistache sostenida en la mano", en: "Pistachio cookie held in hand" } },
      { src: "/images/historias/febrero-2026/gallery-2.webp", alt: { es: "Una de las primeras cookies saladas de d-stellar", en: "One of d-stellar's first savory cookies" } },
    ],
  },
  {
    slug: "enero-2026",
    chapterNumber: 2,
    monthLabel: { es: "Enero 2026", en: "January 2026" },
    title: { es: "Cinco sabores para volver a casa", en: "Five flavors to come home to" },
    hook: {
      es: "Enero no fue un regreso a lo seguro. Fue la decisión de tomar sabores que ya vivían en nuestra memoria y abrir con ellos la puerta de d-stellar.",
      en: "January wasn't a retreat into the safe and familiar. It was the decision to take flavors that already lived in our memory and open d-stellar's door with them.",
    },
    flavorNames: ["ARROZ CON LECHE", "CACAO Y CEREZA", "ROSCA", "MANDARINA", "NUEZ PECANA"],
    sectionEyebrow: { es: "Enero · el punto de partida", en: "January · the starting point" },
    sectionTitle: { es: "Un mapa de regreso a casa", en: "A map back home" },
    intro: {
      es: [
        "En diciembre habíamos abierto las puertas con una primera declaración de principios. Para enero volvimos a un menú de sólo cinco sabores, pero esta vez la intención era otra: que la propuesta se sintiera como una guía a casa. Elegimos sabores que ya tenían un lugar en la memoria — arroz con leche, chocolate, cereza, rosca de Reyes, mandarina y nuez pecana — no para repetirlos, sino para resignificarlos desde la mirada de d-stellar.",
        "No queríamos que nadie se sintiera frente a un menú extraño. Queríamos decir: pasa, prueba; aquí también hay algo que puede sentirse tuyo.",
      ],
      en: [
        "In December we'd opened our doors with a first statement of principles. For January we went back to a five-flavor menu, but this time the intention was different: we wanted the collection to feel like a map back home. We chose flavors that already had a place in memory — rice pudding, chocolate, cherry, Rosca de Reyes, tangerine, pecan — not to repeat them, but to give them new meaning through d-stellar's own lens.",
        "We didn't want anyone to face a strange, unfamiliar menu. We wanted to say: come in, try this — there's something here that can feel like yours too.",
      ],
    },
    cookies: [
      {
        number: "01",
        name: "Arroz con Leche",
        tagline: {
          es: "Una receta de mi mamá, una nostalgia de Hernán y una cookie que sabía a sobremesa.",
          en: "My mom's recipe, one of Hernán's fondest cravings, and a cookie that tasted like an after-dinner conversation.",
        },
        story: {
          es: [
            "Nació de la receta de arroz con leche de la mamá de Lalo: cremosa, generosa y melosa, llevada a una masa especiada con nuez moscada con un corazón goloso de arroz con leche al centro.",
            "Es el postre favorito de Hernán desde la primera vez que lo probó. Arroz con Leche no era sólo una cookie: era una receta heredada que encontró una nueva forma de sentarse a la mesa.",
          ],
          en: [
            "Born from Lalo's mom's rice pudding recipe — creamy, generous, syrupy — carried into a nutmeg-spiced dough with a rich rice pudding heart at the center.",
            "It's been Hernán's favorite dessert since the first time he tried it. Arroz con Leche wasn't just a cookie — it was a family recipe that found a new way to sit at the table.",
          ],
        },
      },
      {
        number: "02",
        name: "Dark Cherry",
        tagline: {
          es: "Chocolate intenso, cerezas y un destello de sal: una confesión hecha cookie.",
          en: "Intense chocolate, cherries, and a flash of salt: a confession turned into a cookie.",
        },
        story: {
          es: [
            "Una base que recordaba a un volcán de chocolate, con una ganache de cereza y trozos de fruta al centro, terminada con escamas de sal de mar.",
            "Era profunda, jugosa y magnética: el tipo de cookie que convierte un antojo en obsesión.",
          ],
          en: [
            "A base that recalled a chocolate lava cake, with a cherry ganache and fruit pieces at the center, finished with flakes of sea salt.",
            "Deep, juicy, and magnetic — the kind of cookie that turns a craving into an obsession.",
          ],
        },
      },
      {
        number: "03",
        name: "Guava Rosca",
        tagline: {
          es: "La rosca de Reyes volvió convertida en una experiencia completamente vegana.",
          en: "Rosca de Reyes came back as a fully vegan experience.",
        },
        story: {
          es: [
            "Notas de azahar y naranja, una cubierta de concha sabor vainilla, trocitos de ate de guayaba, un gel de guayaba con azahar al centro y crema batida vegetal.",
            "Resignificar el hogar también significaba cuidar quién podía sentarse a la mesa.",
          ],
          en: [
            "Notes of orange blossom and orange, a vanilla concha-style topping, bits of guava paste, a guava-and-orange-blossom gel at the center, and a whipped plant-based cream.",
            "Giving new meaning to home also meant paying attention to who got to sit at the table.",
          ],
        },
      },
      {
        number: "04",
        name: "Mandarin",
        tagline: {
          es: "Un destello cítrico que iluminó el menú desde el primer vistazo.",
          en: "A citrus spark that lit up the menu from the very first glance.",
        },
        story: {
          es: [
            "Masa de mandarina ligeramente ácida con un curd cremoso encima y un gajo de mandarina en almíbar.",
            "Fresca y reconfortante al mismo tiempo: una prueba de que volver a casa no siempre significa buscar sabores pesados.",
          ],
          en: [
            "A lightly tart tangerine dough with a creamy curd on top and a candied tangerine segment.",
            "Fresh and comforting at once — proof that coming home doesn't always mean reaching for something heavy.",
          ],
        },
      },
      {
        number: "05",
        name: "Pecan Pie",
        tagline: {
          es: "Una deconstrucción especiada, profunda y difícil de olvidar.",
          en: "A spiced, deep, hard-to-forget deconstruction.",
        },
        story: {
          es: [
            "Una masa intensamente especiada abrazaba un centro de nuez pecana con miel de maple orgánica traída desde Canadá.",
            "Pecan Pie fue el puente perfecto: comenzaba en una idea reconocible y terminaba en ese territorio sorprendente donde d-stellar se siente más vivo.",
          ],
          en: [
            "An intensely spiced dough wrapped around a pecan center with organic maple syrup brought in from Canada.",
            "Pecan Pie was the perfect bridge: it started from a familiar idea and landed in that surprising territory where d-stellar feels most alive.",
          ],
        },
      },
    ],
    closingEyebrow: { es: "Lo que enero nos enseñó", en: "What January taught us" },
    closingTitle: { es: "Una casa también se construye con sabores", en: "A home is also built with flavors" },
    closing: {
      es: [
        "El menú de enero fue nuestro modo de recibir a quienes llegaban por primera vez. Cinco cookies, cinco historias y una misma intención: ofrecer un comienzo cercano sin renunciar a la fuerza creativa de d-stellar.",
        "Ese mes, nuestra familia encontró sus primeros favoritos. Y nosotros entendimos algo que seguiría acompañando cada menú: la innovación emociona más cuando tiene un lugar desde el cual partir.",
      ],
      en: [
        "January's menu was our way of welcoming first-time visitors. Five cookies, five stories, one shared intention: offer an approachable beginning without giving up on d-stellar's creative force.",
        "That month, our family found its first favorites. And we understood something that's stayed with every menu since: innovation lands harder when it has somewhere real to start from.",
      ],
    },
    oneLiner: {
      es: "Cinco sabores conocidos, reinterpretados para convertir la primera visita en una bienvenida y la curiosidad en ganas de regresar.",
      en: "Five familiar flavors, reinterpreted to turn a first visit into a welcome, and curiosity into a reason to come back.",
    },
    heroImage: "/images/historias/enero-2026/hero.webp",
    heroAlt: {
      es: "Cajas de cookies de d-stellar sobre la barra durante enero 2026",
      en: "d-stellar cookie boxes on the counter during January 2026",
    },
    gallery: [
      {
        src: "/images/historias/enero-2026/gallery-1.webp",
        alt: { es: "Dark Cherry, cookie de chocolate con ganache de cereza", en: "Dark Cherry, the chocolate cookie with cherry ganache" },
      },
    ],
  },
  {
    slug: "diciembre-2025",
    chapterNumber: 1,
    monthLabel: { es: "Diciembre 2025", en: "December 2025" },
    title: { es: "El menú que encendió d-stellar", en: "The menu that lit up d-stellar" },
    hook: {
      es: "Cinco primeras cookies, una receta nacida de la paciencia y una sexta creación que abrió la puerta para más personas. Así comenzó nuestra constelación.",
      en: "Five first cookies, a recipe born from patience, and a sixth creation that opened the door for more people. That's how our constellation began.",
    },
    flavorNames: ["REVOLUCIONARIO", "FUERTE", "DIVERSO"],
    sectionEyebrow: { es: "El origen", en: "The origin" },
    sectionTitle: { es: "El mes en que empezó la constelación", en: "The month our constellation began" },
    intro: {
      es: [
        "El primer menú de d-stellar nació de algo más profundo que una temporada o una tendencia: la necesidad de mostrar, desde el primer bocado, todo lo que queríamos llegar a ser. Las cinco cookies iniciales no buscaban parecerse entre sí — esa era precisamente la idea. Un universo en el que pudieran convivir lo clásico y lo inesperado, la oscuridad y el color, la nostalgia y el juego.",
        "Diciembre no presentó solamente cinco sabores. Presentó las primeras cinco señales de lo que d-stellar podía ser.",
      ],
      en: [
        "d-stellar's first menu was born from something deeper than a season or a trend: the need to show, from the very first bite, everything we wanted to become. The five opening cookies weren't trying to resemble each other — that was exactly the point. A universe where the classic and the unexpected, darkness and color, nostalgia and play, could all coexist.",
        "December didn't just introduce five flavors. It introduced the first five signals of what d-stellar could be.",
      ],
    },
    cookies: [
      {
        number: "01",
        name: "Stellar",
        tagline: {
          es: "Persistencia, identidad y oficio: el punto de origen.",
          en: "Persistence, identity, and craft: the point of origin.",
        },
        story: {
          es: [
            "Cookie de vainilla con chunks de chocolate de leche y semiamargo, coronada con un crémeux de vainilla francesa y una mousse de chocolate en forma de estrella. Su receta tomó más de un año y medio de pruebas hasta llegar a su versión final: la receta madre, la base desde la cual comenzamos a entender textura, estructura y equilibrio.",
            "Por eso lleva nuestro nombre. Stellar concentra el origen de d-stellar en un solo bocado.",
          ],
          en: [
            "A vanilla cookie with milk and semi-sweet chocolate chunks, crowned with a French vanilla crémeux and a star-shaped chocolate mousse. The recipe took over a year and a half of testing to reach its final version — the mother recipe, the base from which we started to understand texture, structure, and balance.",
            "That's why it carries our name. Stellar holds d-stellar's origin in a single bite.",
          ],
        },
      },
      {
        number: "02",
        name: "Moonlight",
        tagline: {
          es: "Contraste y calidez: encontrar abrigo en la oscuridad.",
          en: "Contrast and warmth: finding shelter in the dark.",
        },
        story: {
          es: [
            "Masa intensa de cocoa encontrada con un marshmallow fluff de canela: profunda y oscura por fuera, suave y cálida en el centro.",
            "Moonlight habitaba ese momento de la noche en el que todo parece más misterioso, pero también más íntimo.",
          ],
          en: [
            "An intense cocoa dough meeting a cinnamon marshmallow fluff — deep and dark on the outside, soft and warm at the center.",
            "Moonlight lived in that part of the night when everything feels more mysterious, but also more intimate.",
          ],
        },
      },
      {
        number: "03",
        name: "Inferno Banana",
        tagline: {
          es: "Fuego, juego y transformación.",
          en: "Fire, play, and transformation.",
        },
        story: {
          es: [
            "Sobre una cookie de vainilla, un curd de plátano flameado y rostizado, rematado con esferas de caramelo sabor plátano.",
            "Era una declaración de intención: en d-stellar, incluso un ingrediente conocido podía atravesar una transformación y regresar con otra energía.",
          ],
          en: [
            "On a vanilla cookie, a flambéed, roasted banana curd, finished with little spheres of banana caramel.",
            "It was a statement of intent: at d-stellar, even a familiar ingredient could go through a transformation and come back with different energy.",
          ],
        },
      },
      {
        number: "04",
        name: "Electric Hibiscus",
        tagline: {
          es: "Atrevimiento y diferencia: el valor de no gustarle a todo el mundo.",
          en: "Boldness and difference: the courage to not be for everyone.",
        },
        story: {
          es: [
            "Nuestra cookie de jamaica: ácida, vibrante y deliberadamente distinta, suavizada con crema montada y una crêpe dulce en forma de estrella.",
            "Ser inclusivos no significa volverlo todo neutro; también significa dejar espacio para sabores con una identidad fuerte.",
          ],
          en: [
            "Our hibiscus cookie: tart, vibrant, and deliberately different, softened with whipped cream and a sweet star-shaped crepe.",
            "Being inclusive doesn't mean making everything neutral — it also means leaving room for flavors with a strong identity of their own.",
          ],
        },
      },
      {
        number: "05",
        name: "Dirty Pop",
        tagline: {
          es: "Curiosidad y cultura pop: jugar en serio.",
          en: "Curiosity and pop culture: playing for real.",
        },
        story: {
          es: [
            "Nació al mirar una bebida de té con popping boba y preguntarnos qué ocurriría si dejara de ser bebida para convertirse en cookie: masa de té negro con crema de mantequilla y perlas de popping boba en el centro.",
            "Dirty Pop convirtió la sorpresa en textura y nos recordó que la experimentación también puede ser divertida e irreverente.",
          ],
          en: [
            "It came from looking at a popping-boba milk tea and asking what would happen if it stopped being a drink and became a cookie instead: black tea dough with buttercream and popping boba pearls at the center.",
            "Dirty Pop turned surprise into texture, and reminded us experimentation can also be fun and irreverent.",
          ],
        },
      },
      {
        number: "06",
        name: "Tacha Spice",
        tagline: {
          es: "Tradición, hospitalidad e inclusión: una bienvenida que también se podía comer.",
          en: "Tradition, hospitality, and inclusion: a welcome you could also eat.",
        },
        story: {
          es: [
            "Nuestra primera cookie vegana, elaborada sin productos de origen animal para inaugurar nuestro primer punto físico. Inspirada en la calabaza en tacha: cookie de calabaza, dulce de calabaza encima y una crema montada vegana envolviendo el conjunto.",
            "La inclusión dejó de ser una palabra y se volvió una silla disponible, una opción deseable y una invitación clara.",
          ],
          en: [
            "Our first vegan cookie, made without any animal products, created to open our very first physical location. Inspired by calabaza en tacha (candied pumpkin): a pumpkin cookie, pumpkin sweet on top, wrapped in a vegan whipped cream.",
            "Inclusion stopped being a word and became an available seat, a desirable option, and a clear invitation.",
          ],
        },
      },
    ],
    closingEyebrow: { es: "Lo que quedó encendido", en: "What stayed lit" },
    closingTitle: { es: "La primera constelación de d-stellar", en: "d-stellar's first constellation" },
    closing: {
      es: [
        "Stellar hablaba de persistencia. Moonlight, de contraste. Inferno Banana, de transformación. Electric Hibiscus, del valor de sostener una identidad propia. Dirty Pop, de curiosidad y juego. Tacha Spice, de una hospitalidad que no pide a nadie dejar una parte de sí afuera.",
        "Aquellas cookies no eran iguales, y por eso funcionaban juntas. Como las estrellas de una constelación, cada una ocupaba su lugar y, al conectarse con las demás, dibujaba algo más grande. Ese fue nuestro primer diciembre: el instante emocionante en el que d-stellar comenzó a reconocerse.",
      ],
      en: [
        "Stellar spoke of persistence. Moonlight, of contrast. Inferno Banana, of transformation. Electric Hibiscus, of the courage to hold onto your own identity. Dirty Pop, of curiosity and play. Tacha Spice, of a hospitality that never asks anyone to leave part of themselves outside.",
        "Those cookies weren't alike, and that's exactly why they worked together. Like the stars in a constellation, each one held its own place, and connected to the others to draw something bigger. That was our first December: the exciting instant d-stellar started to recognize itself.",
      ],
    },
    oneLiner: {
      es: "No el mes de un menú perfecto y terminado, sino el instante en que d-stellar comenzó a reconocerse. Seis cookies después, el universo ya estaba en movimiento.",
      en: "Not the month of a perfect, finished menu — the instant d-stellar started to recognize itself. Six cookies later, the universe was already in motion.",
    },
    heroImage: "/images/historias/diciembre-2025/hero.webp",
    heroAlt: {
      es: "Primera caja de cookies de d-stellar con la colección de apertura de diciembre",
      en: "d-stellar's first cookie box with December's opening collection",
    },
    gallery: [
      {
        src: "/images/historias/diciembre-2025/gallery-1.webp",
        alt: { es: "Charola larga con las seis cookies originales de d-stellar", en: "Long tray with d-stellar's original six cookies" },
      },
    ],
  },
];

export function getMonthlyStory(slug: string) {
  return menuHistory.find((m) => m.slug === slug);
}
