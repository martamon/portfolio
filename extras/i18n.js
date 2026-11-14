// Language of the whole site: English (the original), Spanish and Galician.
// The text of the pages is translated here from a table (every text node is matched against its English original, so nothing is
// sent to any service and nothing flashes in a foreign script), and a discreet "EN · ES · GL" switch in the corner changes it.
// New texts that are not in the table simply stay in English. The choice is remembered.
const NAMES = ['en', 'es', 'gl'];
const norm = (s) => s.replace(/\s+/g, ' ').trim();

// [English, Spanish, Galician]
const ROWS = [
  ["Interactive 3D world", "Mundo 3D interactivo", "Mundo 3D interactivo"],
  ["My Little World is a tiny 3D planet of the ría de Muros e Noia, in A Coruña, that I made with artificial intelligence: villages with their squares and market, beaches, a harbour with boats and dolphins, roads with traffic lights and a fiesta with fireworks at night. You can spin it, change the hour, make it rain and visit its places. A bicycle ride through the villages, where you can chat with the neighbours and ask them about me, a little boat out at sea that takes you to the island, and my grandmother's house, which you can walk into, complete the world.", "My Little World es un diminuto planeta 3D de la ría de Muros e Noia, en A Coruña, que hice con inteligencia artificial: pueblos con sus plazas y su mercado, playas, un puerto con barcos y delfines, carreteras con semáforos y una fiesta con fuegos artificiales por la noche. Puedes hacerlo girar, cambiar la hora, hacer que llueva y visitar sus lugares. Un paseo en bicicleta por los pueblos, donde puedes hablar con los vecinos y preguntarles por mí, un barquito en el mar que te lleva a la isla, y la casa de mi abuela, en la que puedes entrar, completan el mundo.", "My Little World é un diminuto planeta 3D da ría de Muros e Noia, na Coruña, que fixen con intelixencia artificial: pobos coas súas prazas e o seu mercado, praias, un porto con barcos e golfiños, estradas con semáforos e unha festa con fogos de artificio pola noite. Podes facelo xirar, cambiar a hora, facer que chova e visitar os seus lugares. Un paseo en bicicleta polos pobos, onde podes falar cos veciños e preguntarlles por min, un barquiño no mar que te leva á illa, e a casa da miña avoa, na que podes entrar, completan o mundo."],
  ["↳ Visit the planet", "↳ Visitar el planeta", "↳ Visitar o planeta"],
  ['Local time', 'Hora local', 'Hora local'],
  ['Coming soon', 'Próximamente', 'Próximamente'],
  ['MORE HERE', 'MÁS AQUÍ', 'MÁIS AQUÍ'],
  ['More projects', 'Más proyectos', 'Máis proxectos'],
  ['MORE PROJECTS', 'MAS PROYECTOS', 'MAIS PROXECTOS'],
  ['About', 'Sobre mí', 'Sobre min'],
  ['Contact', 'Contacto', 'Contacto'],
  ['Ai specialist & photographer. Designer', 'Especialista en IA y fotógrafa. Diseñadora', 'Especialista en IA e fotógrafa. Deseñadora'],
  ['Experience', 'Experiencia', 'Experiencia'],
  ['Skills', 'Habilidades', 'Habilidades'],
  ['AI SPECIALIST- WPP', 'ESPECIALISTA EN IA- WPP', 'ESPECIALISTA EN IA- WPP'],
  ['ADMINISTRATOR- GAIAS EVENTOS', 'ADMINISTRADORA- GAIAS EVENTOS', 'ADMINISTRADORA- GAIAS EVENTOS'],
  ['ASSISTANT- PARFOIS', 'ASISTENTE- PARFOIS', 'ASISTENTE- PARFOIS'],
  ['PHOTOGRAPHER- VISENTA STUDIO', 'FOTÓGRAFA- VISENTA STUDIO', 'FOTÓGRAFA- VISENTA STUDIO'],
  ['GRAPHIC DESIGNER- YOUR FIRST', 'DISEÑADORA GRÁFICA- YOUR FIRST', 'DESEÑADORA GRÁFICA- YOUR FIRST'],
  ['2024 - ongoing', '2024 - actualidad', '2024 - actualidade'],
  ['2020 - 2024 (SUMMER)', '2020 - 2024 (VERANO)', '2020 - 2024 (VERÁN)'],
  ['GET IN TOUCH', 'CONTACTA CONMIGO', 'CONTACTA COMIGO'],
  ['E-mail', 'Correo', 'Correo'],
  ['↳ Made by Martamon', '↳ Hecho por Martamon', '↳ Feito por Martamon'],
  ["There's nothing to see here.", 'Aquí no hay nada que ver.', 'Aquí non hai nada que ver.'],
  ["A series of images showing people inside transparent bubbles. They don't smile, they don't act, they don't seek approval. The bubble is their personal space, a boundary against external expectations.",
    'Una serie de imágenes de personas dentro de burbujas transparentes. No sonríen, no actúan, no buscan aprobación. La burbuja es su espacio personal, un límite frente a las expectativas externas.',
    'Unha serie de imaxes de persoas dentro de burbullas transparentes. Non sorrín, non actúan, non buscan aprobación. A burbulla é o seu espazo persoal, un límite fronte ás expectativas externas.'],
  ['Nothing more to add.', 'Nada más que añadir.', 'Nada máis que engadir.'],
  ['The project in question has comprised multiple photo shoots for various fashion ensembles. These shoots have been structured in four distinct parts, encompassing a selection of independently designed pieces. This second session focuses on the design and construction of the garments, as well as the hair and makeup application.',
    'El proyecto ha consistido en varias sesiones de fotos para distintos conjuntos de moda. Las sesiones se han estructurado en cuatro partes diferenciadas, con una selección de piezas diseñadas de forma independiente. Esta segunda sesión se centra en el diseño y la confección de las prendas, así como en la aplicación del peinado y el maquillaje.',
    'O proxecto consistiu en varias sesións de fotos para distintos conxuntos de moda. As sesións estruturáronse en catro partes diferenciadas, cunha selección de pezas deseñadas de forma independente. Esta segunda sesión céntrase no deseño e na confección das prendas, así como na aplicación do peiteado e da maquillaxe.'],
  ['Art Direction, Photography', 'Dirección de arte, fotografía', 'Dirección de arte, fotografía'],
  ['Art direction, Photography', 'Dirección de arte, fotografía', 'Dirección de arte, fotografía'],
  ['Art direction, Ai image generative', 'Dirección de arte, generación de imágenes con IA', 'Dirección de arte, xeración de imaxes con IA'],
  ['Photography', 'Fotografía', 'Fotografía'],
  ['Ai generative and retoucher', 'IA generativa y retoque', 'IA xenerativa e retoque'],
  ['Brand identity', 'Identidad de marca', 'Identidade de marca'],
  ['TFG Editorial design & photography', 'TFG Diseño editorial y fotografía', 'TFG Deseño editorial e fotografía'],
  ['My greece trip.', 'Mi viaje a Grecia.', 'A miña viaxe a Grecia.'],
  ['Dutch born, Japanese raised art director based in Cape Town focusing on branding & design in expressive forms.',
    'Director de arte nacido en los Países Bajos y criado en Japón, afincado en Ciudad del Cabo, centrado en branding y diseño en formas expresivas.',
    'Director de arte nado nos Países Baixos e criado en Xapón, afincado en Cidade do Cabo, centrado en branding e deseño en formas expresivas.'],
  ['I am a photographer, retoucher, and AI image creator. I currently work at WPP PRODUCTION (Madrid), part of the multinational advertising group WPP, Participating in projects for brands such as Coca-Cola, Toyota, Procter & Gamble, Iberdrola, Google, Schweppes, Colgate-Palmolive... Specializing in photography and digital retouching, I am currently fully focused on the Artificial Intelligence department, where I develop projects for generating and animating images using AI. In addition, I perform other roles within the field of graphic design, such as web design (including this website), advanced use of the Adobe suite, and the creation of corporate identities and product design.',
    'Soy fotógrafa, retocadora y creadora de imágenes con IA. Actualmente trabajo en WPP PRODUCTION (Madrid), parte del grupo publicitario multinacional WPP, participando en proyectos para marcas como Coca-Cola, Toyota, Procter & Gamble, Iberdrola, Google, Schweppes, Colgate-Palmolive... Especializada en fotografía y retoque digital, ahora estoy totalmente centrada en el departamento de Inteligencia Artificial, donde desarrollo proyectos de generación y animación de imágenes con IA. Además, desempeño otras funciones dentro del diseño gráfico, como el diseño web (incluida esta web), el uso avanzado de la suite de Adobe y la creación de identidades corporativas y diseño de producto.',
    'Son fotógrafa, retocadora e creadora de imaxes con IA. Actualmente traballo en WPP PRODUCTION (Madrid), parte do grupo publicitario multinacional WPP, participando en proxectos para marcas como Coca-Cola, Toyota, Procter & Gamble, Iberdrola, Google, Schweppes, Colgate-Palmolive... Especializada en fotografía e retoque dixital, agora estou totalmente centrada no departamento de Intelixencia Artificial, onde desenvolvo proxectos de xeración e animación de imaxes con IA. Ademais, desempeño outras funcións dentro do deseño gráfico, como o deseño web (incluída esta web), o uso avanzado da suite de Adobe e a creación de identidades corporativas e deseño de produto.'],
  ['Throughout the years, we have witnessed various forms of social discrimination due to multiple factors such as social class, gender, race, ideology, among others. One of the causes that divides society into different groups is the difference in clothing. In the realm of cultures, subcultures, and styles, numerous cases of discrimination have occurred. The fashion industry itself has contributed significantly to this situation. Although in recent years, certain types of clothing and subcultures have started to be accepted in the fashion world, there are still everyday events that harm the lives of some individuals. These events include rejection at the entrance to certain establishments, disdainful looks on the street, negative comments on social media, and unnecessary opinions, among other ongoing occurrences. The project consists of a punk fashion magazine, considered the pioneer of protest fashion. One of the main objectives of this movement is to express discontent towards society and the imposed norms. The idea is to continue in the future with possible volumes on other movements within alternative fashion, such as gothic fashion, hippie fashion, among others.',
    'A lo largo de los años hemos sido testigos de diversas formas de discriminación social debidas a múltiples factores como la clase social, el género, la raza o la ideología, entre otros. Una de las causas que divide a la sociedad en grupos es la diferencia en la forma de vestir. En el ámbito de las culturas, las subculturas y los estilos se han dado numerosos casos de discriminación. La propia industria de la moda ha contribuido de forma significativa a esta situación. Aunque en los últimos años ciertos tipos de ropa y subculturas han empezado a ser aceptados en el mundo de la moda, siguen existiendo hechos cotidianos que dañan la vida de algunas personas. Entre ellos, el rechazo en la entrada de ciertos establecimientos, las miradas despectivas en la calle, los comentarios negativos en redes sociales y las opiniones innecesarias, entre otros. El proyecto consiste en una revista de moda punk, considerada pionera de la moda de protesta. Uno de los principales objetivos de este movimiento es expresar el descontento hacia la sociedad y las normas impuestas. La idea es continuar en el futuro con posibles volúmenes sobre otros movimientos de la moda alternativa, como la moda gótica o la moda hippie, entre otros.',
    'Ao longo dos anos fomos testemuñas de diversas formas de discriminación social debidas a múltiples factores como a clase social, o xénero, a raza ou a ideoloxía, entre outros. Unha das causas que divide a sociedade en grupos é a diferenza na forma de vestir. No ámbito das culturas, as subculturas e os estilos déronse numerosos casos de discriminación. A propia industria da moda contribuíu de forma significativa a esta situación. Aínda que nos últimos anos certos tipos de roupa e subculturas comezaron a ser aceptados no mundo da moda, seguen existindo feitos cotiáns que danan a vida dalgunhas persoas. Entre eles, o rexeitamento na entrada de certos establecementos, as miradas desdeñosas na rúa, os comentarios negativos nas redes sociais e as opinións innecesarias, entre outros. O proxecto consiste nunha revista de moda punk, considerada pioneira da moda de protesta. Un dos principais obxectivos deste movemento é expresar o descontento cara á sociedade e as normas impostas. A idea é continuar no futuro con posibles volumes sobre outros movementos da moda alternativa, como a moda gótica ou a moda hippie, entre outros.'],
  ["A few years ago, I wrote down a goal in my school notebook for my 20s: to travel to Asia. Today, at 24, I can say I've achieved that goal with one of the most incredible trips of my life. It was an experience shared with my WeRoad group. I know that during the trip, many didn't quite understand why I always had my camera in hand. Today, seeing the result of all those photos and this video, I hope you can see what my eyes were capturing. China is a fascinating blend of past and future that has changed my perspective. I'm sharing this short summary of what was an unforgettable adventure.",
    'Hace unos años escribí en mi cuaderno del colegio una meta para mis veinte: viajar a Asia. Hoy, con 24 años, puedo decir que la he cumplido con uno de los viajes más increíbles de mi vida. Fue una experiencia compartida con mi grupo de WeRoad. Sé que durante el viaje muchos no entendían muy bien por qué siempre llevaba la cámara en la mano. Hoy, al ver el resultado de todas esas fotos y de este vídeo, espero que puedas ver lo que mis ojos estaban captando. China es una fascinante mezcla de pasado y futuro que ha cambiado mi perspectiva. Comparto este pequeño resumen de lo que fue una aventura inolvidable.',
    'Hai uns anos escribín no meu caderno do colexio unha meta para os meus vinte: viaxar a Asia. Hoxe, con 24 anos, podo dicir que a cumprín cunha das viaxes máis incribles da miña vida. Foi unha experiencia compartida co meu grupo de WeRoad. Sei que durante a viaxe moitos non entendían moi ben por que levaba sempre a cámara na man. Hoxe, ao ver o resultado de todas esas fotos e deste vídeo, espero que poidas ver o que os meus ollos estaban captando. China é unha fascinante mestura de pasado e futuro que cambiou a miña perspectiva. Comparto este pequeno resumo do que foi unha aventura inesquecible.'],
  ["I hadn't used my camera in ages, and one day, over coffee and conversation, the idea came up to do a beach-inspired photoshoot with a friend of mine who's starting out as a DJ in Galicia. We set off, armed with a powerful flashlight and freezing cold. We ventured onto the beach at 2 a.m., with no real faith that our ideas would work. Here's the result of a session that was anything but improvised and had limited resources.",
    'Hacía muchísimo que no usaba mi cámara y un día, entre un café y una conversación, surgió la idea de hacer una sesión de fotos de inspiración playera con un amigo mío que empieza como DJ en Galicia. Salimos armados con una linterna potente y muertos de frío. Nos aventuramos en la playa a las 2 de la madrugada, sin mucha fe en que nuestras ideas funcionaran. Este es el resultado de una sesión que fue todo menos improvisada y con recursos limitados.',
    'Facía moitísimo que non usaba a miña cámara e un día, entre un café e unha conversa, xurdiu a idea de facer unha sesión de fotos de inspiración praieira cun amigo meu que comeza como DJ en Galicia. Saímos armados cunha lanterna potente e mortos de frío. Aventurámonos na praia ás 2 da madrugada, sen moita fe en que as nosas ideas funcionasen. Este é o resultado dunha sesión que foi todo menos improvisada e con recursos limitados.'],
  ['Generation and retouching of product images for Lexus Singapore- Content created for WPP. Project participation. 10K image quality.',
    'Generación y retoque de imágenes de producto para Lexus Singapur. Contenido creado para WPP. Participación en el proyecto. Calidad de imagen 10K.',
    'Xeración e retoque de imaxes de produto para Lexus Singapur. Contido creado para WPP. Participación no proxecto. Calidade de imaxe 10K.'],
  ['Generation and retouching of product images for Schweppes — Content created for WPP. Project involvement: generation of 10K-quality images and videos.',
    'Generación y retoque de imágenes de producto para Schweppes — Contenido creado para WPP. Participación en el proyecto: generación de imágenes y vídeos con calidad 10K.',
    'Xeración e retoque de imaxes de produto para Schweppes — Contido creado para WPP. Participación no proxecto: xeración de imaxes e vídeos con calidade 10K.'],
  ['Generation and retouching of product images for Boots—specifically the cosmetics brand Soap & Glory. Content created for WPP. Project participation. 10K image quality.',
    'Generación y retoque de imágenes de producto para Boots, en concreto para la marca de cosmética Soap & Glory. Contenido creado para WPP. Participación en el proyecto. Calidad de imagen 10K.',
    'Xeración e retoque de imaxes de produto para Boots, en concreto para a marca de cosmética Soap & Glory. Contido creado para WPP. Participación no proxecto. Calidade de imaxe 10K.'],
  ["This project originated from a deeply rooted tradition in an iconic establishment in my hometown. My grandfather, a former sailor, frequented this bar to enjoy games and savor delicious appetizers. This long-established, nautical-themed bar lacked a graphic update that reflected its essence in a contemporary way. To create the brand identity for this project, we drew inspiration from the characteristic aesthetic of traditional seafood restaurants and bars, giving it a modern graphic touch. For the visual identity design, we opted for a simple and welcoming aesthetic that conveys familiarity and evokes a rustic atmosphere. We also aim to transmit a sense of freshness and order, in keeping with the quality and organization that characterize the establishment's culinary offerings.",
    'Este proyecto nació de una tradición muy arraigada en un local emblemático de mi pueblo. Mi abuelo, antiguo marinero, frecuentaba este bar para disfrutar de los juegos y saborear ricos aperitivos. Este bar de toda la vida, de temática náutica, carecía de una actualización gráfica que reflejara su esencia de forma contemporánea. Para crear la identidad de marca de este proyecto nos inspiramos en la estética característica de las marisquerías y bares tradicionales, dándole un toque gráfico moderno. Para el diseño de la identidad visual optamos por una estética sencilla y acogedora que transmite familiaridad y evoca un ambiente rústico. También buscamos transmitir una sensación de frescura y orden, acorde con la calidad y la organización que caracterizan la oferta culinaria del local.',
    'Este proxecto naceu dunha tradición moi arraigada nun local emblemático da miña vila. O meu avó, antigo mariñeiro, frecuentaba este bar para gozar dos xogos e saborear ricos aperitivos. Este bar de toda a vida, de temática náutica, carecía dunha actualización gráfica que reflectise a súa esencia de forma contemporánea. Para crear a identidade de marca deste proxecto inspirámonos na estética característica das marisquerías e bares tradicionais, dándolle un toque gráfico moderno. Para o deseño da identidade visual optamos por unha estética sinxela e acolledora que transmite familiaridade e evoca un ambiente rústico. Tamén buscamos transmitir unha sensación de frescura e orde, acorde coa calidade e a organización que caracterizan a oferta culinaria do local.'],
  ['Soidades de Onte. /sɔjˈðaðɛs ðɛ ˈɔnte/ In Galicia, nostalgia for yesterday is the expression of lived moments that have never been captured. A visual poem that revives my childhood memories, captured through the eyes of a little girl. A journey to the past made real.',
    'Soidades de Onte. /sɔjˈðaðɛs ðɛ ˈɔnte/ En Galicia, la nostalgia del ayer es la expresión de momentos vividos que nunca fueron capturados. Un poema visual que revive mis recuerdos de infancia, captados a través de los ojos de una niña pequeña. Un viaje al pasado hecho realidad.',
    'Soidades de Onte. /sɔjˈðaðɛs ðɛ ˈɔnte/ En Galicia, a nostalxia do onte é a expresión de momentos vividos que nunca foron capturados. Un poema visual que revive as miñas lembranzas de infancia, captadas a través dos ollos dunha nena pequena. Unha viaxe ao pasado feita realidade.'],
  // the map, Mochi and the little creature
  ['Add to the island', 'Añadir a la isla', 'Engadir á illa'],
  ['Tree', 'Árbol', 'Árbore'], ['Flowers', 'Flores', 'Flores'], ['House', 'Casa', 'Casa'], ['Granary', 'Hórreo', 'Hórreo'],
  ['Sheep', 'Oveja', 'Ovella'], ['Lighthouse', 'Faro', 'Farol'], ['Boat', 'Barco', 'Barco'],
  ['Take me on a guided tour', 'Hazme una visita guiada', 'Fainme unha visita guiada'],
  ['Stop the tour', 'Parar la visita', 'Parar a visita'],
  ['Previous stop', 'Parada anterior', 'Parada anterior'],
  ['Next stop', 'Siguiente parada', 'Seguinte parada'],
  ['Change clothes', 'Cambiar de ropa', 'Cambiar de roupa'],
  ["Welcome to Martamon's website. I'm a photographer and artificial intelligence specialist. I hope you enjoy your visit and find the content helpful.", 'Bienvenido a la web de Martamon. Soy fotógrafa y especialista en inteligencia artificial. Espero que disfrutes de tu visita y que el contenido te resulte útil.', 'Benvido á web de Martamon. Son fotógrafa e especialista en intelixencia artificial. Espero que goces da túa visita e que o contido che resulte útil.'],
  ['Play', 'Reproducir', 'Reproducir'],
  ['Pause', 'Pausa', 'Pausa'],
  ['Sound: off', 'Sonido: no', 'Son: non'],
  ['Sound: on', 'Sonido: sí', 'Son: si'],
  ['Full screen', 'Pantalla completa', 'Pantalla completa'],
  ['Exit full screen', 'Salir de pantalla completa', 'Saír da pantalla completa'],
  ['Leave the house', 'Salir de la casa', 'Saír da casa'],
  ['Enter', 'Entrar', 'Entrar'],
  ['Ride with the arrow keys', 'Pedalea con las flechas del teclado · E para leer', 'Pedalea coas frechas do teclado · E para ler'],
  ['Press E to read', 'Pulsa E para leer', 'Preme E para ler'],
  ['Tap to read', 'Toca para leer', 'Toca para ler'],
  ['Close', 'Cerrar', 'Pechar'],
  ['Day / night', 'Día / noche', 'Día / noite'],
  ['Rain', 'Lluvia', 'Chuvia'],
  ['Back to the map', 'Volver al mapa', 'Volver ao mapa'],
  ['Under the sea', 'Bajo el mar', 'Baixo o mar'],
  ['Sound', 'Sonido', 'Son'],
  ['Learn more', 'Saber más', 'Saber máis'],
  ['Start the tour', 'Comenzar la visita', 'Comezar a visita'],
  ['CLICK 3 TIMES · CLICK 3 TIMES · CLICK 3 TIMES ·', 'HAZ CLIC 3 VECES · HAZ CLIC 3 VECES · HAZ CLIC 3 VECES ·', 'FAI CLIC 3 VECES · FAI CLIC 3 VECES · FAI CLIC 3 VECES ·'],
  ['Your browser cannot show the 3D map.', 'Tu navegador no puede mostrar el mapa 3D.', 'O teu navegador non pode mostrar o mapa 3D.']
];
const MAP = new Map(ROWS.map((r) => [norm(r[0]), r]));
const REV = new Map(); for (const r of ROWS) for (const t of r) REV.set(norm(t), r[0]);   // any language back to its English original

