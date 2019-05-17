// @see https://jsfiddle.net/katowulf/3gtDf/

export function generate() {
  let firstWord = randomEl(beautifulAdjectives);
  firstWord = firstWord[0].toUpperCase() + firstWord.substring(1);
  return firstWord + " " + randomEl(nouns);
}

function randomEl(list) {
  var i = Math.floor(Math.random() * list.length);
  return list[i];
}

const beautifulAdjectives = [
  "sonder",
  "eloquence",
  "Vertigo",
  "serendipity",
  "redamancy",
  "tsundonky",
  "onism",
  "eunoia",
  "orenda",
  "mudita",
  "komorebi",
  "meraki",
  "jayus",
  "vellichor",
  "yin",
  "laotong",
  "tidsoptimist",
  "Goya",
  "Wu Wei",
  "Serein",
  "Quintessential",
  "Ephemerial",
  "Hiraeth",
  "Ubuntu",
  "Mangata",
  "Felicity",
  "Effervescent",
  "Loquacious",
  "Sodade",
  "Esperance",
  "Firgun"
];

const adjectives = [
  "admirable",
  "adorable",
  "alluring",
  "angelic",
  "appealing",
  "beauteous",
  "bewitching",
  "captivating",
  "charming",
  "classy",
  "comely",
  "cute",
  "dazzling",
  "delicate",
  "delightful",
  "divine",
  "elegant",
  "enthralling",
  "enticing",
  "excellent",
  "exquisite",
  "fair",
  "fascinating",
  "fetching",
  "fine",
  "foxy",
  "good-looking",
  "gorgeous",
  "graceful",
  "grand",
  "handsome",
  "ideal",
  "inviting",
  "lovely",
  "magnetic",
  "magnificent",
  "marvelous",
  "mesmeric",
  "nice",
  "pleasing",
  "pretty",
  "pulchritudinous",
  "radiant",
  "ravishing",
  "refined",
  "resplendent",
  "shapely",
  "slightly",
  "splendid",
  "statuesque",
  "stunning",
  "sublime",
  "superb",
  "symmetrical",
  "taking",
  "tantalizing",
  "teasing",
  "tempting",
  "well-formed",
  "winning",
  "wonderful",
  "adamant",
  "adroit",
  "amatory",
  "animistic",
  "antic",
  "arcadian",
  "baleful",
  "bellicose",
  "bilious",
  "boorish",
  "calamitous",
  "caustic",
  "cerulean",
  "comely",
  "concomitant",
  "contumacious",
  "corpulent",
  "crapulous",
  "defamatory",
  "didactic",
  "dilatory",
  "dowdy",
  "efficacious",
  "effulgent",
  "egregious",
  "endemic",
  "equanimous",
  "execrable",
  "fastidious",
  "feckless",
  "fecund",
  "friable",
  "fulsome",
  "garrulous",
  "guileless",
  "gustatory",
  "heuristic",
  "histrionic",
  "hubristic",
  "incendiary",
  "insidious",
  "insolent",
  "intransigent",
  "inveterate",
  "invidious",
  "irksome",
  "jocular",
  "judicious",
  "lachrymose",
  "limpid",
  "loquacious",
  "luminous",
  "mannered",
  "mendacious",
  "meretricious",
  "minatory",
  "mordant",
  "munificent",
  "nefarious",
  "noxious",
  "obtuse",
  "parsimonious",
  "pendulous",
  "pernicious",
  "pervasive",
  "petulant",
  "platitudinous",
  "precipitate",
  "propitious",
  "puckish",
  "querulous",
  "quiescent",
  "rebarbative",
  "recalcitant",
  "redolent",
  "rhadamanthine",
  "risible",
  "ruminative",
  "sagacious",
  "salubrious",
  "sartorial",
  "sclerotic",
  "serpentine",
  "spasmodic",
  "strident",
  "taciturn",
  "tenacious",
  "tremulous",
  "trenchant",
  "turbulent",
  "turgid",
  "ubiquitous",
  "uxorious",
  "verdant",
  "voluble",
  "voracious",
  "wheedling",
  "withering",
  "zealous"
];
const nouns = [
  "typewriter",
  "pen",
  "notebook",
  "ninja",
  "chair",
  "pancake",
  "statue",
  "unicorn",
  "rainbows",
  "laser",
  "senor",
  "bunny",
  "captain",
  "nibblets",
  "cupcake",
  "carrot",
  "gnomes",
  "glitter",
  "potato",
  "salad",
  "toejam",
  "curtains",
  "beets",
  "toilet",
  "exorcism",
  "stick figures",
  "mermaid eggs",
  "sea barnacles",
  "dragons",
  "jellybeans",
  "snakes",
  "dolls",
  "bushes",
  "cookies",
  "apples",
  "ice cream",
  "ukulele",
  "kazoo",
  "banjo",
  "opera singer",
  "circus",
  "trampoline",
  "carousel",
  "carnival",
  "locomotive",
  "hot air balloon",
  "praying mantis",
  "animator",
  "artisan",
  "artist",
  "colorist",
  "inker",
  "coppersmith",
  "director",
  "designer",
  "flatter",
  "stylist",
  "leadman",
  "limner",
  "make-up artist",
  "model",
  "musician",
  "penciller",
  "producer",
  "scenographer",
  "set decorator",
  "silversmith",
  "teacher",
  "auto mechanic",
  "beader",
  "bobbin boy",
  "clerk of the chapel",
  "filling station attendant",
  "foreman",
  "maintenance engineering",
  "mechanic",
  "miller",
  "moldmaker",
  "panel beater",
  "patternmaker",
  "plant operator",
  "plumber",
  "sawfiler",
  "shop foreman",
  "soaper",
  "stationary engineer",
  "wheelwright",
  "woodworkers"
];
