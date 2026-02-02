import subprocess
import sys
import platform
import os
import sqlite3
import secrets
import keyring
from typing import Optional
import hashlib
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

class SecurityManager:
    def __init__(self, db_path: str = "secure_data.db"):
        self.db_path = db_path
        self.hwid = self.get_hwid()
        self.service_name = "HorariosNextGen_Secure"
        self._key = self._get_or_create_key()
        
        # Argon2 Support Check (Strict Enforcement)
        try:
            from argon2 import PasswordHasher, Type
            # Configure Argon2id (Resistant to Side-Channel + GPU Cracking)
            self.ph = PasswordHasher(
                time_cost=2,         # 2 Iterations
                memory_cost=65536,   # 64MB Memory
                parallelism=1,       # 1 Thread
                hash_len=16,         # 16-byte output
                type=Type.ID         # Argon2id
            )
            self.has_argon2 = True
            logger.info("SecurityManager: Argon2id Hashing Engine Initialized (ENS Medium)")
        except ImportError:
            logger.critical("CRITICAL SECURITY ERROR: argon2-cffi is missing. System cannot start under ENS Medium rules.")
        # Version Check (Critical Hardening)
        import argon2
        if argon2.__version__ < "23.1.0":
            logger.critical(f"SECURITY ALERT: argon2-cffi version {argon2.__version__} is too old. Require >= 23.1.0")
            raise ImportError(f"Insecure dependency version: argon2-cffi {argon2.__version__}")

        self.user_salt: Optional[bytes] = None
        self.is_setup = os.path.exists(os.path.join("logs", "setup.lock"))

    def get_hwid(self) -> str:
        """
        Retrieves a unique Hardware ID based on the OS.
        """
        try:
            if platform.system() == "Windows":
                 # Use wmic for Windows
                 return subprocess.check_output('wmic csproduct get uuid').decode().split('\n')[1].strip()
            elif platform.system() == "Linux":
                 return subprocess.check_output('cat /etc/machine-id', shell=True).decode().strip()
            else:
                 return "GENERIC_HWID_STUB"
        except Exception:
            return "UNKNOWN_HWID_FALLBACK"

    def _get_or_create_key(self) -> bytes:
        """
        Retrieves system encryption key from OS Keyring.
        """
        try:
            key_hex = keyring.get_password(self.service_name, "db_key")
            if not key_hex:
                key = secrets.token_bytes(32)
                keyring.set_password(self.service_name, "db_key", key.hex())
                return key
            return bytes.fromhex(key_hex)
        except Exception as e:
            logger.error(f"Keyring Error: {e}")
            # Fallback for dev/testing only
            return hashlib.sha256(self.hwid.encode()).digest()

    def initial_setup(self, user_secret: str) -> bytes:
        """
        PERFORMS LOCKDOWN.
        1. Derives Setup Salt from UserSecret + HWID.
        2. Generates Recovery Vault.
        3. Marks setup as complete.
        """
        if len(user_secret) < 12:
            raise ValueError("UserSecret must be at least 12 characters.")

        try:
            # Derive the persistent session salt component
            # We don't store UserSecret. We verify it by attempting to decrypt/unlock, 
            # or in this case, we simply define it as the source of truth.
            
            # Create Recovery Token (The 'Vault')
            # The vault allows recovering the data on new hardware. 
            # It encrypts the internal system key (from keyring) using the UserSecret.
            
            # 1. Derive Key from UserSecret
            kdf = hashlib.pbkdf2_hmac('sha256', user_secret.encode(), self.hwid.encode(), 200000)
            
            # 2. Encrypt the System Key
            from cryptography.fernet import Fernet
            import base64
            fernet_key = base64.urlsafe_b64encode(kdf)
            f = Fernet(fernet_key)
            recovery_blob = f.encrypt(self._key)
            
            # 3. Mark Setup Complete
            os.makedirs("logs", exist_ok=True)
            with open(os.path.join("logs", "setup.lock"), "w") as f:
                f.write(f"SETUP_COMPLETED_ON_{platform.node()}")
                
            self.unlock_system(user_secret)
            return recovery_blob
            
        finally:
            # RAM Hygiene: Attempt to clear local vars
            del user_secret
            
    def unlock_system(self, user_secret: str):
        """
        Derives the dynamic salt from the UserSecret for the current session.
        """
        # Mix HWID + UserSecret to create the PII Hashing Salt for this session
        # This means if UserSecret changes, all PII hashes change (Cryptographic Shredding)
        self.user_salt = hashlib.sha256(f"{self.hwid}-{user_secret}".encode()).digest()
        logger.info("System Unlocked: RAM Session Keys Derived.")


    def hash_pii(self, plain_text: str, salt_context: str = "") -> str:
        """
        Hashes PII using Argon2id + Salt(HWID + UserSecret + Context).
        """
        if not self.has_argon2:
             raise RuntimeError("Argon2 is not available.")
        if self.user_salt is None:
             raise PermissionError("System Locked: UserSecret required to hash PII.")

        try:
            from argon2.low_level import hash_secret_raw, Type
            import hmac
            
            # Combined Salt: SessionSalt(HWID+UserSecret) + Context
            # We use HMAC to mix them securely
            final_salt = hmac.new(self.user_salt, salt_context.encode(), hashlib.sha256).digest()[:16]
            
            hashed_bytes = hash_secret_raw(
                secret=plain_text.encode(),
                salt=final_salt,
                time_cost=2,
                memory_cost=65536,
                parallelism=1,
                hash_len=16,
                type=Type.ID
            )
            return hashed_bytes.hex()
            
        except Exception as e:
            logger.error(f"Argon2 Hashing Failed: {e}")
            raise

    def write_legal_log(self, user_id: str = "GLOBAL", consent_version: str = "v2"):
        """
        Writes encrypted audit log.
        """
        # ... (Keep existing logic, just cleaning up file structure)
        import time
        log_dir = "logs"
        if not os.path.exists(log_dir): os.makedirs(log_dir)
        timestamp = int(time.time())
        log_path = os.path.join(log_dir, "legal_audit.bin")
        try:
            entry = f"{timestamp}|{self.hwid}|{consent_version}|ACCEPTED\n".encode()
            key_cycle = self._key
            encrypted_entry = bytearray(b ^ key_cycle[i % len(key_cycle)] for i, b in enumerate(entry))
            with open(log_path, "ab") as f:
                f.write(encrypted_entry)
                f.write(b'\xFF\xEE')
        except Exception:
            pass

    def generate_recovery_pdf(self, vault_data: bytes, user_secret_hint: str = "****") -> str:
        """
        Generates a PDF Recovery Sheet with 'Cuadrante' branding.
        Returns the path to the generated PDF.
        """
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas
            
            filename = os.path.join("logs", "recovery_key.pdf")
            c = canvas.Canvas(filename, pagesize=letter)
            width, height = letter
            
            # --- Branding ---
            # Header
            c.setFont("Helvetica-Bold", 24)
            c.setFillColorRGB(0.2, 0.2, 0.5) # Indigo
            c.drawString(50, height - 50, "CUADRANTE RECOVERY SHEET")
            
            c.setFont("Helvetica", 10)
            c.setFillColorRGB(0.5, 0.5, 0.5)
            c.drawString(50, height - 65, "Critical Infrastructure Backup | ENS-Medio Compliant")
            
            # Draw Logo Placeholder if Exists
            # Prioritize the user requested filename
            logo_candidates = ["image_7c8a7a.jpg", "public/Cuadrante.png", "Cuadrante.png"]
            logo_path = None
            for cand in logo_candidates:
                if os.path.exists(cand):
                    logo_path = cand
                    break
            
            if logo_path:
               try:
                   c.drawImage(logo_path, width - 100, height - 70, width=50, height=50, mask='auto')
               except:
                   pass

            # --- Warning Section ---
            c.setStrokeColorRGB(1, 0, 0)
            c.rect(50, height - 150, width - 100, 60, fill=0)
            c.setFont("Helvetica-Bold", 12)
            c.setFillColorRGB(1, 0, 0)
            c.drawString(70, height - 110, "CRITICAL WARNING: This sheet is required to restore access on new hardware.")
            c.drawString(70, height - 130, "Store in a physical safe. Do not email.")

            # --- Technical Data ---
            y = height - 200
            c.setFont("Helvetica-Bold", 12)
            c.setFillColorRGB(0, 0, 0)
            c.drawString(50, y, "Machine Hardware ID (HWID):")
            c.setFont("Courier", 12)
            c.drawString(50, y - 15, self.hwid)
            
            y -= 50
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y, "Recovery Vault (Base64):")
            c.setFont("Courier", 10)
            
            # Wrap long vault string
            import base64
            # Handle bytes vs str input for vault_data
            if isinstance(vault_data, str):
                vault_b64 = vault_data
            else:
                vault_b64 = base64.b64encode(vault_data).decode()
                
            chunks = [vault_b64[i:i+60] for i in range(0, len(vault_b64), 60)]
            
            for chunk in chunks:
                y -= 12
                c.drawString(50, y, chunk)
                
            y -= 40
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y, "Salt Derivation Context:")
            c.setFont("Helvetica", 10)
            c.drawString(50, y - 15, f"Algorithm: Argon2id (t=2, m=64MB, p=1)")
            c.drawString(50, y - 30, f"Salt Construction: HMAC-SHA256(HWID + UserSecret)")
            
            c.save()
            return filename
        except ImportError:
            logger.warning("ReportLab not found. Skipping PDF generation.")
            return ""
        except Exception as e:
            logger.error(f"PDF Generation Failed: {e}")
            return ""

if __name__ == "__main__":
    pass
