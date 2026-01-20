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
    isoDate: string; // YYYY-MM-DD for JSON-LD
    faq?: { question: string; answer: string }[]; // For FAQPage Schema
}

export const blogPosts: BlogPost[] = [
    {
        slug: "revolucion-calificacion-ia-consenso-pedagogico",
        title: "Hipatia: Más allá de la IA, una nueva ética en la calificación",
        seoTitle: "Hipatia: El fin del error humano en la corrección de exámenes",
        excerpt: "¿Es justa la nota de una IA? Descubre el sistema de Triple Consenso de Hipatia, diseñado por y para docentes para garantizar una evaluación transparente.",
        date: "10 Enero, 2026",
        author: "Equipo HIPATIA",
        readTime: "6 min lectura",
        category: "Innovación Educativa",
        keywords: "Calificación académica con IA",
        isoDate: "2026-01-10",
        imageUrl: "/blog-ethics.png",
        imageAlt: "Imagen del flujo de trabajo de Hipatia: Triple Consenso Pedagógico",
        content: `
            <p class="lead">Si eres docente, conoces ese peso en el estómago al corregir la pila de exámenes número cincuenta de la tarde. El cansancio nubla el juicio, y el "bolígrafo rojo" a veces se vuelve más subjetivo de lo que nos gustaría admitir. Cuando decidimos crear Hipatia, no queríamos simplemente poner una máquina a leer textos; queríamos replicar la sabiduría de un tribunal de expertos que debate, duda y, finalmente, acierta.</p>

            <h2>El problema de la "mente única" en la tecnología</h2>
            <p>Poner una nota no es un proceso lineal. Requiere entender el contexto, valorar el esfuerzo y seguir una rúbrica a rajatabla. La mayoría de las soluciones de inteligencia artificial fallan porque actúan como una "mente única": lo que dicen es la ley. Pero en educación, la ley debe ser la justicia.</p>
            <p>En Hipatia, entendimos rápidamente que confiar en un solo algoritmo era un error. Por eso, diseñamos una arquitectura basada en el <strong>Triple Consenso</strong>, un sistema de pesos y contrapesos que garantiza que ningún alumno sea juzgado por un "error de cálculo" digital.</p>

            <h2>¿Cómo funciona el corazón de Hipatia?</h2>
            <p>Imagina un departamento universitario donde tres profesores revisan el mismo examen. Así es como Hipatia procesa cada entrega:</p>
            
            <ul>
                <li><strong>La Primera Lectura (El Juez):</strong> Un primer motor de análisis desglosa el examen siguiendo la rúbrica que el profesor ha definido. No se salta ni una coma. Su trabajo es puramente técnico y matemático, asegurando que cada criterio de evaluación sea atendido.</li>
                <li><strong>La Auditoría Humana (El Revisor):</strong> Aquí entra la empatía digital. Un segundo motor independiente revisa el trabajo del primero. Su misión es "ponérselo difícil" al Juez. Busca errores de interpretación, valora si una palabra mal escrita por el OCR es realmente un error ortográfico o solo un trazo difícil, y ajusta el tono para que el feedback sea constructivo y no punitivo.</li>
                <li><strong>El Arbitraje Final (El Veredicto):</strong> ¿Qué pasa si los dos anteriores no se ponen de acuerdo? En el mundo real, esto causaría un conflicto. En Hipatia, se activa automáticamente un tercer motor de alta densidad que actúa como árbitro supremo. Analiza los argumentos de ambos y dicta una sentencia basada en la evidencia del texto.</li>
            </ul>

            <h2>Tecnología invisible para un impacto real</h2>
            <p>Lo más bonito de este sistema es que, como profesor, no ves la complejidad técnica de los nodos ni el flujo de datos que viaja por detrás. Lo que recibes es un informe honesto. Un documento que le habla al alumno de "tú a tú", que le explica por qué tiene un 7.5 y no un 8, y que le motiva a mejorar en los puntos específicos donde falló.</p>
            <p>Estamos convencidos de que la tecnología no ha venido a sustituir al profesor, sino a liberarlo de la parte más mecánica para que pueda centrarse en lo que realmente importa: enseñar.</p>
        `
    },
    {
        slug: "privacidad-ia-educacion-anonimizacion-datos",
        title: "Seguridad y Privacidad: El Compromiso Innegociable de Hipatia",
        seoTitle: "Privacidad Blindada: El Protocolo de Ética de Datos en Hipatia",
        excerpt: "¿Cómo garantiza Hipatia la seguridad de los alumnos? Descubre nuestro protocolo de anonimización automática y el tratamiento ético de datos en la calificación con IA.",
        date: "12 Enero, 2026",
        author: "Equipo HIPATIA",
        readTime: "4 min lectura",
        category: "Privacidad y Ética",
        keywords: "Privacidad datos educación, Anonimización IA",
        isoDate: "2026-01-12",
        imageUrl: "/imagen seguridad lopd.webp",
        imageAlt: "Protocolo de Seguridad y LOPD de Hipatia",
        content: `
            <p class="lead">En la era de la educación digital, la privacidad no es una opción, es un derecho fundamental. Mientras muchas herramientas de IA procesan información sin filtros, <strong>Hipatia</strong> ha sido diseñada bajo el principio de <strong>Privacidad por Diseño (Privacy by Design)</strong>. Nuestro sistema asegura que la identidad del alumno permanezca protegida durante todo el ciclo de evaluación.</p>

            <h2>El Escudo de Anonimización Automática</h2>
            <p>Mucho antes de que el examen sea analizado por nuestros motores de evaluación, el sistema activa un <strong>Protocolo de Limpieza de Datos</strong>. Este proceso ocurre a nivel de código interno y es invisible para el usuario, pero crítico para la seguridad.</p>
            <ul>
                <li><strong>Detección de Patrones Sensibles:</strong> El sistema utiliza algoritmos de reconocimiento de patrones para identificar y "borrar" automáticamente correos electrónicos, números de identidad y nombres propios.</li>
                <li><strong>Sustitución Dinámica:</strong> La información sensible se reemplaza por etiquetas genéricas o IDs internos. Esto permite que el sistema evalúe el contenido académico sin conocer la identidad real de la persona detrás del examen.</li>
            </ul>

            <h2>Ética en la Evaluación: Eliminando el Sesgo Humano y Digital</h2>
            <p>La privacidad no solo protege al alumno, también garantiza una <strong>calificación más justa</strong>. Al anonimizar los datos, Hipatia elimina cualquier posibilidad de sesgo consciente o inconsciente.</p>
            <ol>
                <li><strong>Evaluación Ciega:</strong> Los agentes encargados de calificar solo reciben el contenido intelectual del examen.</li>
                <li><strong>Neutralidad de Algoritmos:</strong> Al no tener acceso a metadatos personales, los motores de razonamiento se centran exclusivamente en el cumplimiento de la rúbrica pedagógica.</li>
            </ol>

            <h2>Trazabilidad sin Compromiso</h2>
            <p>¿Cómo devolvemos la nota al alumno correcto si todo es anónimo? La respuesta reside en nuestra arquitectura de <strong>Mapeo de Datos</strong>.</p>
            <p>Utilizamos variables de sistema para "enlazar" el resultado final con el token de usuario original. Este proceso permite que el profesor mantenga el control total del libro de calificaciones en su base de datos privada, sin que la información personal haya salido jamás de su entorno seguro.</p>

            <h2>Cumplimiento de Estándares Internacionales</h2>
            <p>Hipatia ha sido configurada para alinearse con las normativas de protección de datos más exigentes. Al ejecutar procesos en servidores controlados y utilizar flujos de trabajo cerrados, garantizamos que los exámenes manuscritos y las respuestas digitales se procesen bajo estándares de seguridad de nivel empresarial.</p>
        `
    },
    {
        slug: "tecnologia-ocr-caligrafia-examen",
        title: "Del papel al informe: La tecnología que da vida a los exámenes manuscritos",
        seoTitle: "De la tinta al bit: Cómo Hipatia \"entiende\" la caligrafía del alumno",
        excerpt: "Hipatia no obliga a abandonar el papel. Descubre cómo nuestro Motor de Transcripción Académica convierte exámenes manuscritos en análisis de datos precisos sin perder el contexto.",
        date: "14 Enero, 2026",
        author: "Equipo HIPATIA",
        readTime: "5 min lectura",
        category: "Tecnología Educativa",
        keywords: "OCR manuscrito, Digitalización exámenes, Transcripción académica",
        isoDate: "2026-01-14",
        imageUrl: "/Imagen articulo 2.webp",
        imageAlt: "Transformación de texto manuscrito a datos digitales en Hipatia",
        content: `
            <p class="lead">Todos hemos estado ahí: una montaña de hojas de papel, caligrafías difíciles de descifrar y la presión de entregar una retroalimentación útil a tiempo. En el desarrollo de Hipatia, sabíamos que no podíamos pedirles a los alumnos que dejaran de usar papel y bolígrafo; escribir a mano es parte fundamental del proceso cognitivo. Por eso, decidimos crear un puente tecnológico que uniera lo mejor del mundo analógico con la precisión del mundo digital.</p>

            <h2>No es solo leer, es comprender el contexto</h2>
            <p>La mayoría de los sistemas de reconocimiento de texto (OCR) se limitan a convertir imágenes en palabras sueltas. Hipatia va un paso más allá. Cuando un profesor sube la foto de un examen, nuestro sistema no solo identifica letras; activa un <strong>Motor de Transcripción Académica</strong> diseñado para entender el contexto docente.</p>
            <p>Gracias a este proceso, el sistema es capaz de diferenciar entre un tachón, una nota al margen o una respuesta estructurada. Esta "visión inteligente" es el primer eslabón de una cadena que transforma una simple fotografía en datos procesables para la evaluación.</p>

            <h2>La "Magia" detrás de la transformación digital</h2>
            <p>El viaje de un examen en Hipatia es fascinante desde un punto de vista técnico, pero sencillo de entender:</p>
            <ul>
                <li><strong>Captura Inteligente:</strong> El flujo comienza recibiendo las imágenes a través de un canal seguro. Aquí, la tecnología se encarga de "limpiar" la imagen para que la lectura sea perfecta.</li>
                <li><strong>Transcripción Fiel:</strong> Antes de poner una nota, Hipatia actúa como un perito calígrafo. Transcribe cada frase respetando la intención del alumno, sin corregir errores todavía, solo capturando la realidad del papel.</li>
                <li><strong>Conversión a Informe Pedagógico:</strong> Una vez que el texto es digital, la información se procesa y se estructura en un formato visualmente atractivo. El resultado no es un archivo de texto plano, sino un informe HTML dinámico, lleno de gráficos, notas y consejos personalizados.</li>
            </ul>

            <h2>Reduciendo la brecha entre el aula y el dato</h2>
            <p>Lo que antes tomaba horas de transcripción y corrección manual, ahora sucede en segundos. Pero lo más importante no es la velocidad, sino la calidad de la información. Al digitalizar el examen, el profesor obtiene una trazabilidad absoluta: puede ver exactamente qué competencia falló el alumno y por qué, basándose en la evidencia directa de su puño y letra.</p>
            <p>Con Hipatia, el papel ya no es un límite para la analítica educativa. Es el punto de partida para una educación más eficiente, transparente y, sobre todo, justa.</p>
        `
    },
    {
        slug: "generador-examenes-rubricas-ia-personalizable",
        title: "Creatividad bajo control: Cómo Hipatia diseña tu próximo examen",
        seoTitle: "Hipatia: Crea, edita y descarga tus exámenes y rúbricas en segundos",
        excerpt: "Diseña exámenes y rúbricas para cualquier materia con Hipatia. Control total: edita en pantalla y descarga en PDF con un solo clic.",
        date: "16 Enero, 2026",
        author: "Equipo HIPATIA",
        readTime: "5 min lectura",
        category: "Productividad Docente",
        keywords: "Generador de exámenes y rúbricas con IA",
        isoDate: "2026-01-16",
        imageUrl: "/imagen articulo 4.webp",
        imageAlt: "Interfaz de generación de exámenes y rúbricas en Hipatia",
        content: `
            <p class="lead">La labor docente tiene un componente creativo agotador: diseñar el examen perfecto y la rúbrica que lo mida con justicia. Muchas veces, pasamos horas frente a una hoja en blanco intentando equilibrar la dificultad y los objetivos de aprendizaje. Hipatia ha sido diseñada para ser tu "asistente de taller", permitiéndote generar materiales de alta calidad para cualquier materia, desde física cuántica hasta literatura contemporánea, en cuestión de segundos.</p>

            <h2>Exámenes y rúbricas a la medida de tu aula</h2>
            <p>No creemos en las soluciones "enlatadas". Cada grupo de alumnos es un mundo, y Hipatia lo sabe. Nuestro módulo de generación permite:</p>
            <ul>
                <li><strong>Adaptación Total:</strong> Tú defines el tema, el nivel de dificultad y el tipo de preguntas. El sistema utiliza algoritmos avanzados para proponer una estructura coherente.</li>
                <li><strong>Rúbricas Semánticas:</strong> Olvídate de pelearte con tablas de Excel. Hipatia genera rúbricas detalladas que vinculan cada pregunta con competencias específicas, asegurando una evaluación transparente.</li>
                <li><strong>Edición en Tiempo Real:</strong> Nada de lo que genera la IA es definitivo. Todo el contenido aparece en tu pantalla de forma editable. ¿Quieres cambiar una pregunta? ¿Ajustar un porcentaje de la rúbrica? Puedes hacerlo directamente antes de confirmar.</li>
            </ul>

            <h2>La soberanía del papel: Edita y descarga con un clic</h2>
            <p>Sabemos que, al final del día, el aula sigue siendo un espacio físico. Por eso, Hipatia facilita la transición del mundo digital al real. Tanto los exámenes como las rúbricas que generes pueden descargarse instantáneamente. Esto te permite tener una copia física lista para imprimir o compartir en tu plataforma de aprendizaje preferida.</p>

            <h2>El Informe de Calificación: Tu nuevo aliado en las tutorías</h2>
            <p>Una de las joyas de la corona de Hipatia es el Informe de Calificación. Tras el proceso de evaluación, el sistema genera un documento estructurado que es mucho más que una nota.</p>
            <ul>
                <li><strong>Interactividad Total:</strong> El informe se presenta en pantalla y es editable. Si como profesor consideras que un matiz merece una nota distinta o quieres personalizar un comentario de retroalimentación, puedes hacerlo allí mismo antes de entregarlo.</li>
                <li><strong>Profesionalismo en PDF:</strong> Una vez que el informe es perfecto, puedes descargarlo en formato PDF. Es un documento elegante, profesional y detallado, ideal para entregar a alumnos y familias en reuniones de tutoría o para el expediente académico.</li>
            </ul>

            <h2>Conclusión: Tú tienes el control, nosotros la tecnología</h2>
            <p>En Hipatia, la tecnología nunca sustituye tu criterio; lo potencia. Al automatizar la generación de borradores y la estructura de los informes, te devolvemos el tiempo que necesitas para lo más importante: la interacción directa con tus alumnos. Con Hipatia, diseñas, corriges y comunicas con una eficiencia y profesionalismo sin precedentes.</p>
        `
    },
    {
        slug: "justificacion-reclamaciones-notas-ia-objetiva",
        title: "Informes Blindados: Cómo Hipatia justifica cada décima ante una reclamación",
        seoTitle: "Hipatia: Informes blindados para justificar notas ante reclamaciones",
        excerpt: "¿Cansado de justificar notas? Descubre cómo los informes de Hipatia actúan como un escudo ante reclamaciones, basándose en rúbricas objetivas y datos técnicos.",
        date: "20 Enero, 2026",
        author: "Equipo HIPATIA",
        readTime: "7 min lectura",
        category: "Derecho Educativo",
        keywords: "Justificación de notas, reclamaciones exámenes, IA educación",
        isoDate: "2026-01-20",
        imageUrl: "/imagen articulo 5.webp",
        imageAlt: "Protocolo de generación de informes blindados en Hipatia",
        content: `
            <p>La evaluación es, sin duda, uno de los momentos más estresantes de la labor docente. No solo por la carga de trabajo que supone corregir decenas de exámenes, sino por el "segundo examen" que viene después: <strong>las tutorías con familias y las posibles reclamaciones de notas.</strong></p>

            <p>¿Cuántas veces has pasado horas redactando una justificación para explicar por qué un alumno tiene un 6.5 y no un 7? Con <strong>Hipatia</strong>, ese tiempo vuelve a ser tuyo.</p>

            <hr class="my-8" />

            <h2>Más allá del número: Feedback con profundidad pedagógica</h2>

            <p>El gran error de muchas herramientas de IA es entregar resultados fríos. Hipatia ha sido diseñada bajo un principio de <strong>asistente pedagógico</strong>. Cuando el sistema procesa un examen, no se limita a calcular un porcentaje; analiza las evidencias de aprendizaje.</p>

            <ul>
                <li><strong>Feedback Constructivo:</strong> El informe detalla los puntos fuertes y las áreas de mejora con un tono alentador y profesional.</li>
                <li><strong>Análisis por Competencias:</strong> El alumno entiende exactamente en qué fase del aprendizaje se encuentra.</li>
                <li><strong>Claridad para las Familias:</strong> Se eliminan las ambigüedades. El padre o madre recibe un documento detallado que habla el lenguaje de la mejora, no solo del castigo del error.</li>
            </ul>

            <hr class="my-8" />

            <h2>El "Escudo Jurídico": Conexión total con la Rúbrica</h2>

            <p>La verdadera potencia de Hipatia reside en su <strong>objetividad inquebrantable</strong>. El sistema no emite juicios de valor; aplica las reglas que tú, como docente, has establecido en la rúbrica.</p>

            <blockquote>
                <strong>El Principio de Trazabilidad:</strong> Cada comentario del informe final está vinculado a un criterio de evaluación específico. Si la rúbrica indica que para alcanzar el "Sobresaliente" se requiere una "argumentación crítica original" y el alumno ha realizado una "descripción literal", Hipatia lo señalará citando la norma.
            </blockquote>

            <h3>¿Cómo te protege ante una reclamación?</h3>

            <table border="1" style="width:100%; border-collapse: collapse; text-align: left; margin-top: 1rem; margin-bottom: 1rem;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 10px;">Situación Común</th>
                        <th style="padding: 10px;">Respuesta con Hipatia</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 10px;">"¿Por qué mi hijo tiene esta nota?"</td>
                        <td style="padding: 10px;">El informe desglosa la nota punto por punto según los criterios de la rúbrica oficial.</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">"Es que el profesor le tiene manía"</td>
                        <td style="padding: 10px;">La evaluación ha sido auditada por tres modelos de IA independientes (Triple Consenso) basados en evidencias ciegas.</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;">"No entiendo qué tiene que mejorar"</td>
                        <td style="padding: 10px;">El informe incluye una hoja de ruta específica para que el alumno alcance el siguiente nivel de desempeño.</td>
                    </tr>
                </tbody>
            </table>

            <hr class="my-8" />

            <h2>Calidad garantizada por el Triple Consenso</h2>

            <p>Para asegurar que cada informe sea una pieza de "artesanía administrativa", Hipatia utiliza su arquitectura de tres niveles:</p>

            <ol>
                <li><strong>El Juez:</strong> Evalúa el contenido bruto del examen.</li>
                <li><strong>El Auditor:</strong> Verifica que la evaluación se ajusta estrictamente a la rúbrica proporcionada.</li>
                <li><strong>El Tribunal Supremo:</strong> Redacta el informe final asegurando que el tono sea pedagógico y que cada décima esté justificada legalmente.</li>
            </ol>

            <p>Con Hipatia, no solo corriges más rápido: corriges mejor, con más seguridad y con la tranquilidad de que tu labor docente está protegida por datos objetivos.</p>

            <hr class="my-8" />

            <h2>🎓 Ejemplo de Informe: "El examen de Historia"</h2>

            <p>Imagina un examen de <strong>Historia de 4º de ESO</strong> sobre la Revolución Industrial. El alumno ha sacado un <strong>6.25</strong>. Así es como Hipatia presenta la información:</p>

            <div style="background-color: #f9f9f9; padding: 20px; border-left: 5px solid #007bff; margin-top: 20px; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #007bff;">Informe de Evaluación: Hipatia</h3>
                <p style="font-size: 0.9em; color: #555;"><strong>Asignatura:</strong> Geografía e Historia | <strong>Fecha:</strong> 10/01/2026<br>
                <strong>Alumno:</strong> [ID_ANON_8842] | <strong>Calificación Final:</strong> 6.25 / 10</p>

                <h4 style="margin-top: 20px; border-bottom: 2px solid #e9ecef; padding-bottom: 5px;">🛡️ Justificación Técnica (Uso Docente/Familias)</h4>
                <div style="overflow-x: auto;">
                    <table border="1" style="width:100%; border-collapse: collapse; text-align: left; background-color: white; font-size: 0.9em;">
                        <thead>
                            <tr style="background-color: #e9ecef;">
                                <th style="padding: 8px;">Criterio de Evaluación</th>
                                <th style="padding: 8px;">Nivel</th>
                                <th style="padding: 8px;">Nota</th>
                                <th style="padding: 8px;">Evidencia Detectada (Cita Textual)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 8px;">1. Precisión Histórica</td>
                                <td style="padding: 8px; color: #28a745; font-weight: bold;">Avanzado</td>
                                <td style="padding: 8px; font-weight: bold;">8.5</td>
                                <td style="padding: 8px; font-style: italic;">"Menciona correctamente la ley de cercamientos y la máquina de Watt."</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;">2. Relación Causa-Efecto</td>
                                <td style="padding: 8px; color: #fd7e14; font-weight: bold;">Intermedio</td>
                                <td style="padding: 8px; font-weight: bold;">5.0</td>
                                <td style="padding: 8px; font-style: italic;">"Relaciona población e industria, pero falta el capital financiero."</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;">3. Vocabulario Técnico</td>
                                <td style="padding: 8px; color: #dc3545; font-weight: bold;">Inicial</td>
                                <td style="padding: 8px; font-weight: bold;">4.0</td>
                                <td style="padding: 8px; font-style: italic;">"Usa 'fábricas grandes' en lugar de 'sistema de producción fabril'."</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;">4. Ortografía</td>
                                <td style="padding: 8px; color: #28a745; font-weight: bold;">Excelente</td>
                                <td style="padding: 8px; font-weight: bold;">10</td>
                                <td style="padding: 8px; font-style: italic;">"Texto fluido, sin errores detectados por el motor OCR."</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h4 style="margin-top: 20px; border-bottom: 2px solid #e9ecef; padding-bottom: 5px;">📝 Análisis del "Tribunal Supremo"</h4>
                <p style="background-color: white; padding: 10px; border-left: 3px solid #6c757d; font-style: italic;">"La calificación de 6.25 se fundamenta en un dominio sólido de los hechos cronológicos (Criterio 1), pero se observa una falta de profundidad en el análisis multicausal (Criterio 2). Aunque el alumno identifica los inventos, no logra explicar la transición al sistema industrial de forma técnica (Criterio 3), justificando la nota en el bloque de competencias."</p>

                <h4 style="margin-top: 20px; border-bottom: 2px solid #e9ecef; padding-bottom: 5px;">💡 Feedback Pedagógico (Para el Alumno)</h4>
                <ul style="margin-bottom: 0;">
                    <li><strong>Enriquece tu lenguaje:</strong> En lugar de decir "había más gente", utiliza "crecimiento demográfico sostenido".</li>
                    <li><strong>Conecta los puntos:</strong> Intenta explicar por qué el dinero del comercio colonial fue clave para las fábricas.</li>
                </ul>
            </div>

            <hr class="my-8" />

            <h3>🔬 Por qué este informe te ahorra problemas:</h3>
            <ul>
                <li><strong>Es irrefutable:</strong> Si un padre reclama, le muestras la columna de "Evidencia Detectada".</li>
                <li><strong>Es constructivo:</strong> El alumno se queda con una hoja de ruta para mejorar.</li>
                <li><strong>Ahorro de tiempo:</strong> Hipatia redacta esto en segundos tras escanear el papel.</li>
            </ul>
        `
    }
];