// what Mochi says on the map: the same six texts in each language
export const MOCHI = [
  ['Thank you so much for staying until here! My name is Mochi and I am Martamon’s assistant (actually, I am her digitalised kitten).',
    '¡Muchas gracias por quedarte hasta aquí! Mi nombre es Mochi y soy la asistente de Martamon (en realidad soy su gatita digitalizada).',
    'Moitas grazas por quedares ata aquí! O meu nome é Mochi e son a asistente de Martamon (en realidade son a súa gatiña dixitalizada).'],
  ['Martamon comes from a tiny village in the north of Spain, in Galicia. It is a VERY, VERY pretty and quiet fishing village. This map is a recreation of the ría where the village she comes from sits.',
    'Martamon viene de una pequeña aldea del norte de España, en Galicia. Es un pueblo pesquero MUY, MUY bonito y tranquilo. Este mapa es una recreación de la ría donde se encuentra el pueblo de donde ella viene.',
    'Martamon vén dunha pequena aldea do norte de España, en Galicia. É unha vila mariñeira MOI, MOI bonita e tranquila. Este mapa é unha recreación da ría onde se atopa a vila de onde ela vén.'],
  ['This map does not follow the original layout of the village exactly, but it is made to sum up a little of Martamon’s place of origin and its culture.',
    'Este mapa no sigue exactamente la estructura original del pueblo, pero está hecho de manera que resuma un poco el lugar de origen de Martamon y su cultura.',
    'Este mapa non segue exactamente a estrutura orixinal da aldea, pero está feito de maneira que resuma un pouco o lugar de orixe de Martamon e a súa cultura.'],
  ['These villages are in the Ría de Muros e Noia, and they are O Freixo, Esteiro, Outes, Muros and Louro.',
    'Estos pueblos están en la ría de Muros e Noia y son O Freixo, Esteiro, Outes, Muros y Louro.',
    'Estas vilas están na ría de Muros e Noia e son O Freixo, Esteiro, Outes, Muros e Louro.'],
  ['I want to take you on a tour of all these villages and tell you a bit about their culture and some curious facts about them.',
    'Quiero llevarte de recorrido por todos estos pueblos y contarte un poco sobre su cultura y algunos datos curiosos.',
    'Quero levarte de percorrido por todas estas vilas e contarte un pouco sobre a súa cultura e algúns datos curiosos.'],
  ['If you feel like trying it, click the start button that will appear next.',
    'Si te animas a probarlo, haz clic en el botón de comenzar que aparecerá a continuación.',
    'Se te animas a probalo, fai clic no botón de comezar que aparecerá a continuación.']
];

