const DATA = {
  "slug": "mueblecasa",
  "nombre": "MuebleCasa",
  "productos": [
    {
      "id": "MC-01",
      "nombre": "Sofá dos plazas",
      "categoria": "Sala",
      "precio": 460.00,
      "dimensiones": "165 × 85 × 82 cm",
      "anchoCm": 165,
      "material": "Madera de pino y tela lino",
      "acabado": "Mate natural beige",
      "espacioRecomendado": "Requiere al menos 210 cm de frente libre para circulación cómoda.",
      "svg": `<svg viewBox="0 0 80 80" width="60" height="60" aria-hidden="true">
        <rect x="14" y="24" width="52" height="22" rx="6" fill="#C9A882" stroke="#5C3A21" stroke-width="2"/>
        <rect x="10" y="34" width="60" height="18" rx="5" fill="#DFC3A0" stroke="#5C3A21" stroke-width="2"/>
        <line x1="18" y1="52" x2="18" y2="60" stroke="#5C3A21" stroke-width="3" stroke-linecap="round"/>
        <line x1="62" y1="52" x2="62" y2="60" stroke="#5C3A21" stroke-width="3" stroke-linecap="round"/>
      </svg>`
    },
    {
      "id": "MC-02",
      "nombre": "Mesa comedor",
      "categoria": "Comedor",
      "precio": 390.00,
      "dimensiones": "180 × 90 × 75 cm",
      "anchoCm": 180,
      "material": "Roble macizo",
      "acabado": "Barniz satinado nogal",
      "espacioRecomendado": "Ideal para 6 puestos; dejar 80 cm alrededor para retirar sillas.",
      "svg": `<svg viewBox="0 0 80 80" width="60" height="60" aria-hidden="true">
        <rect x="10" y="28" width="60" height="8" rx="3" fill="#8B5A2B" stroke="#4A2C16" stroke-width="2"/>
        <line x1="18" y1="36" x2="14" y2="60" stroke="#4A2C16" stroke-width="3" stroke-linecap="round"/>
        <line x1="62" y1="36" x2="66" y2="60" stroke="#4A2C16" stroke-width="3" stroke-linecap="round"/>
        <line x1="26" y1="36" x2="24" y2="54" stroke="#6B4423" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="54" y1="36" x2="56" y2="54" stroke="#6B4423" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      "id": "MC-03",
      "nombre": "Silla madera",
      "categoria": "Comedor",
      "precio": 78.00,
      "dimensiones": "46 × 52 × 88 cm",
      "anchoCm": 46,
      "material": "Madera de haya",
      "acabado": "Lacado mate natural",
      "espacioRecomendado": "Compatible con mesas de 74 a 78 cm de altura.",
      "svg": `<svg viewBox="0 0 80 80" width="60" height="60" aria-hidden="true">
        <rect x="26" y="16" width="28" height="22" rx="4" fill="#D4B48C" stroke="#5C3A21" stroke-width="2"/>
        <rect x="24" y="38" width="32" height="7" rx="3" fill="#B8926A" stroke="#5C3A21" stroke-width="2"/>
        <line x1="27" y1="45" x2="25" y2="64" stroke="#5C3A21" stroke-width="3" stroke-linecap="round"/>
        <line x1="53" y1="45" x2="55" y2="64" stroke="#5C3A21" stroke-width="3" stroke-linecap="round"/>
      </svg>`
    },
    {
      "id": "MC-04",
      "nombre": "Escritorio",
      "categoria": "Estudio",
      "precio": 180.00,
      "dimensiones": "120 × 60 × 75 cm",
      "anchoCm": 120,
      "material": "Tablero melamínico y acero",
      "acabado": "Texturizado roble y negro mate",
      "espacioRecomendado": "Adecuado para dormitorios o estudios compactos (mínimo 140 cm de pared).",
      "svg": `<svg viewBox="0 0 80 80" width="60" height="60" aria-hidden="true">
        <rect x="12" y="28" width="56" height="7" rx="2" fill="#B98B5E" stroke="#374151" stroke-width="2"/>
        <rect x="46" y="35" width="18" height="16" rx="2" fill="#E5E7EB" stroke="#374151" stroke-width="2"/>
        <line x1="16" y1="35" x2="16" y2="60" stroke="#1F2937" stroke-width="3" stroke-linecap="round"/>
        <line x1="64" y1="35" x2="64" y2="60" stroke="#1F2937" stroke-width="3" stroke-linecap="round"/>
      </svg>`
    },
    {
      "id": "MC-05",
      "nombre": "Estantería",
      "categoria": "Organización",
      "precio": 135.00,
      "dimensiones": "80 × 32 × 175 cm",
      "anchoCm": 80,
      "material": "MDF reforzado y pino",
      "acabado": "Semi-mate blanco y madera",
      "espacioRecomendado": "Fondo estrecho de 32 cm apto para pasillos o salas pequeñas.",
      "svg": `<svg viewBox="0 0 80 80" width="60" height="60" aria-hidden="true">
        <rect x="22" y="14" width="36" height="52" rx="3" fill="#F3EFEA" stroke="#5C3A21" stroke-width="2.5"/>
        <line x1="22" y1="27" x2="58" y2="27" stroke="#5C3A21" stroke-width="2.5"/>
        <line x1="22" y1="40" x2="58" y2="40" stroke="#5C3A21" stroke-width="2.5"/>
        <line x1="22" y1="53" x2="58" y2="53" stroke="#5C3A21" stroke-width="2.5"/>
      </svg>`
    },
    {
      "id": "MC-06",
      "nombre": "Mesa auxiliar",
      "categoria": "Sala",
      "precio": 64.00,
      "dimensiones": "45 × 45 × 55 cm",
      "anchoCm": 45,
      "material": "Madera de caucho",
      "acabado": "Satinado miel",
      "espacioRecomendado": "Ubicación lateral junto a sofá o cama sin obstruir paso.",
      "svg": `<svg viewBox="0 0 80 80" width="60" height="60" aria-hidden="true">
        <ellipse cx="40" cy="30" rx="22" ry="7" fill="#C68B53" stroke="#4A2C16" stroke-width="2"/>
        <line x1="30" y1="36" x2="24" y2="60" stroke="#4A2C16" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="36" x2="56" y2="60" stroke="#4A2C16" stroke-width="3" stroke-linecap="round"/>
        <line x1="40" y1="37" x2="40" y2="58" stroke="#6B4423" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`
    }
  ]
};