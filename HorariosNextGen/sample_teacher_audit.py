import re

file_path = r"c:\Users\Rafa\Next.js Application\HorariosNextGen\ExportacionHorarios-45010387-2026-01-28-16-35-31.xml"

def find_sample_teacher():
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        content = f.read()
        
        # 1. Find the Tutoria ESO Task ID
        tutoria_eso_match = re.search(r'<listasal seq="TAREAS_.*?">.*?<salida dato="CLAVE">(.*?)</salida>.*?<salida dato="NOMBRE">LDD - Tutoría de ESO</salida>.*?</listasal>', content, re.DOTALL)
        if not tutoria_eso_match:
            print("Tutoria ESO task not found")
            return
        tutoria_id = tutoria_eso_match.group(1)
        print(f"Tutoria ESO Task ID: {tutoria_id}")
        
        # 2. Find an activity with this task
        activity_match = re.search(rf'<listasal seq="ACTIVIDADES_.*?">.*?<salida dato="CLAVE">(.*?)</salida>.*?<salida dato="TAREA">{tutoria_id}</salida>.*?</listasal>', content, re.DOTALL)
        if not activity_match:
            print("Activity with Tutoria ESO not found")
            return
        activity_id = activity_match.group(1)
        print(f"Activity ID with Tutoria: {activity_id}")
        
        # 3. Find a teacher assigned to this activity
        # Some XMLs have ACTIVIDADES_PROFESOR or similar. Let's find who does this activity.
        prof_act_match = re.search(rf'<listasal seq="PROFESORES_ACTIVIDAD.*?">.*?<salida dato="PROFESOR">(.*?)</salida>.*?<salida dato="ACTIVIDAD">{activity_id}</salida>.*?</listasal>', content, re.DOTALL)
        if not prof_act_match:
            # Try alternate sequence name
            prof_act_match = re.search(rf'<listasal seq="ACTIVIDADES_PROFESOR.*?">.*?<salida dato="PROFESOR">(.*?)</salida>.*?<salida dato="ACTIVIDAD">{activity_id}</salida>.*?</listasal>', content, re.DOTALL)
            
        if not prof_act_match:
            print("Teacher for this activity not found")
            return
            
        prof_id = prof_act_match.group(1)
        print(f"Teacher ID: {prof_id}")
        
        # 4. Find Teacher Name
        teacher_match = re.search(rf'<listasal seq="PROFESORES_.*?">.*?<salida dato="CLAVE">{prof_id}</salida>.*?<salida dato="NOMBRE">(.*?)</salida>.*?</listasal>', content, re.DOTALL)
        teacher_name = teacher_match.group(1) if teacher_match else "Unknown"
        print(f"Teacher Name: {teacher_name}")
        
        # 5. List all activities for this teacher
        all_acts_for_prof = re.findall(rf'<listasal seq="(?:PROFESORES_ACTIVIDAD|ACTIVIDADES_PROFESOR).*?">.*?<salida dato="PROFESOR">{prof_id}</salida>.*?<salida dato="ACTIVIDAD">(.*?)</salida>.*?</listasal>', content, re.DOTALL)
        
        print("\n--- CLM CLASSIFICATION AUDIT ---")
        for act_id in all_acts_for_prof:
            # Find the activity details
            act_details = re.search(rf'<listasal seq="ACTIVIDADES_.*?">.*?<salida dato="CLAVE">{act_id}</salida>(.*?)</listasal>', content, re.DOTALL)
            if not act_details: continue
            
            details = act_details.group(1)
            materia_id = re.search(r'<salida dato="MATERIA">(.*?)</salida>', details)
            tarea_id = re.search(r'<salida dato="TAREA">(.*?)</salida>', details)
            
            if materia_id:
                m_id = materia_id.group(1)
                m_info = re.search(rf'<listasal seq="MATERIAS_.*?">.*?<salida dato="CLAVE">{m_id}</salida>.*?<salida dato="NOMBRE">(.*?)</salida>.*?</listasal>', content, re.DOTALL)
                m_name = m_info.group(1) if m_info else "Unknown Subject"
                print(f"[LECTIVA_PURA] {m_name}")
            elif tarea_id:
                t_id = tarea_id.group(1)
                t_info = re.search(rf'<listasal seq="TAREAS_.*?">.*?<salida dato="CLAVE">{t_id}</salida>.*?<salida dato="NOMBRE">(.*?)</salida>.*?</listasal>', content, re.DOTALL)
                t_name = t_info.group(1) if t_info else "Unknown Task"
                
                if "Tutoría de ESO" in t_name:
                    print(f"[TUTORIA_ESO] {t_name} (Requires 2 periods logic)")
                elif any(x in t_name for x in ["Coordinación", "Erasmus", "eTwinning", "Lectura", "Biblioteca", "Responsable"]):
                    print(f"[BOLSA_COORDINACION] {t_name}")
                else:
                    print(f"[OTRA_TAREA] {t_name}")

find_sample_teacher()
