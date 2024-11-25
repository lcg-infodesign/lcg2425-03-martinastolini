let rayLengths = [];
let continents = []; 
let continentColors = {}; 
let riverNames = [];
let riverAreas = []; 
let avgTemps = []; 

function preload() {
  table = loadTable('data/rivers-data.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight); // responsive solo all'avvio

  // estraggo le informazioni dal cvs che mi servono sulla lunghezza
  let lengths = table.getColumn("length").map(Number);
  let minLength = Math.min(...lengths);
  let maxLength = Math.max(...lengths);
  
  // scala le lunghezze da 100 al canvas/2
 let maxRayLength = windowWidth / 2.1;
  rayLengths = lengths.map(l => map(l, minLength, maxLength, 50, maxRayLength));

  // estraggo tutte le colonne
  continents = table.getColumn("continent");
  riverNames = table.getColumn("name");
  riverAreas = table.getColumn("area");
  avgTemps = table.getColumn("avg_temp");

  sortRays();
  
  assignColorsToContinents();

  drawRays(); 
}

function draw() {
  background("white");
  drawRays();   
  drawLegenda();

  // Controlla se il mouse è su un raggio
  let centerX = width / 2;
  let centerY = height / 2;
  let hoveredIndex = -1; // per indicare che il mouse non è su alcun raggio


  // questa parte mi serve per seguire il percorso di ogni singolo raggio dall'origine alla fine
  for (let i = 0; i < rayLengths.length; i++) {
    let angle = TWO_PI / rayLengths.length * i;
    let xEnd = centerX + cos(angle) * rayLengths[i];
    let yEnd = centerY + sin(angle) * rayLengths[i];

    // volevo fare in modo che l'hoover fosse il più "facile" possibile da usare
    // e che non fosse necessario essere precisi al millimetro per avere informazioni sul fiume
    let numSegments = 100; // mi serve per migliorare la precisione
    for (let j = 0; j <= numSegments; j++) {
      let t = j / numSegments; // Parametro per interpolare lungo il raggio
      let x = lerp(centerX, xEnd, t);
      let y = lerp(centerY, yEnd, t);
      if (dist(mouseX, mouseY, x, y) < 5) { // se la distanza tra il puntatore ed il raggio è meno di 5 px allora viene considerata sopra
        hoveredIndex = i;
        break;
      }
    }
    if (hoveredIndex !== -1) break; // se passo sopra a qualcosa si interrompe il ciclo perché ho trovato il mio valore
  }

  // mostra le informazioni del fiume se il mouse è sopra un raggio
  fill(0);
  noStroke();
  textSize(16);
  textFont ("Montserrat")
  textAlign(LEFT, TOP);
  if (hoveredIndex !== -1) { // se il mouse quindi è su un raggio
    text(
      `Nome: ${riverNames[hoveredIndex]}\n` +
      `Lunghezza: ${table.getColumn("length")[hoveredIndex]} km\n` +
      `Area: ${riverAreas[hoveredIndex]} km²\n` +
      `Temperatura Media: ${avgTemps[hoveredIndex]}°C`,
      10, 10
    );
  } else {
    // Mostra i dati vuoti quando il mouse non è su un raggio
    text(
      `Nome: \n` +
      `Lunghezza: \n` +
      `Area: \n` +
      `Temperatura Media: `,
      10, 10
    );
  }
}

function drawRays() {
  let centerX = width / 2;
  let centerY = height / 2;
  let numRays = rayLengths.length;

  strokeWeight(2);
  
  for (let i = 0; i < numRays; i++) {
    let angle = TWO_PI / numRays * i; // Angolo del raggio
    let radius = rayLengths[i];      // Lunghezza del raggio
    
    // Colore in base al continente
    stroke(continentColors[continents[i]]);
    
    // Calcola le coordinate finali
    let x = centerX + cos(angle) * radius;
    let y = centerY + sin(angle) * radius;

    // Disegna il raggio
    line(centerX, centerY, x, y);
  }
}

function drawLegenda() {
  let uniqueContinents = [...new Set(continents)];
  let legendaX = windowWidth - 40;
  let legendaY = 10;
  let boxSize = 10;
  let spacing = 10;

  textSize(16);
  strokeWeight(0);
  textAlign(RIGHT, CENTER);
  fill(0);

  for (let i = 0; i < uniqueContinents.length; i++) {
    let continent = uniqueContinents[i];
    fill(continentColors[continent]);
    rect(legendaX + 20 , legendaY + i * (boxSize + spacing), boxSize, boxSize);

    fill(0);
    text(
      continent,
      legendaX + boxSize,
      legendaY + i * (boxSize + spacing) + boxSize / 2
    );
  }
}

function assignColorsToContinents() {
  let uniqueContinents = [...new Set(continents)]; // trova i singoli contenuti unici tra i continenti
  let colors = [
    color(0),   
    color("blue"),    
    color(0, 128, 129),    
    color(101, 147, 235),  
    color(126, 249, 255),  
    color(149, 200, 216), 
    color("grey")   
  ];

  // per ogni continente, associa un colore preso dall'array colors
  // il modulo % serve perché qualora ad un nuovo aggiornamneto del dataset dovessimo aggiungere
  // un continente es antartica? allora il colore si ripeterà invece di rimanere vuoto
  uniqueContinents.forEach((continent, index) => {
    continentColors[continent] = colors[index % colors.length];
  });
}

// questa parte di codice mi permette di ordinare i fiumi per lunghezza
// e poi di conseguenza legare tutti gli altri valori a questo nuovo ordine
// map mi crea un array di oggetti, mentre sort confronta due elementi per capire
// quale viene prima e quale viene dopo
function sortRays() {
  let data = rayLengths.map((length, index) => ({
    length,
    continent: continents[index],
    name: riverNames[index],
    area: riverAreas[index],
    temp: avgTemps[index]
  }));

  data.sort((a, b) => b.length - a.length);

  // ora che è tutto in ordine e collegato, sovrascrivo il mnuovo ordine
  rayLengths = data.map(d => d.length);
  continents = data.map(d => d.continent);
  riverNames = data.map(d => d.name);
  riverAreas = data.map(d => d.area);
  avgTemps = data.map(d => d.temp);
}
