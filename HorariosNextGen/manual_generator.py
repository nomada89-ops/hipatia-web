from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import red, black, navy
import os

def generate_manual():
    print("Generating Sovereignty Manual...")
    filename = "Manual_Cuadrante.pdf"
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4
    
    # --- Cover Page ---
    
    # Logo
    logo_path = "image_7c8a7a.jpg"
    if not os.path.exists(logo_path):
        if os.path.exists("public/Cuadrante.png"): logo_path = "public/Cuadrante.png"
    
    if os.path.exists(logo_path):
        try:
            c.drawImage(logo_path, width/2 - 50, height - 150, width=100, height=100, mask='auto', preserveAspectRatio=True)
        except: pass

    # Title
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(width/2, height - 200, "CUADRANTE")
    
    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2, height - 230, "Manual de Soberanía Digital y Recuperación")
    
    # --- CRITICAL WARNING (Art 32 RGPD) ---
    c.setStrokeColor(red)
    c.setLineWidth(3)
    c.rect(50, height/2 - 50, width - 100, 150, fill=0)
    
    c.setFillColor(red)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width/2, height/2 + 60, "ADVERTENCIA: SOBERANÍA DE DATOS")
    
    c.setFillColor(black)
    c.setFont("Helvetica", 11)
    
    text_lines = [
        "Este sistema NO ALMACENA su clave maestra en ningún servidor.",
        "Si pierde su UserSecret o su Recovery Key (Bóveda), sus datos se volverán",
        "BASURA DIGITAL IRRECUPERABLE conforme al Art. 32 del RGPD.",
        "",
        "Usted es el único custodio de su acceso. Cuadrante no tiene 'puerta trasera'."
    ]
    
    y = height/2 + 20
    for line in text_lines:
        c.drawCentredString(width/2, y, line)
        y -= 20
        
    c.save()
    print(f"✅ Manual Generated: {filename}")

if __name__ == "__main__":
    generate_manual()
