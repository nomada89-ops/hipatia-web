export interface BlogPost {
    slug: string;
    title: string; // Used as H1 and display title
    seoTitle?: string; // Specific SEO Title tag
    excerpt: string; // Meta description
    content: string; // HTML content
    date: string;
    author: string;
    readTime: string;
    category: string;
    imageUrl?: string;
    imageAlt?: string; // Alt text for SEO
    keywords?: string;
}

export const blogPosts: BlogPost[] = [
    {
        slug: "revolucion-calificacion-ia-consenso-pedagogico",
        title: "Hipatia: MÃ¡s allÃ¡ de la IA, una nueva Ã©tica en la calificaciÃ³n",
        seoTitle: "Hipatia: El fin del error humano en la correcciÃ³n de exÃ¡menes",
        excerpt: "Â¿Es justa la nota de una IA? Descubre el sistema de Triple Consenso de Hipatia, diseÃ±ado por y para docentes para garantizar una evaluaciÃ³n transparente.",
        date: "10 Enero, 2026",
        author: "Equipo HIPATIA",
        readTime: "6 min lectura",
        category: "InnovaciÃ³n Educativa",
        keywords: "CalificaciÃ³n acadÃ©mica con IA",
        imageUrl: "/blog-ethics.png",
        imageAlt: "Imagen del flujo de trabajo de Hipatia: Triple Consenso PedagÃ³gico",
        content: `
            <p class="lead">Si eres docente, conoces ese peso en el estÃ³mago al corregir la pila de exÃ¡menes nÃºmero cincuenta de la tarde. El cansancio nubla el juicio, y el "bolÃ­grafo rojo" a veces se vuelve mÃ¡s subjetivo de lo que nos gustarÃ­a admitir. Cuando decidimos crear Hipatia, no querÃ­amos simplemente poner una mÃ¡quina a leer textos; querÃ­amos replicar la sabidurÃ­a de un tribunal de expertos que debate, duda y, finalmente, acierta.</p>

            <h2>El problema de la "mente Ãºnica" en la tecnologÃ­a</h2>
            <p>Poner una nota no es un proceso lineal. Requiere entender el contexto, valorar el esfuerzo y seguir una rÃºbrica a rajatabla. La mayorÃ­a de las soluciones de inteligencia artificial fallan porque actÃºan como una "mente Ãºnica": lo que dicen es la ley. Pero en educaciÃ³n, la ley debe ser la justicia.</p>
            <p>En Hipatia, entendimos rÃ¡pidamente que confiar en un solo algoritmo era un error. Por eso, diseÃ±amos una arquitectura basada en el <strong>Triple Consenso</strong>, un sistema de pesos y contrapesos que garantiza que ningÃºn alumno sea juzgado por un "error de cÃ¡lculo" digital.</p>

            <h2>Â¿CÃ³mo funciona el corazÃ³n de Hipatia?</h2>
            <p>Imagina un departamento universitario donde tres profesores revisan el mismo examen. AsÃ­ es como Hipatia procesa cada entrega:</p>
            
            <ul>
                <li><strong>La Primera Lectura (El Juez):</strong> Un primer motor de anÃ¡lisis desglosa el examen siguiendo la rÃºbrica que el profesor ha definido. No se salta ni una coma. Su trabajo es puramente tÃ©cnico y matemÃ¡tico, asegurando que cada criterio de evaluaciÃ³n sea atendido.</li>
                <li><strong>La AuditorÃ­a Humana (El Revisor):</strong> AquÃ­ entra la empatÃ­a digital. Un segundo motor independiente revisa el trabajo del primero. Su misiÃ³n es "ponÃ©rselo difÃ­cil" al Juez. Busca errores de interpretaciÃ³n, valora si una palabra mal escrita por el OCR es realmente un error ortogrÃ¡fico o solo un trazo difÃ­cil, y ajusta el tono para que el feedback sea constructivo y no punitivo.</li>
                <li><strong>El Arbitraje Final (El Veredicto):</strong> Â¿QuÃ© pasa si los dos anteriores no se ponen de acuerdo? En el mundo real, esto causarÃ­a un conflicto. En Hipatia, se activa automÃ¡ticamente un tercer motor de alta densidad que actÃºa como Ã¡rbitro supremo. Analiza los argumentos de ambos y dicta una sentencia basada en la evidencia del texto.</li>
            </ul>

            <h2>TecnologÃ­a invisible para un impacto real</h2>
            <p>Lo mÃ¡s bonito de este sistema es que, como profesor, no ves la complejidad tÃ©cnica de los nodos ni el flujo de datos que viaja por detrÃ¡s. Lo que recibes es un informe honesto. Un documento que le habla al alumno de "tÃº a tÃº", que le explica por quÃ© tiene un 7.5 y no un 8, y que le motiva a mejorar en los puntos especÃ­ficos donde fallÃ³.</p>
            <p>Estamos convencidos de que la tecnologÃ­a no ha venido a sustituir al profesor, sino a liberarlo de la parte mÃ¡s mecÃ¡nica para que pueda centrarse en lo que realmente importa: enseÃ±ar.</p>
        `
    },
    {
        slug: "privacidad-ia-educacion-anonimizacion-datos",
        title: "Seguridad y Privacidad: El Compromiso Innegociable de Hipatia",
        seoTitle: "Privacidad Blindada: El Protocolo de Ã‰tica de Datos en Hipatia",
        excerpt: "Â¿CÃ³mo garantiza Hipatia la seguridad de los alumnos? Descubre nuestro protocolo de anonimizaciÃ³n automÃ¡tica y el tratamiento Ã©tico de datos en la calificaciÃ³n con IA.",
        date: "12 Enero, 2026",
        author: "Equipo HIPATIA",
        readTime: "4 min lectura",
        category: "Privacidad y Ã‰tica",
        keywords: "Privacidad datos educaciÃ³n, AnonimizaciÃ³n IA",
        imageUrl: "/blog-privacy.png",
        imageAlt: "Protocolo de Seguridad y LOPD de Hipatia",
        content: `
            <p class="lead">En la era de la educaciÃ³n digital, la privacidad no es una opciÃ³n, es un derecho fundamental. Mientras muchas herramientas de IA procesan informaciÃ³n sin filtros, <strong>Hipatia</strong> ha sido diseÃ±ada bajo el principio de <strong>Privacidad por DiseÃ±o (Privacy by Design)</strong>. Nuestro sistema asegura que la identidad del alumno permanezca protegida durante todo el ciclo de evaluaciÃ³n.</p>

            <h2>El Escudo de AnonimizaciÃ³n AutomÃ¡tica</h2>
            <p>Mucho antes de que el examen sea analizado por nuestros motores de evaluaciÃ³n, el sistema activa un <strong>Protocolo de Limpieza de Datos</strong>. Este proceso ocurre a nivel de cÃ³digo interno y es invisible para el usuario, pero crÃ­tico para la seguridad.</p>
            <ul>
                <li><strong>DetecciÃ³n de Patrones Sensibles:</strong> El sistema utiliza algoritmos de reconocimiento de patrones para identificar y "borrar" automÃ¡ticamente correos electrÃ³nicos, nÃºmeros de identidad y nombres propios.</li>
                <li><strong>SustituciÃ³n DinÃ¡mica:</strong> La informaciÃ³n sensible se reemplaza por etiquetas genÃ©ricas o IDs internos. Esto permite que el sistema evalÃºe el contenido acadÃ©mico sin conocer la identidad real de la persona detrÃ¡s del examen.</li>
            </ul>

            <h2>Ã‰tica en la EvaluaciÃ³n: Eliminando el Sesgo Humano y Digital</h2>
            <p>La privacidad no solo protege al alumno, tambiÃ©n garantiza una <strong>calificaciÃ³n mÃ¡s justa</strong>. Al anonimizar los datos, Hipatia elimina cualquier posibilidad de sesgo consciente o inconsciente.</p>
            <ol>
                <li><strong>EvaluaciÃ³n Ciega:</strong> Los agentes encargados de calificar solo reciben el contenido intelectual del examen.</li>
                <li><strong>Neutralidad de Algoritmos:</strong> Al no tener acceso a metadatos personales, los motores de razonamiento se centran exclusivamente en el cumplimiento de la rÃºbrica pedagÃ³gica.</li>
            </ol>

            <h2>Trazabilidad sin Compromiso</h2>
            <p>Â¿CÃ³mo devolvemos la nota al alumno correcto si todo es anÃ³nimo? La respuesta reside en nuestra arquitectura de <strong>Mapeo de Datos</strong>.</p>
            <p>Utilizamos variables de sistema para "enlazar" el resultado final con el token de usuario original. Este proceso permite que el profesor mantenga el control total del libro de calificaciones en su base de datos privada, sin que la informaciÃ³n personal haya salido jamÃ¡s de su entorno seguro.</p>

            <h2>Cumplimiento de EstÃ¡ndares Internacionales</h2>
            <p>Hipatia ha sido configurada para alinearse con las normativas de protecciÃ³n de datos mÃ¡s exigentes. Al ejecutar procesos en servidores controlados y utilizar flujos de trabajo cerrados, garantizamos que los exÃ¡menes manuscritos y las respuestas digitales se procesen bajo estÃ¡ndares de seguridad de nivel empresarial.</p>
        `
    },
    {
        slug: "tecnologia-ocr-caligrafia-examen",
        title: "Del papel al informe: La tecnologÃ­a que da vida a los exÃ¡menes manuscritos",
        seoTitle: "De la tinta al bit: CÃ³mo Hipatia \"entiende\" la caligrafÃ­a del alumno",
        excerpt: "Hipatia no obliga a abandonar el papel. Descubre cÃ³mo nuestro Motor de TranscripciÃ³n AcadÃ©mica convierte exÃ¡menes manuscritos en anÃ¡lisis de datos precisos sin perder el contexto.",
        date: "14 Enero, 2026",
        author: "Equipo HIPATIA",
        readTime: "5 min lectura",
        category: "TecnologÃ­a Educativa",
        keywords: "OCR manuscrito, DigitalizaciÃ³n exÃ¡menes, TranscripciÃ³n acadÃ©mica",
        imageUrl: "/blog-ocr.png",
        imageAlt: "TransformaciÃ³n de texto manuscrito a datos digitales en Hipatia",
        content: `
            <p class="lead">Todos hemos estado ahÃ­: una montaÃ±a de hojas de papel, caligrafÃ­as difÃ­ciles de descifrar y la presiÃ³n de entregar una retroalimentaciÃ³n Ãºtil a tiempo. En el desarrollo de Hipatia, sabÃ­amos que no podÃ­amos pedirles a los alumnos que dejaran de usar papel y bolÃ­grafo; escribir a mano es parte fundamental del proceso cognitivo. Por eso, decidimos crear un puente tecnolÃ³gico que uniera lo mejor del mundo analÃ³gico con la precisiÃ³n del mundo digital.</p>

            <h2>No es solo leer, es comprender el contexto</h2>
            <p>La mayorÃ­a de los sistemas de reconocimiento de texto (OCR) se limitan a convertir imÃ¡genes en palabras sueltas. Hipatia va un paso mÃ¡s allÃ¡. Cuando un profesor sube la foto de un examen, nuestro sistema no solo identifica letras; activa un <strong>Motor de TranscripciÃ³n AcadÃ©mica</strong> diseÃ±ado para entender el contexto docente.</p>
            <p>Gracias a este proceso, el sistema es capaz de diferenciar entre un tachÃ³n, una nota al margen o una respuesta estructurada. Esta "visiÃ³n inteligente" es el primer eslabÃ³n de una cadena que transforma una simple fotografÃ­a en datos procesables para la evaluaciÃ³n.</p>

            <h2>La "Magia" detrÃ¡s de la transformaciÃ³n digital</h2>
            <p>El viaje de un examen en Hipatia es fascinante desde un punto de vista tÃ©cnico, pero sencillo de entender:</p>
            <ul>
                <li><strong>Captura Inteligente:</strong> El flujo comienza recibiendo las imÃ¡genes a travÃ©s de un canal seguro. AquÃ­, la tecnologÃ­a se encarga de "limpiar" la imagen para que la lectura sea perfecta.</li>
                <li><strong>TranscripciÃ³n Fiel:</strong> Antes de poner una nota, Hipatia actÃºa como un perito calÃ­grafo. Transcribe cada frase respetando la intenciÃ³n del alumno, sin corregir errores todavÃ­a, solo capturando la realidad del papel.</li>
                <li><strong>ConversiÃ³n a Informe PedagÃ³gico:</strong> Una vez que el texto es digital, la informaciÃ³n se procesa y se estructura en un formato visualmente atractivo. El resultado no es un archivo de texto plano, sino un informe HTML dinÃ¡mico, lleno de grÃ¡ficos, notas y consejos personalizados.</li>
            </ul>

            <h2>Reduciendo la brecha entre el aula y el dato</h2>
            <p>Lo que antes tomaba horas de transcripciÃ³n y correcciÃ³n manual, ahora sucede en segundos. Pero lo mÃ¡s importante no es la velocidad, sino la calidad de la informaciÃ³n. Al digitalizar el examen, el profesor obtiene una trazabilidad absoluta: puede ver exactamente quÃ© competencia fallÃ³ el alumno y por quÃ©, basÃ¡ndose en la evidencia directa de su puÃ±o y letra.</p>
            <p>Con Hipatia, el papel ya no es un lÃ­mite para la analÃ­tica educativa. Es el punto de partida para una educaciÃ³n mÃ¡s eficiente, transparente y, sobre todo, justa.</p>
        `
    },
    {
        slug: "generador-examenes-rubricas-ia-personalizable",
        title: "Creatividad bajo control: CÃ³mo Hipatia diseÃ±a tu prÃ³ximo examen",
        seoTitle: "Hipatia: Crea, edita y descarga tus exÃ¡menes y rÃºbricas en segundos",
        excerpt: "DiseÃ±a exÃ¡menes y rÃºbricas para cualquier materia con Hipatia. Control total: edita en pantalla y descarga en PDF con un solo clic.",
        date: "16 Enero, 2026",
        author: "Equipo HIPATIA",
        readTime: "5 min lectura",
        category: "Productividad Docente",
        keywords: "Generador de exÃ¡menes y rÃºbricas con IA",
        imageUrl: "/blog-generation.png",
        imageAlt: "Interfaz de generaciÃ³n de exÃ¡menes y rÃºbricas en Hipatia",
        content: `
            <p class="lead">La labor docente tiene un componente creativo agotador: diseÃ±ar el examen perfecto y la rÃºbrica que lo mida con justicia. Muchas veces, pasamos horas frente a una hoja en blanco intentando equilibrar la dificultad y los objetivos de aprendizaje. Hipatia ha sido diseÃ±ada para ser tu "asistente de taller", permitiÃ©ndote generar materiales de alta calidad para cualquier materia, desde fÃ­sica cuÃ¡ntica hasta literatura contemporÃ¡nea, en cuestiÃ³n de segundos.</p>

            <h2>ExÃ¡menes y rÃºbricas a la medida de tu aula</h2>
            <p>No creemos en las soluciones "enlatadas". Cada grupo de alumnos es un mundo, y Hipatia lo sabe. Nuestro mÃ³dulo de generaciÃ³n permite:</p>
            <ul>
                <li><strong>AdaptaciÃ³n Total:</strong> TÃº defines el tema, el nivel de dificultad y el tipo de preguntas. El sistema utiliza algoritmos avanzados para proponer una estructura coherente.</li>
                <li><strong>RÃºbricas SemÃ¡nticas:</strong> OlvÃ­date de pelearte con tablas de Excel. Hipatia genera rÃºbricas detalladas que vinculan cada pregunta con competencias especÃ­ficas, asegurando una evaluaciÃ³n transparente.</li>
                <li><strong>EdiciÃ³n en Tiempo Real:</strong> Nada de lo que genera la IA es definitivo. Todo el contenido aparece en tu pantalla de forma editable. Â¿Quieres cambiar una pregunta? Â¿Ajustar un porcentaje de la rÃºbrica? Puedes hacerlo directamente antes de confirmar.</li>
            </ul>

            <h2>La soberanÃ­a del papel: Edita y descarga con un clic</h2>
            <p>Sabemos que, al final del dÃ­a, el aula sigue siendo un espacio fÃ­sico. Por eso, Hipatia facilita la transiciÃ³n del mundo digital al real. Tanto los exÃ¡menes como las rÃºbricas que generes pueden descargarse instantÃ¡neamente. Esto te permite tener una copia fÃ­sica lista para imprimir o compartir en tu plataforma de aprendizaje preferida.</p>

            <h2>El Informe de CalificaciÃ³n: Tu nuevo aliado en las tutorÃ­as</h2>
            <p>Una de las joyas de la corona de Hipatia es el Informe de CalificaciÃ³n. Tras el proceso de evaluaciÃ³n, el sistema genera un documento estructurado que es mucho mÃ¡s que una nota.</p>
            <ul>
                <li><strong>Interactividad Total:</strong> El informe se presenta en pantalla y es editable. Si como profesor consideras que un matiz merece una nota distinta o quieres personalizar un comentario de retroalimentaciÃ³n, puedes hacerlo allÃ­ mismo antes de entregarlo.</li>
                <li><strong>Profesionalismo en PDF:</strong> Una vez que el informe es perfecto, puedes descargarlo en formato PDF. Es un documento elegante, profesional y detallado, ideal para entregar a alumnos y familias en reuniones de tutorÃ­a o para el expediente acadÃ©mico.</li>
            </ul>

            <h2>ConclusiÃ³n: TÃº tienes el control, nosotros la tecnologÃ­a</h2>
            <p>En Hipatia, la tecnologÃ­a nunca sustituye tu criterio; lo potencia. Al automatizar la generaciÃ³n de borradores y la estructura de los informes, te devolvemos el tiempo que necesitas para lo mÃ¡s importante: la interacciÃ³n directa con tus alumnos. Con Hipatia, diseÃ±as, corriges y comunicas con una eficiencia y profesionalismo sin precedentes.</p>
        `
    },
    {
        slug: "justificacion-reclamaciones-notas-ia-objetiva",
        title: "Informes Blindados: CÃ³mo Hipatia justifica cada dÃ©cima ante una reclamaciÃ³n",
        seoTitle: "Hipatia: Informes blindados para justificar notas ante reclamaciones",
        excerpt: "Â¿Cansado de justificar notas? Descubre cÃ³mo los informes de Hipatia actÃºan como un escudo ante reclamaciones, basÃ¡ndose en rÃºbricas objetivas y datos tÃ©cnicos.",
        date: "20 Enero, 2026",
        author: "Equipo HIPATIA",
        readTime: "7 min lectura",
        category: "Derecho Educativo",
        keywords: "JustificaciÃ³n de notas, reclamaciones exÃ¡menes, IA educaciÃ³n",
        imageUrl: "/blog-justification.png",
        imageAlt: "Protocolo de generaciÃ³n de informes blindados en Hipatia",
        content: `
            <p>La evaluaciÃ³n es, sin duda, uno de los momentos mÃ¡s estresantes de la labor docente. No solo por la carga de trabajo que supone corregir decenas de exÃ¡menes, sino por el "segundo examen" que viene despuÃ©s: <strong>las tutorÃ­as con familias y las posibles reclamaciones de notas.</strong></p>

            <p>Â¿CuÃ¡ntas veces has pasado horas redactando una justificaciÃ³n para explicar por quÃ© un alumno tiene un 6.5 y no un 7? Con <strong>Hipatia</strong>, ese tiempo vuelve a ser tuyo.</p>

            <hr class="my-8" />

            <h2>MÃ¡s allÃ¡ del nÃºmero: Feedback con profundidad pedagÃ³gica</h2>

            <p>El gran error de muchas herramientas de IA es entregar resultados frÃ­os. Hipatia ha sido diseÃ±ada bajo un principio de <strong>asistente pedagÃ³gico</strong>. Cuando el sistema procesa un examen, no se limita a calcular un porcentaje; analiza las evidencias de aprendizaje.</p>

            <ul>
                <li><strong>Feedback Constructivo:</strong> El informe detalla los puntos fuertes y las Ã¡reas de mejora con un tono alentador y profesional.</li>
                <li><strong>AnÃ¡lisis por Competencias:</strong> El alumno entiende exactamente en quÃ© fase del aprendizaje se encuentra.</li>
                <li><strong>Claridad para las Familias:</strong> Se eliminan las ambigÃ¼edades. El padre o madre recibe un documento detallado que habla el lenguaje de la mejora, no solo del castigo del error.</li>
            </ul>

            <hr class="my-8" />

            <h2>El "Escudo JurÃ­dico": ConexiÃ³n total con la RÃºbrica</h2>

            <p>La verdadera potencia de Hipatia reside en su <strong>objetividad inquebrantable</strong>. El sistema no emite juicios de valor; aplica las reglas que tÃº, como docente, has establecido en la rÃºbrica.</p>

            <blockquote>
                <strong>El Principio de Trazabilidad:</strong> Cada comentario del informe final estÃ¡ vinculado a un criterio de evaluaciÃ³n especÃ­fico. Si la rÃºbrica indica que para alcanzar el "Sobresaliente" se requiere una "argumentaciÃ³n crÃ­tica original" y el alumno ha realizado una "descripciÃ³n literal", Hipatia lo seÃ±alarÃ¡ citando la norma.
            </blockquote>

            <h3>Â¿CÃ³mo te protege ante una reclamaciÃ³n?</h3>

            <table border="1" style="width:100%; border-collapse: collapse; text-align: left; margin-top: 1rem; margin-bottom: 1rem;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 10px;">SituaciÃ³n ComÃºn</th>
                        <th style="padding: 10px;">Respuesta con Hipatia</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 10px;">"Â¿Por quÃ© mi hijo tiene esta nota?"</td>
                        <td style="padding: 10px;">El informe desglosa la nota punto por punto segÃºn los criterios de la rÃºbrica oficial.</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">"Es que el profesor le tiene manÃ­a"</td>
                        <td style="padding: 10px;">La evaluaciÃ³n ha sido auditada por tres modelos de IA independientes (Triple Consenso) basados en evidencias ciegas.</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">"No entiendo quÃ© tiene que mejorar"</td>
                        <td style="padding: 10px;">El informe incluye una hoja de ruta especÃ­fica para que el alumno alcance el siguiente nivel de desempeÃ±o.</td>
                    </tr>
                </tbody>
            </table>

            <hr class="my-8" />

            <h2>Calidad garantizada por el Triple Consenso</h2>

            <p>Para asegurar que cada informe sea una pieza de "artesanÃ­a administrativa", Hipatia utiliza su arquitectura de tres niveles:</p>

            <ol>
                <li><strong>El Juez:</strong> EvalÃºa el contenido bruto del examen.</li>
                <li><strong>El Auditor:</strong> Verifica que la evaluaciÃ³n se ajusta estrictamente a la rÃºbrica proporcionada.</li>
                <li><strong>El Tribunal Supremo:</strong> Redacta el informe final asegurando que el tono sea pedagÃ³gico y que cada dÃ©cima estÃ© justificada legalmente.</li>
            </ol>

            <p>Con Hipatia, no solo corriges mÃ¡s rÃ¡pido: corriges mejor, con mÃ¡s seguridad y con la tranquilidad de que tu labor docente estÃ¡ protegida por datos objetivos.</p>

            <hr class="my-8" />

            <h2>ðŸŽ“ Ejemplo de Informe: "El examen de Historia"</h2>

            <p>Imagina un examen de <strong>Historia de 4Âº de ESO</strong> sobre la RevoluciÃ³n Industrial. El alumno ha sacado un <strong>6.25</strong>. AsÃ­ es como Hipatia presenta la informaciÃ³n:</p>

            <div style="background-color: #f9f9f9; padding: 20px; border-left: 5px solid #007bff; margin-top: 20px; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #007bff;">Informe de EvaluaciÃ³n: Hipatia</h3>
                <p style="font-size: 0.9em; color: #555;"><strong>Asignatura:</strong> GeografÃ­a e Historia | <strong>Fecha:</strong> 10/01/2026<br>
                <strong>Alumno:</strong> [ID_ANON_8842] | <strong>CalificaciÃ³n Final:</strong> 6.25 / 10</p>

                <h4 style="margin-top: 20px; border-bottom: 2px solid #e9ecef; padding-bottom: 5px;">ðŸ›¡ï¸ JustificaciÃ³n TÃ©cnica (Uso Docente/Familias)</h4>
                <div style="overflow-x: auto;">
                    <table border="1" style="width:100%; border-collapse: collapse; text-align: left; background-color: white; font-size: 0.9em;">
                        <thead>
                            <tr style="background-color: #e9ecef;">
                                <th style="padding: 8px;">Criterio de EvaluaciÃ³n</th>
                                <th style="padding: 8px;">Nivel</th>
                                <th style="padding: 8px;">Nota</th>
                                <th style="padding: 8px;">Evidencia Detectada (Cita Textual)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 8px;">1. PrecisiÃ³n HistÃ³rica</td>
                                <td style="padding: 8px; color: #28a745; font-weight: bold;">Avanzado</td>
                                <td style="padding: 8px; font-weight: bold;">8.5</td>
                                <td style="padding: 8px; font-style: italic;">"Menciona correctamente la ley de cercamientos y la mÃ¡quina de Watt."</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;">2. RelaciÃ³n Causa-Efecto</td>
                                <td style="padding: 8px; color: #fd7e14; font-weight: bold;">Intermedio</td>
                                <td style="padding: 8px; font-weight: bold;">5.0</td>
                                <td style="padding: 8px; font-style: italic;">"Relaciona poblaciÃ³n e industria, pero falta el capital financiero."</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;">3. Vocabulario TÃ©cnico</td>
                                <td style="padding: 8px; color: #dc3545; font-weight: bold;">Inicial</td>
                                <td style="padding: 8px; font-weight: bold;">4.0</td>
                                <td style="padding: 8px; font-style: italic;">"Usa 'fÃ¡bricas grandes' en lugar de 'sistema de producciÃ³n fabril'."</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;">4. OrtografÃ­a</td>
                                <td style="padding: 8px; color: #28a745; font-weight: bold;">Excelente</td>
                                <td style="padding: 8px; font-weight: bold;">10</td>
                                <td style="padding: 8px; font-style: italic;">"Texto fluido, sin errores detectados por el motor OCR."</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h4 style="margin-top: 20px; border-bottom: 2px solid #e9ecef; padding-bottom: 5px;">ðŸ“ AnÃ¡lisis del "Tribunal Supremo"</h4>
                <p style="background-color: white; padding: 10px; border-left: 3px solid #6c757d; font-style: italic;">"La calificaciÃ³n de 6.25 se fundamenta en un dominio sÃ³lido de los hechos cronolÃ³gicos (Criterio 1), pero se observa una falta de profundidad en el anÃ¡lisis multicausal (Criterio 2). Aunque el alumno identifica los inventos, no logra explicar la transiciÃ³n al sistema industrial de forma tÃ©cnica (Criterio 3), justificando la nota en el bloque de competencias."</p>

                <h4 style="margin-top: 20px; border-bottom: 2px solid #e9ecef; padding-bottom: 5px;">ðŸ’¡ Feedback PedagÃ³gico (Para el Alumno)</h4>
                <ul style="margin-bottom: 0;">
                    <li><strong>Enriquece tu lenguaje:</strong> En lugar de decir "habÃ­a mÃ¡s gente", utiliza "crecimiento demogrÃ¡fico sostenido".</li>
                    <li><strong>Conecta los puntos:</strong> Intenta explicar por quÃ© el dinero del comercio colonial fue clave para las fÃ¡bricas.</li>
                </ul>
            </div>

            <hr class="my-8" />

            <h3>ðŸ”¬ Por quÃ© este informe te ahorra problemas:</h3>
            <ul>
                <li><strong>Es irrefutable:</strong> Si un padre reclama, le muestras la columna de "Evidencia Detectada".</li>
                <li><strong>Es constructivo:</strong> El alumno se queda con una hoja de ruta para mejorar.</li>
                <li><strong>Ahorro de tiempo:</strong> Hipatia redacta esto en segundos tras escanear el papel.</li>
            </ul>
        `
    }
];