// the drive along the ría: what each glowing orb tells
export const INFO = [
  { h: ['Known as “A Ría da Estrela”', 'Conocida como “A Ría da Estrela”', 'Coñecida como “A Ría da Estrela”'],
    p: ['Its geographic shape and the union of its five historic municipalities (Muros, Outes, Noia, Lousame and Porto do Son) give it this very characteristic name.',
      'Su forma geográfica y la unión de sus cinco municipios históricos (Muros, Outes, Noia, Lousame y Porto do Son) hacen que reciba este nombre tan característico.',
      'A súa forma xeográfica e a unión dos seus cinco concellos históricos (Muros, Outes, Noia, Lousame e Porto do Son) fan que reciba este nome tan característico.'] },
  { h: ['O Freixo', 'O Freixo', 'O Freixo'],
    p: ['A small port of Outes, with its stone quay where the boats rest. Many of the stories of this ría begin on a pier like this one.',
      'Un pequeño puerto de Outes, con su muelle de piedra donde descansan las barcas. Muchas de las historias de esta ría empiezan en un muelle como este.',
      'Un pequeno porto de Outes, co seu peirao de pedra onde descansan as barcas. Moitas das historias desta ría comezan nun peirao coma este.'] },
  { h: ['Esteiro', 'Esteiro', 'Esteiro'],
    p: ['A village of shellfish gatherers: at low tide the women walk out onto the sand to collect cockles and clams by hand.',
      'Una aldea de mariscadoras: con la marea baja salen a la arena a recoger berberechos y almejas a mano.',
      'Unha aldea de mariscadoras: coa marea baixa saen á area a recoller berberechos e ameixas a man.'] },
  { h: ['Outes and the Tambre', 'Outes y el Tambre', 'Outes e o Tambre'],
    p: ['The medieval bridge of Nafonso crosses the river Tambre in Outes. The same river flows into the ría near Noia.',
      'El puente medieval de Nafonso cruza el río Tambre en Outes. Ese mismo río desemboca en la ría, cerca de Noia.',
      'A ponte medieval de Nafonso cruza o río Tambre en Outes. Ese mesmo río desemboca na ría, preto de Noia.'] },
  { h: ['Muros', 'Muros', 'Muros'],
    p: ['A seafaring town with granite arcades, narrow streets and a fishing port. Its old quarter looks straight out onto the water.',
      'Una villa marinera con soportales de granito, calles estrechas y puerto pesquero. Su casco antiguo mira directamente al agua.',
      'Unha vila mariñeira con soportais de granito, rúas estreitas e porto pesqueiro. O seu casco antigo mira directamente á auga.'] },
  { h: ['Louro · Area Maior', 'Louro · Area Maior', 'Louro · Area Maior'],
    p: ['Area Maior is the long beach of fine sand and dunes of Louro, at the foot of Monte Louro and next to its lagoon: one of the most beautiful landscapes of the ría.',
      'Area Maior es la larga playa de arena fina y dunas de Louro, a los pies del Monte Louro y junto a su laguna: uno de los paisajes más bonitos de la ría.',
      'Area Maior é a longa praia de area fina e dunas de Louro, ao pé do Monte Louro e xunto á súa lagoa: unha das paisaxes máis bonitas da ría.'] },
  { h: ['The hórreo', 'El hórreo', 'O hórreo'],
    p: ['Hórreos are granaries raised on pillars to protect the grain from damp and rodents. You will find them of stone or wood all over Galicia.',
      'Los hórreos son graneros elevados sobre pilares para proteger el grano de la humedad y de los roedores. Los hay de piedra y de madera por toda Galicia.',
      'Os hórreos son graneiros elevados sobre pilares para protexer o gran da humidade e dos roedores. Hainos de pedra e de madeira por toda Galicia.'] },
  { h: ['Where the river meets the sea', 'Donde el río encuentra el mar', 'Onde o río atopa o mar'],
    p: ['Fresh water and salt water mix in the ría, and that is why it is so rich in shellfish: cockles, clams and razor clams.',
      'El agua dulce y la salada se mezclan en la ría, y por eso es tan rica en marisco: berberechos, almejas y navajas.',
      'A auga doce e a salgada mestúranse na ría, e por iso é tan rica en marisco: berberechos, ameixas e navallas.'] },
  { h: ['Wreck of the Cardenal Cisneros', 'Naufragio del Cardenal Cisneros', 'Naufraxio do Cardenal Cisneros'],
    p: ['Off the coast of Monte Louro, the armoured cruiser of the Spanish Navy Cardenal Cisneros sank in 1905 after running aground on a shoal.',
      'Frente a las costas del Monte Louro se hundió en 1905 el crucero acorazado de la Armada española Cardenal Cisneros tras encallar en un bajo.',
      'Fronte ás costas do Monte Louro afundiuse en 1905 o cruceiro encoirazado da Armada española Cardenal Cisneros tras encallar nun baixo.'] }
];
let lang = 'en';
try {
  const q = /[?&]lang=(en|es|gl)\b/.exec(location.search);
  lang = q ? q[1] : localStorage.getItem('xlang');
  if (NAMES.indexOf(lang) < 0) {
    // first visit: the language of the visitor's computer / phone (the first of its preferred languages we speak), English otherwise
    lang = 'en';
    const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']);
    for (const p of prefs) { const c = String(p).toLowerCase().slice(0, 2); if (NAMES.indexOf(c) >= 0) { lang = c; break; } }
  }
} catch (e) {}
export const getLang = () => lang;
export const tr = (s) => { const r = MAP.get(norm(s)); return r ? r[NAMES.indexOf(lang)] : s; };
export const mochiText = (i) => MOCHI[i][NAMES.indexOf(lang)];

