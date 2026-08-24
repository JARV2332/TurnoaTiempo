import fs from 'node:fs'

/**
 * Ruta Recolección → Catedral.
 * Cada punto = DESTINO de la dirección del programa.
 * Calles calibradas a las etiquetas del basemap Carto (Zona 1).
 */
const lat = {
  3: 14.645857,
  4: 14.644622,
  5: 14.64339,
  6: 14.64167,
  7: 14.64084,
  8: 14.63995,
  9: 14.63857,
  10: 14.63784,
  11: 14.63712,
  12: 14.63626,
}

const lng = {
  3: -90.516396,
  '3A': -90.515764,
  '3B': -90.515463,
  4: -90.515162,
  5: -90.514296,
  6: -90.513381,
  7: -90.512464,
  8: -90.51145,
  9: -90.510678,
}

function cruz(calle, av) {
  return {
    lat: Number(lat[calle].toFixed(6)),
    lng: Number(lng[av].toFixed(6)),
  }
}

const dest = {
  // Puerta del templo YA sobre la 3a Calle (así el 2 solo cruza al este)
  1: { lat: lat[3], lng: -90.517019 },
  2: cruz(3, 3),
  3: cruz(3, '3A'),
  4: cruz(3, '3B'),
  5: cruz(3, 4),
  6: cruz(3, 5),
  7: cruz(3, 6),
  8: cruz(4, 6),
  9: cruz(5, 6),
  10: cruz(6, 6),
  11: cruz(6, 7),
  12: cruz(6, 8),
  13: cruz(6, 9),
  14: cruz(7, 9),
  15: cruz(8, 9),
  16: cruz(9, 9),
  17: cruz(10, 9),
  18: cruz(10, 8),
  19: cruz(11, 8),
  20: cruz(12, 8),
  21: cruz(12, 7),
  22: cruz(11, 7),
  23: cruz(10, 7),
  24: cruz(9, 7),
  25: cruz(8, 7),
  26: { lat: 14.641483, lng: -90.512046 },
  27: { lat: 14.64156, lng: -90.51192 },
}

const dirs = {
  1: 'DEL DOSEL A LA PUERTA DEL TEMPLO DE LA RECOLECCION',
  2: 'DE LA PUERTA DEL TEMPLO A LA ESQUINA DE LA 3ERA. CALLE Y 3ERA. AVENIDA',
  3: 'DE LA 3ERA. AVENIDA A LA 3ERA. AVENIDA "A" SOBRE LA 3ERA. CALLE',
  4: 'DE LA 3ERA. AVENIDA "A" A LA 3ERA. AVENIDA "B" SOBRE LA TERCERA CALLE',
  5: 'DE LA 3ERA. AVENIDA "B" A LA 4TA. AVENIDA SOBRE LA 3ERA. CALLE',
  6: 'DE LA 4TA. AVENIDA A LA 5TA. AVENIDA SOBRE LA 3ERA. CALLE',
  7: 'DE LA 5TA. AVENIDA A LA 6TA. AVENIDA SOBRE LA 3ERA. CALLE',
  8: 'DE LA 3ERA. CALLE A LA 4TA. CALLE SOBRE LA 6TA. AVENIDA',
  9: 'DE LA 4TA. CALLE A LA 5TA. CALLE SOBRE LA 6TA. AVENIDA',
  10: 'DE LA 5TA. CALLE A LA 6TA. CALLE SOBRE LA 6TA. AVENIDA',
  11: 'PALACIO NACIONAL DE LA CULTURA',
  12: 'DE LA 7MA. AVENIDA A LA 8AVA. AVENIDA SOBRE LA SEXTA CALLE',
  13: 'DE LA 8AVA. AVENIDA A LA NOVENA AVENIDA SOBRE LA 6TA. CALLE',
  14: 'DE LA 6TA. CALLE A LA 7MA. CALLE SOBRE LA 9ENA. AVENIDA',
  15: 'DE LA 7MA. CALLE A LA 8AVA. CALLE SOBRE LA 9ENA. AVENIDA',
  16: 'DE LA 8AVA. CALLE A LA 9ENA. CALLE SOBRE LA 9ENA. AVENIDA',
  17: 'DE LA 9ENA. CALLE A LA 10MA. CALLE SOBRE LA 9ENA. AVENIDA',
  18: 'DE LA 9ENA. AVENIDA A LA 8AVA. AVENIDA SOBRE LA 10MA. CALLE',
  19: 'DE LA 10MA. CALLE A LA 11 CALLE SOBRE LA 8AVA. AVENIDA (TEMPLO DEL CARMEN)',
  20: 'DE LA 11 CALLE A LA 12 CALLE SOBRE LA 8AVA. AVENIDA',
  21: 'DE LA 8AVA. AVENIDA A LA 7MA. AVENIDA SOBRE LA 12 CALLE (ARCO DE CORREOS)',
  22: 'DE LA 12 CALLE A LA 11 CALLE SOBRE LA 7MA. AVENIDA',
  23: 'DE LA 11 CALLE A LA 10MA. CALLE SOBRE LA 7MA. AVENIDA',
  24: 'DE LA 10MA. CALLE A LA 9ENA. CALLE SOBRE LA 7MA. AVENIDA',
  25: 'DE LA 9ENA. CALLE A LA 8AVA. CALLE SOBRE LA 7MA. AVENIDA',
  26: 'DE LA 8AVA. CALLE A LA PUERTA DE CATEDRAL',
  27: 'DE LA PUERTA DE CATEDRAL AL DOSEL',
}

