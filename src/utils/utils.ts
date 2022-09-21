function setRango(rep: number) {
  if (rep > 249)
    return 'ADMIN EMPODERADO'
  else if (rep > 199)
    return 'JOHN WICK '
  else if (rep > 149)
    return 'FAMILIA (A LO TORETTO)'
  else if (rep > 99)
    return 'ESTRELLA EN ASCENSO'
  else if (rep > 49)
    return 'VICIOSO'
  else if (rep > 19)
    return 'GRACIOSO (PERO NO TANTO)'
  else if (rep > -1)
    return 'DESCONOCIDO'
  else if (rep > -11)
    return 'REGGAETONERO'
  else if (rep > -21)
    return 'LATINOAMERICANO'
  else if (rep > -31)
    return 'YACEL'
  else
    return 'SECUAZ DE ETECSA'
}

function adornarRango(rango: string) {
  let rangoAdornado
  switch (rango) {
    case 'ADMIN EMPODERADO':
      rangoAdornado = '🦾 ADMIN EMPODERADO'
      break
    case 'JOHN WICK ':
      rangoAdornado = '✏️ JOHN WICK '
      break
    case 'FAMILIA (A LO TORETTO)':
      rangoAdornado = '👨‍👩‍👧‍👦 FAMILIA (A LO TORETTO)'
      break
    case 'ESTRELLA EN ASCENSO':
      rangoAdornado = '⭐️ ESTRELLA EN ASCENSO'
      break
    case 'VICIOSO':
      rangoAdornado = '🤓 VICIOSO'
      break
    case 'GRACIOSO (PERO NO TANTO)':
      rangoAdornado = '🤡 GRACIOSO (PERO NO TANTO)'
      break
    case 'DESCONOCIDO':
      rangoAdornado = '👤 DESCONOCIDO'
      break
    case 'REGGAETONERO':
      rangoAdornado = '💩 REGGAETONERO'
      break
    case 'LATINOAMERICANO':
      rangoAdornado = '👨‍🦯 LATINOAMERICANO'
      break
    case 'YACEL':
      rangoAdornado = '💃 YACEL'
      break
    case 'SECUAZ DE ETECSA':
      rangoAdornado = '🦹‍♂️ SECUAZ DE ETECSA'
      break

    default:
      rangoAdornado = '💩'
      break
  }
  return rangoAdornado
}

// calcular el tiempo que tarda el bot en arrancar
const elapsedTime = (inicio: number) => {
  const ahora = performance.now()
  const activo = ahora - inicio
  // dar el resultado en dependencia del tiempo
  if (activo > 60 * 60 * 1000) {
    const valor = roundToAny(activo / 3600000, 2)
    const horas = Math.floor(valor)
    const minutos = roundToAny((valor - horas) * 60, 0)
    return `${horas} h ${minutos} min`
  }
  else if (activo > 60000) {
    const valor = roundToAny(activo / 60000, 2)
    const minutos = Math.floor(valor)
    const segundos = roundToAny((valor - minutos) * 60, 0)
    return `${minutos} min ${segundos} s`
  }
  else {
    return `${roundToAny(activo / 1000, 1)} s`
  }
}

const timeToNext = (time: number) => {
  const current
    = time < 1000 * 60 * 60 * 24
      ? 1000 * 60 * 60 * 24 - time
      : 1000 * 60 * 60 * 24
  if (current > 60 * 60 * 1000) {
    const valor = roundToAny(current / 3600000, 2)
    const horas = Math.floor(valor)
    const minutos = roundToAny((valor - horas) * 60, 0)
    return `${horas} h ${minutos > 0 ? `${minutos} min` : ''}`
  }
  else if (current > 60000) {
    const valor = roundToAny(current / 60000, 2)
    const minutos = Math.floor(valor)
    const segundos = roundToAny((valor - minutos) * 60, 0)
    return `${minutos} min ${segundos > 0 ? `${segundos} s` : ''}`
  }
  else {
    return `${roundToAny(current / 1000, 1)} s`
  }
}

function roundToAny(num: number, n = 2) {
  return +(`${Math.round(parseInt(`${num}e+${n}`))}e-${n}`)
}

export { setRango, adornarRango, elapsedTime, timeToNext, roundToAny }
