# 📋 INSTRUCCIONES PARA PRESENTAR EL PROYECTO

## ✅ OPCIÓN 1: DESPLEGAR EN NETLIFY (RECOMENDADO - MÁS PROFESIONAL)

### Ventajas:
- ✅ Accesible desde cualquier navegador con internet
- ✅ URL profesional (ej: `parce-asistencia.netlify.app`)
- ✅ No requiere instalar NADA en el computador de presentación
- ✅ Funciona en cualquier dispositivo (PC, tablet, móvil)
- ✅ Gratis

### Pasos:

1. **Crear cuenta en Netlify (gratis):**
   - Ir a: https://www.netlify.com/
   - Hacer clic en "Sign up" (registrarse con GitHub, GitLab o email)

2. **Subir el proyecto:**
   - Opción A: Arrastrar la carpeta `dist/` a Netlify (drag & drop)
   - Opción B: Conectar con GitHub y Netlify hará deploy automático

3. **Configurar variables de entorno (importante para el chatbot):**
   - En Netlify Dashboard → Site settings → Environment variables
   - Agregar: `VITE_GROQ_API_KEY` con tu API key de Groq

4. **Listo!** Netlify te dará una URL como: `https://parce-asistencia.netlify.app`

---

## ✅ OPCIÓN 2: PRESENTAR LOCALMENTE (Sin Node.js)

### Requisitos:
- Carpeta `dist/` compilada (ya la tienes después de hacer `npm run build`)
- Un servidor HTTP simple

### Pasos:

#### **A) Si tienen Python instalado:**
```bash
# Abrir terminal en la carpeta dist/
cd dist
python -m http.server 8000
```
Abrir navegador: `http://localhost:8000`

#### **B) Usar http-server portable:**
1. Descargar: https://github.com/http-party/http-server
2. Descomprimir en la carpeta del proyecto
3. Ejecutar: `http-server dist -p 8000`
4. Abrir navegador: `http://localhost:8000`

#### **C) Usar Laragon portable (Windows):**
1. Descargar: https://laragon.org/download/
2. Copiar carpeta `dist/` a `laragon/www/`
3. Iniciar Laragon
4. Abrir navegador: `http://localhost/dist`

---

## 📁 ARCHIVOS A LLEVAR EN USB (si presentas localmente)

```
USB/
├── dist/                    ← Carpeta completa compilada
├── INSTRUCCIONES_PRESENTACION.md  ← Este archivo
└── (opcional) http-server portable
```

---

## 🔑 IMPORTANTE: API KEY DE GROQ (para el chatbot)

El chatbot requiere una API key de Groq. Tienes 2 opciones:

### Opción 1: API Key en el código (SOLO PARA DEMO)
Ya está incluida en el build de `dist/`

### Opción 2: Variables de entorno (RECOMENDADO para producción)
Crear archivo `.env` con:
```
VITE_GROQ_API_KEY=tu_api_key_aqui
```

---

## 🚀 RECOMENDACIÓN FINAL

**Para presentación profesional:** Usa Netlify (Opción 1)
- ✅ No dependes de instalaciones
- ✅ Funciona siempre
- ✅ Más impresionante
- ✅ Puedes mostrar en proyector desde cualquier navegador

**Para demo offline:** Usa Python o http-server (Opción 2)
- Solo si no tienes internet garantizado
- Requiere preparar el entorno antes

---

## 📞 CONTACTO Y SOPORTE

Si tienes problemas durante la presentación:
1. Verifica que estés en la carpeta `dist/`
2. Verifica que el puerto 8000 no esté ocupado
3. Prueba con otro puerto: `python -m http.server 9000`

---

## ✨ FUNCIONALIDADES A DEMOSTRAR

1. **Landing Page:** Página de inicio pública
2. **Login + Selección de rol:** Admin, Usuario, Mecánico
3. **Usuario:**
   - Home autenticado
   - Catálogo de servicios
   - Chatbot de diagnóstico con IA (Groq)
   - Servicio en progreso (simulación de mecánico en camino)
4. **Mecánico:**
   - Dashboard de solicitudes
   - Perfil del mecánico
5. **Admin:**
   - Panel de administración
   - CRUD de datos

---

**¡Éxito en tu presentación! 🚗💨**
