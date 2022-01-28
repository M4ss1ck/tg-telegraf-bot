function setRango(rep) {
  if (rep > 249) {
    return "ADMIN EMPODERADO";
  } else if (rep > 199) {
    return "JOHN WICK ";
  } else if (rep > 149) {
    return "FAMILIA (A LO TORETTO)";
  } else if (rep > 99) {
    return "ESTRELLA EN ASCENSO";
  } else if (rep > 49) {
    return "VICIOSO";
  } else if (rep > 19) {
    return "GRACIOSO (PERO NO TANTO)";
  } else if (rep > -1) {
    return "DESCONOCIDO";
  } else if (rep > -11) {
    return "REGGAETONERO";
  } else if (rep > -21) {
    return "LATINOAMERICANO";
  } else if (rep > -31) {
    return "YACEL";
  } else {
    return "SECUAZ DE ETECSA";
  }
}

function adornarRango(rango) {
  let rangoAdornado;
  switch (rango) {
    case "ADMIN EMPODERADO":
      rangoAdornado = "🦾 ADMIN EMPODERADO";
      break;
    case "JOHN WICK ":
      rangoAdornado = "✏️ JOHN WICK ";
      break;
    case "FAMILIA (A LO TORETTO)":
      rangoAdornado = "👨‍👩‍👧‍👦 FAMILIA (A LO TORETTO)";
      break;
    case "ESTRELLA EN ASCENSO":
      rangoAdornado = "⭐️ ESTRELLA EN ASCENSO";
      break;
    case "VICIOSO":
      rangoAdornado = "🤓 VICIOSO";
      break;
    case "GRACIOSO (PERO NO TANTO)":
      rangoAdornado = "🤡 GRACIOSO (PERO NO TANTO)";
      break;
    case "DESCONOCIDO":
      rangoAdornado = "👤 DESCONOCIDO";
      break;
    case "REGGAETONERO":
      rangoAdornado = "💩 REGGAETONERO";
      break;
    case "LATINOAMERICANO":
      rangoAdornado = "👨‍🦯 LATINOAMERICANO";
      break;
    case "YACEL":
      rangoAdornado = "💃 YACEL";
      break;
    case "SECUAZ DE ETECSA":
      rangoAdornado = "🦹‍♂️ SECUAZ DE ETECSA";
      break;

    default:
      rangoAdornado = "💩";
      break;
  }
  return rangoAdornado;
}

export { setRango, adornarRango };