const piezas = {
  1: [
    ['LA DOLOROSA DE SAN FRANCISCO', 'MANUEL ANTONIO RAMIREZ CROCKER'],
    ['SALVE FRAY MIGUEL', 'CESAR AUGUSTO HERNANDEZ'],
    ['LA GRANADERA', ''],
  ],
  2: [['LA DOLOROSA', 'SALVADOR ROJO']],
  3: [['LA SOLEDAD', 'FRAY MIGUEL A. MURCIA MUNOZ']],
  4: [['MARIA LA PENITENTE', 'FRAY MIGUEL A. MURCIA MUNOZ']],
  5: [['LA ENTREGA DE JESUS NAZARENO', 'PEDRO DONIS FLORES']],
  6: [['AL PIE DE TU CALVARIO', 'MARIANO DE JESUS DIAZ BUEZO']],
  7: [['LOS SIETE DOLORES DE MARIA SANTISIMA', 'MANUEL ANTONIO RAMIREZ CROCKER']],
  8: [['PENITENCIA', 'ALBERTO VELASQUEZ COLLADO']],
  9: [['SOLEDAD', 'JOSE VICENTE CRUZ ROJO']],
  10: [['CONSAGRADA EN EL DOLOR (ESTRENO)', 'SAUL ALEJANDRO LOPEZ SIQUIBACHE']],
  11: [['LA FOSA', 'SANTIAGO CORONADO']],
  12: [['MADRE DEL AMOR Y DE LA PAZ', 'JUAN ENMANUEL MATIAS MEDIO']],
  13: [['EL LLANTO DE LA VIRGEN', 'BRIGIDO PORRES']],
  14: [['MATER MEA', 'RICARDO DORADO']],
  15: [['MARCHA FUNEBRE', 'FREDERIC CHOPIN']],
  16: [['DESOLACION', 'ENRIQUE MAXIMILIANO CASTRO']],
  17: [['MUJER POR QUE LLORAIS?', 'MARIANO DE JESUS DIAZ BUEZO']],
  18: [['AGNUS DEI', 'MANUEL ANTONIO RAMIREZ CROCKER']],
  19: [['EN TU MEMORIA', 'RICARDO MENDOZA NAVAS']],
  20: [['CONSUMATUM EST', 'MARIANO DE JESUS DIAZ BUEZO']],
  21: [['CAMINO DEL GOLGOTA', 'MARIO A. PANIAGUA']],
  22: [['MISERICORDIA SENOR', 'ALBERTO VELASQUEZ COLLADO']],
  23: [['SUDOR DE SANGRE', 'FRAY MIGUEL A. MURCIA MUNOZ']],
  24: [['A LA SOMBRA DEL DIVINO NAZARENO', 'MANUEL ANTONIO RAMIREZ CROCKER']],
  25: [['FLOR ESPIRITUAL', 'SALVADOR MILIAN']],
  26: [['JESUS NAZARENO DEL PERDON', 'MANUEL ANTONIO RAMIREZ CROCKER']],
  27: [
    ['LA GRANADERA', ''],
    ['SALVE MADRE DOLOROSA', 'MANUEL ANTONIO RAMIREZ CROCKER'],
    ['MATER DOLOROSA', 'JULIA QUINONEZ'],
  ],
}

const lines = ['Turno\tSon/Alabado\tAutor\tDirección\tLat\tLng\tTipo']
for (let i = 1; i <= 27; i++) {
  const d = dest[i]
  piezas[i].forEach((pz, idx) => {
    if (idx === 0) {
      lines.push(
        [i, pz[0], pz[1], dirs[i], d.lat.toFixed(6), d.lng.toFixed(6), 'ida'].join('\t'),
      )
    } else {
      lines.push(['', pz[0], pz[1], '', '', '', ''].join('\t'))
    }
  })
}

const body = `${lines.join('\n')}\n`
const paths = [
  'C:/Users/BDGSA/TurnoaTiempo/public/ruta-recoleccion-catedral-z1.tsv',
  'C:/Users/BDGSA/Downloads/RUTA-RECOLECCION-CATEDRAL-COMPLETA.tsv',
]
for (const p of paths) {
  fs.writeFileSync(p, body, 'utf8')
  console.log('WROTE', p)
}

for (let i = 1; i <= 26; i++) {
  const a = dest[i]
  const b = dest[i + 1]
  const dLat = Math.abs(a.lat - b.lat)
  const dLng = Math.abs(a.lng - b.lng)
  const axis =
    dLat < 1e-5 && dLng >= 1e-5
      ? 'E-W'
      : dLng < 1e-5 && dLat >= 1e-5
        ? 'N-S'
        : dLat < 1e-5 && dLng < 1e-5
          ? 'STACK'
          : 'L'
  console.log(`${i}->${i + 1} ${axis}`)
}

console.log('\nSample:')
console.log(fs.readFileSync(paths[1], 'utf8').split('\n').slice(0, 12).join('\n'))