// ---- text nodes: each remembers its English original, so switching back (or on to another language) is exact
const store = new WeakMap();
const lead = (s) => /^\s*/.exec(s)[0], trail = (s) => /\s*$/.exec(s)[0];
function fixNode(n) {
  const raw = n.nodeValue, rec = store.get(n);
  const orig = rec && raw === rec.w ? rec.o : raw;           // changed by the page itself since we wrote it: that is the new original
  const row = MAP.get(norm(orig));
  const out = row && lang !== 'en' ? lead(orig) + row[NAMES.indexOf(lang)] + trail(orig) : orig;
  if (out !== raw) n.nodeValue = out;
  if (row || rec) store.set(n, { o: orig, w: out });
}
function walk(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => /^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(n.parentNode && n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  let n; const list = [];
  while ((n = w.nextNode())) list.push(n);
  for (const x of list) fixNode(x);
}
// the menu words are built letter by letter (they roll up on hover): rebuild those letters
function rolls(root) {
  const as = (root.nodeType === 1 ? root : document).querySelectorAll('a .x-roll');
  for (const r of as) {
    const a = r.closest('a'); if (!a) continue;
    if (!a.dataset.xo) { const l0 = a.getAttribute('aria-label') || r.textContent.slice(0, r.textContent.length / 2); a.dataset.xo = REV.get(norm(l0)) || l0; }
    const row = MAP.get(norm(a.dataset.xo)), text = row && lang !== 'en' ? row[NAMES.indexOf(lang)] : a.dataset.xo;
    if (a.dataset.xl === lang + text) continue;
    a.dataset.xl = lang + text; a.setAttribute('aria-label', text);
    for (const cls of ['x-a', 'x-b']) {
      const s = r.querySelector('.' + cls); if (!s) continue;
      s.textContent = '';
      Array.prototype.forEach.call(text, (ch, i) => { const l = document.createElement('i'); l.textContent = ch; l.style.setProperty('--i', i); s.appendChild(l); });
    }
  }
}
// "rolling text" blocks of the page (a letter per span, like MORE PROJECTS): the new letters are written into the same spans
function letters(root) {
  const ps = (root.nodeType === 1 ? root : document).querySelectorAll('p[class*="rolling-text-inner"]');
  for (const p of ps) {
    const sp = Array.prototype.filter.call(p.children, (c) => c.tagName === 'SPAN');
    if (!sp.length) continue;
    if (!p.dataset.xo) p.dataset.xo = sp.map((c) => c.textContent).join('').replace(/\u00a0/g, ' ');
    const row = MAP.get(norm(p.dataset.xo)), text = row && lang !== 'en' ? row[NAMES.indexOf(lang)] : p.dataset.xo;
    if (p.dataset.xl === lang + text) continue;
    p.dataset.xl = lang + text;
    const ch = Array.from(text);
    sp.forEach((c, i) => { const v = i < sp.length - 1 ? (ch[i] || '') : ch.slice(i).join(''); c.textContent = v === ' ' ? '\u00a0' : v; });
  }
}
function apply(root) { walk(root); rolls(root); letters(root); document.documentElement.lang = lang; }

let pend = null, busy = false;
const mo = new MutationObserver((ms) => {
  if (busy) return;
  if (!pend) { pend = new Set(); requestAnimationFrame(() => { const p = pend; pend = null; busy = true; try { for (const t of p) if (t.isConnected) { if (t.nodeType === 3) fixNode(t); else walk(t); } rolls(document); letters(document); } finally { busy = false; mo.takeRecords(); } }); }
  for (const m of ms) {
    if (m.type === 'characterData') pend.add(m.target);
    else for (const n of m.addedNodes) pend.add(n.nodeType === 3 ? n : n);
  }
});

// ---- the discreet switch
function css() {
  if (document.getElementById('x-lang-css')) return;
  const s = document.createElement('style'); s.id = 'x-lang-css';
  s.textContent = '.x-lang{position:fixed;left:14px;bottom:12px;z-index:11;display:flex;gap:2px;align-items:center;font:500 11px/1 "IBM Plex Mono","IBM Plex Mono Placeholder",monospace;letter-spacing:.08em;color:#fff;mix-blend-mode:difference;opacity:.85;transition:opacity .3s}' +
    '.x-lang:hover,.x-lang:focus-within{opacity:1}.x-lang button{all:unset;cursor:pointer;padding:6px 5px;text-transform:uppercase;opacity:.62;border-bottom:1px solid transparent;transition:opacity .2s}' +
    '.x-lang button:hover{opacity:1}.x-lang button[aria-pressed="true"]{opacity:1;border-bottom-color:currentColor}.x-lang i{font-style:normal;opacity:.4}';
  document.head.appendChild(s);
}
function ui() {
  if (document.querySelector('.x-lang')) return;
  css();
  const d = document.createElement('div'); d.className = 'x-lang'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Language');
  const full = { en: 'English', es: 'Español', gl: 'Galego' };
  NAMES.forEach((l, i) => {
    if (i) { const sep = document.createElement('i'); sep.textContent = '·'; sep.setAttribute('aria-hidden', 'true'); d.appendChild(sep); }
    const b = document.createElement('button'); b.type = 'button'; b.textContent = l; b.title = full[l]; b.lang = l; b.setAttribute('aria-pressed', String(l === lang));
    b.addEventListener('click', () => set(l));
    d.appendChild(b);
  });
  document.body.appendChild(d);
}
export function set(l) {
  if (NAMES.indexOf(l) < 0 || l === lang) return;
  lang = l;
  try { localStorage.setItem('xlang', l); } catch (e) {}
  busy = true; try { apply(document.body); } finally { busy = false; mo.takeRecords(); }
  for (const b of document.querySelectorAll('.x-lang button')) b.setAttribute('aria-pressed', String(b.lang === l));
  window.dispatchEvent(new CustomEvent('xlang', { detail: l }));
}
function start() {
  ui();
  busy = true; try { apply(document.body); } finally { busy = false; mo.takeRecords(); }
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
}
if (document.body) start(); else addEventListener('DOMContentLoaded', start);
window.xLang = { get: getLang, set, tr };

// the neighbours of the ride who know Martamon (the ones with dots above their heads): each has their own way of talking; every tap gives an opening line and then something about her (taken from this website)
export const TALKERS = [[[["Oh, do you know Martamon? She's a sweetheart, that girl!", "Ay, ¿conoces a Martamon? ¡Es un sol, esa rapaza!", "Ai, ¿coñeces a Martamon? ¡É un sol, esa rapaza!"], ["She works at WPP Production, in Madrid, in a huge advertising group! And I saw her learn to ride a bike...", "Trabaja en WPP Production, en Madrid, ¡en un grupo publicitario enorme! Y yo que la vi aprender a andar en bici...", "Traballa en WPP Production, en Madrid, ¡nun grupo publicitario enorme! E eu que a vin aprender a andar en bici..."]], [["Look at that... have you seen Martamon's work?", "Mírala, mírala... ¿has visto lo de Martamon?", "Mírala, mírala... ¿viches o de Martamon?"], ["She made «Soidades de Onte», a visual poem of her childhood memories. It moved me to tears!", "Hizo «Soidades de Onte», un poema visual con sus recuerdos de cuando era niña. ¡Me emocioné toda!", "Fixo «Soidades de Onte», un poema visual cos seus recordos de cando era nena. ¡Emocioneime toda!"]]], [[["Hey, you. Do you know Martamon? A sailor's granddaughter, as they say.", "Eh, tú. ¿Conoces a Martamon? Nieta de marinero, como quien dice.", "Eh, ti. ¿Coñeces a Martamon? Neta de mariñeiro, como quen di."], ["She made the brand for the Pedra Pas bar, where her grandfather played. That's honouring the family.", "Le hizo la marca al bar Pedra Pas, donde jugaba su abuelo. Eso es honrar a la familia.", "Fíxolle a marca ao bar Pedra Pas, onde xogaba o seu avó. Iso é honrar á familia."]], [["Listen, you'll like this: Martamon...", "Escucha, que esto te interesa: Martamon...", "Escoita, que isto che interesa: Martamon..."], ["...has worked on projects for Google and Iberdrola. And she started watching boats like me, almost.", "...ha trabajado en proyectos para Google e Iberdrola. Y empezó mirando barcos como yo, casi.", "...traballou en proxectos para Google e Iberdrola. E comezou mirando barcos coma min, case."]]], [[["Hey, hey!! Do you know Martamon?! She's awesome!!", "¡¡Oye, oye!! ¿¡Conoces a Martamon!? ¡¡Es genial!!", "¡¡Oe, oe!! ¿¡Coñeces a Martamon!? ¡¡É xenial!!"], ["She makes images with artificial intelligence and animates them! Like magic, for real!", "¡Hace imágenes con inteligencia artificial y las anima! ¡Como magia, de verdad!", "¡Fai imaxes con intelixencia artificial e anímaas! ¡Coma maxia, de verdade!"]], [["Me again! You know what else Martamon does?", "¡Otra vez yo! ¿Sabes qué más hace Martamon?", "¡Outra vez eu! ¿Sabes que máis fai Martamon?"], ["She's a photographer and a retoucher! And she knows all of that Adobe thing!", "¡Es fotógrafa y retocadora! ¡Y se sabe todo el Adobe ese!", "¡É fotógrafa e retocadora! ¡E sábese todo o Adobe ese!"]]], [[["Good morning, dear. Does Martamon ring a bell? She drops by now and then.", "Buenos días, cariño. ¿Te suena Martamon? Pasa por aquí de vez en cuando.", "Bos días, cariño. ¿Cústache Martamon? Pasa por aquí de cando en vez."], ["She designs websites, even this very website you're looking at! I wouldn't know how.", "Ella diseña páginas web, ¡hasta esta misma web que estás viendo! Yo no sé cómo se hace eso.", "Ela deseña páxinas web, ¡ata esta mesma web que estás vendo! Eu non sei como se fai iso."]], [["Come in, don't be shy... Do you know Martamon?", "Pasa, pasa, no te cortes... ¿Conoces a Martamon?", "Pasa, pasa, non te cortes... ¿Coñeces a Martamon?"], ["She retouched cosmetics for Soap & Glory, the Boots brand. I buy it, and she's in there!", "Retocó cosmética para Soap & Glory, la marca de Boots. Yo lo compro, ¡y sale ella!", "Retocou cosmética para Soap & Glory, a marca de Boots. Eu cómproo, ¡e sae ela!"]]], [[["Dude, have you heard of Martamon? She's literally a legend.", "Tío, ¿has oído hablar de Martamon? Es literalmente una crack.", "Tío, ¿escoitaches falar de Martamon? É literalmente unha crack."], ["She's worked for Coca-Cola and Toyota. Coca-Cola, no less! I'm freaking out.", "Ha currado para Coca-Cola y Toyota. Coca-Cola, ¡nada menos! Yo flipo.", "Traballou para Coca-Cola e Toyota. Coca-Cola, ¡nada menos! Eu flipo."]], [["Okay, okay, one more: Martamon, you know?", "Ok, ok, una más: Martamon, ¿sabes?", "Vale, vale, unha máis: Martamon, ¿sabes?"], ["This year she makes images and videos for Schweppes in 10K quality. 10K quality, wild!", "Este año hace imágenes y vídeos para Schweppes en calidad 10K. Calidad 10K, ¡qué bestia!", "Este ano fai imaxes e vídeos para Schweppes en calidade 10K. Calidade 10K, ¡que bestia!"]]], [[["Psst... come here. Do you know Martamon? But don't tell anyone...", "Psst... ven, ven. ¿Conoces a Martamon? Pero que no se entere nadie...", "Psst... ven, ven. ¿Coñeces a Martamon? Pero que non se decate ninguén..."], ["She did the product images for Lexus Singapore, for WPP. Singapore! Quite something.", "Hizo las imágenes de producto de Lexus Singapur, para WPP. ¡Singapur! Se dice pronto.", "Fixo as imaxes de produto de Lexus Singapur, para WPP. ¡Singapur! Dise axiña."]], [["And now another one, but you didn't hear it from me...", "Y ahora te cuento otra, pero tú no has oído nada...", "E agora cóntoche outra, pero ti non oíches nada..."], ["Procter & Gamble and Colgate-Palmolive have called her too. And she's so calm about it!", "Procter & Gamble y Colgate-Palmolive también la han llamado. ¡Y ella tan tranquila!", "Procter & Gamble e Colgate-Palmolive tamén a chamaron. ¡E ela tan tranquila!"]]], [[["May I ask: do you know Martamon? An admirable career.", "Permítame una pregunta: ¿conoce usted a Martamon? Una trayectoria admirable.", "Permítame unha pregunta: ¿coñece vostede a Martamon? Unha traxectoria admirable."], ["Her final degree project, AYE AYE, was editorial design and photography on discrimination through clothing.", "Su trabajo de fin de grado, AYE AYE, fue diseño editorial y fotografía sobre la discriminación a través de la ropa.", "O seu traballo de fin de grao, AYE AYE, foi deseño editorial e fotografía sobre a discriminación a través da roupa."]], [["Let me tell you something more about Martamon, if I may.", "Le diré algo más sobre Martamon, si me lo permite.", "Direille algo máis sobre Martamon, se mo permite."], ["Besides web design she handles the Adobe suite at an advanced level and creates corporate identities and product design.", "Además del diseño web maneja el paquete Adobe a nivel avanzado y crea identidades corporativas y diseño de producto.", "Ademais do deseño web manexa o paquete Adobe a nivel avanzado e crea identidades corporativas e deseño de produto."]]], [[["What a lovely day, isn't it? ...Do you know Martamon? Always with her camera in hand.", "Qué día tan bueno, ¿verdad? ...¿Conoces a Martamon? Siempre con la cámara en la mano.", "Que día tan bo, ¿verdade? ...¿Coñeces a Martamon? Sempre coa cámara na man."], ["She went to China with a WeRoad group. She says she wrote it in her school notebook and did it at 24.", "Se fue a China con un grupo de WeRoad. Dice que lo apuntó en su cuaderno del cole y lo cumplió a los 24.", "Foi á China cun grupo de WeRoad. Di que o apuntou no seu caderno do cole e cumpriuno aos 24."]], [["Easy, easy, there's no rush... Martamon also travelled to Greece.", "Tranquilo, tranquilo, no hay prisa... Martamon también viajó a Grecia.", "Tranquilo, tranquilo, non hai présa... Martamon tamén viaxou a Grecia."], ["Travel photography, just that. She clearly loves seeing the world through a camera.", "Fotografía de viaje, tal cual. Se ve que le gusta mirar el mundo a través de una cámara.", "Fotografía de viaxe, tal cal. Vese que lle gusta mirar o mundo a través dunha cámara."]]], [[["Hey! What's up? Do you know Martamon? She's my favourite photographer!", "¡Ey! ¿Qué pasa? ¿Conoces a Martamon? ¡Es mi fotógrafa favorita!", "¡Ei! ¿Que pasa? ¿Coñeces a Martamon? ¡É a miña fotógrafa favorita!"], ["She once did a beach shoot at 2 a.m. with a flashlight, freezing. Result: brutal.", "Una vez hizo una sesión en la playa a las 2 de la mañana con una linterna, muerta de frío. Resultado: brutal.", "Unha vez fixo unha sesión na praia ás 2 da mañá cunha lanterna, morta de frío. Resultado: brutal."]], [["Dropping another one: Martamon, shall I tell you?", "Dropeo otra: Martamon, ¿te lo cuento?", "Dropeo outra: Martamon, ¿cho conto?"], ["With her camera and not much else, she made something spectacular. That's her: no improvising!", "Con su cámara y poco más, hizo un trabajo que quedó espectacular. Así es ella: ¡nada de improvisar!", "Coa súa cámara e pouco máis, fixo un traballo que quedou espectacular. Así é ela: ¡nada de improvisar!"]]], [[["Hey, hi! I'm Mario, from Madrid. Do you know Marta? We work together!", "¡Buenas! Soy Mario, de Madrid. ¿Tú conoces a Marta? ¡Somos compañeros de trabajo!", "¡Boas! Son Mario, de Madrid. ¿Coñeces a Marta? ¡Somos compañeiros de traballo!"], ["We work together at WPP Production. She always said her village was beautiful, and now I see she was right!", "Trabajamos juntos en WPP Production. Siempre decía que su pueblo era precioso, y ahora veo que tenía razón.", "Traballamos xuntos en WPP Production. Sempre dicía que a súa vila era preciosa, e agora vexo que tiña razón."]], [["Mario again! Marta is one of those colleagues who always lends a hand.", "¡Mario otra vez! Marta es de esas compañeras que siempre echan una mano.", "¡Mario outra vez! Marta é desas compañeiras que sempre botan unha man."], ["And with the AI she does in her department, she leaves us all speechless at the office.", "Y con lo que hace de inteligencia artificial en su departamento, nos deja a todos con la boca abierta en la oficina.", "E co que fai de intelixencia artificial no seu departamento, déixanos a todos coa boca aberta na oficina."]]], [[["Hey, what's up! I'm Adrián. Have you ever tried the food in the WPP head office canteen?", "¡Ey, qué pasa! Soy Adrián. ¿Has probado alguna vez la comida de la cantina de la oficina de la matriz de WPP?", "¡Ei, que tal! Son Adrián. ¿Probaches algunha vez a comida da cantina da oficina da matriz de WPP?"], ["Honestly, I only come for the food. Oh, and Marta, who always saves me a seat in the canteen!", "Te lo digo en serio, yo solo voy por la comida. ¡Ah, y por Marta, que siempre me guarda sitio en la cantina!", "Dígoche en serio, eu só vou pola comida. ¡Ah, e por Marta, que sempre me garda sitio na cantina!"]], [["Adrián again. Listen: the WPP canteen has the best food in all of Madrid. I'm not exaggerating.", "Adrián otra vez. Escucha: la cantina de WPP tiene la mejor comida de todo Madrid. No exagero.", "Adrián outra vez. Escoita: a cantina de WPP ten a mellor comida de todo Madrid. Non esaxero."], ["The head office canteen... what a menu! I swear I'd cross Spain just for lunch there.", "¡La cantina de la oficina de la matriz... qué menú! Te juro que cruzaría España solo para comer allí.", "¡A cantina da oficina da matriz... que menú! Xúroche que cruzaría España só para comer alí."]]], [[["Hey, I'm Nico! Another colleague of Marta's, here from Madrid. Do you know her?", "¡Ey, soy Nico! Otro compañero de Marta, aquí desde Madrid. ¿La conoces?", "¡Ei, son Nico! Outro compañeiro de Marta, aquí dende Madrid. ¿Coñéceslle?"], ["We work together at WPP Production. With her we always end up laughing, even on the tightest deadlines.", "Trabajamos juntos en WPP Production. Con ella siempre acabamos riéndonos, hasta con las entregas más apuradas.", "Traballamos xuntos en WPP Production. Con ela sempre acabamos rindo, ata coas entregas máis axustadas."]], [["Nico again! Don't look at my head, I was born like this. Let's talk about Marta instead.", "¡Nico otra vez! No mires mi cabeza, soy así de nacimiento. Mejor hablemos de Marta.", "¡Nico outra vez! Non mires a miña cabeza, nacín así. Mellor falemos de Marta."], ["She retouches, generates images with AI and designs websites. And she still has time to show us her village!", "Retoca, genera imágenes con IA y diseña webs. ¡Y aún le queda tiempo para enseñarnos su pueblo!", "Retoca, xera imaxes con IA e deseña webs. ¡E aínda lle queda tempo para ensinarnos a súa vila!"]]]];
export const TALKER_NAMES = [null, null, null, null, null, null, null, null, null, 'Mario', 'Adrián', 'Nico'];
