/**
 * AuctionVault - Core Catalog Data & Initial Mock State
 */

const INITIAL_CATALOG = [
  {
    id: "lot-101",
    lotNumber: "LOT #088",
    title: "Imperial Ming Dynasty Celadon Dragon Vase",
    subtitle: "Xuande Mark & Period (c. 1426–1435) • Cobalt Blue Imperial Underglaze",
    category: "Ancient Artifacts",
    categoryKey: "artifacts",
    image: "assets/vase.jpg",
    highResImage: "assets/vase.jpg",
    featuredLotOfDay: true,
    startingBid: 80000,
    reservePrice: 150000,
    currentBid: 168000,
    reserveMet: true,
    minIncrement: 2000,
    timeLeftSeconds: 85, // Perfect for testing anti-sniping protection in the first 60-90s!
    initialDurationSeconds: 86400 * 3,
    viewersCount: 238,
    bidsCount: 42,
    antiSnipingTriggered: 0,
    status: "active",
    seller: {
      name: "Baroness Elena von Stauffen",
      handle: "@StauffenAntiquities",
      reputationScore: 99.8,
      verifiedKYC: true,
      tier: "Platinum Consignor",
      salesCompleted: 147,
      country: "Zurich, Switzerland",
      avatarInitials: "ES",
      avatarColor: "#b8860b"
    },
    provenance: [
      { year: "1888", event: "Documented in Imperial Qing Summer Palace Inventory, Beiping" },
      { year: "1932", event: "Acquired by Count Henri de La Tour, Paris" },
      { year: "1974", event: "Cataloged in Sotheby's London Master Asian Art Sale (Lot #112)" },
      { year: "2001", event: "Exhibited at Ashmolean Museum, Oxford (Exhibition #O-991)" },
      { year: "2025", event: "Privately held in Geneva FreePort vault until current consignment" }
    ],
    curatorialNotes: "Remarkable preservation of the five-clawed Imperial dragon writhed amidst auspicious ruyi cloud banks. The underglaze cobalt displays the coveted 'heaped and piled' effect characteristic of genuine Xuande kilns. Thermoluminescence test (Daybreak Lab #DB-8941) confirms 15th-century firing date.",
    authenticity: {
      expert: "Dr. Huan Lin, FSA",
      expertTitle: "Senior Conservator of Imperial Chinese Ceramics",
      certNumber: "AV-AUTH-2026-MING-088",
      issueDate: "October 4, 2026",
      blockchainHash: "0x8f9c2d1b7e4a509f61b238a9e04cd612fb8e91aa78",
      inspectionStatus: "Physical Examination Passed (100% Guaranteed Authentic)"
    },
    specs: {
      "Period": "Ming Dynasty (Xuande mark and period)",
      "Height": "44.2 cm (17.4 inches)",
      "Diameter": "25.8 cm at shoulder",
      "Material": "Fine Kaolin Clay Porcelain & Smalt Cobalt",
      "Glaze Condition": "Flawless antique craquelure, no chips or restoration",
      "Shipping": "Armored Climate-Controlled White-Glove Vault Courier"
    },
    bidHistory: [
      { id: "b1", bidder: "GenevaHeritage_Vault", amount: 168000, time: "2 mins ago", verified: true, isYou: false },
      { id: "b2", bidder: "Lord_Blackwood", amount: 165000, time: "4 mins ago", verified: true, isYou: false },
      { id: "b3", bidder: "SingaporeCurator", amount: 160000, time: "9 mins ago", verified: true, isYou: false },
      { id: "b4", bidder: "GenevaHeritage_Vault", amount: 155000, time: "18 mins ago", verified: true, isYou: false },
      { id: "b5", bidder: "KyotoDynasty_Art", amount: 150000, time: "34 mins ago", verified: true, isYou: false }
    ]
  },
  {
    id: "lot-102",
    lotNumber: "LOT #089",
    title: "1954 Patek Philippe Ref. 1463 'Tasti Tondi'",
    subtitle: "18K Yellow Gold Chronograph • Original Untouched Patina Honey Dial",
    category: "Vintage Watches",
    categoryKey: "watches",
    image: "assets/watch.jpg",
    highResImage: "assets/watch.jpg",
    featuredLotOfDay: false,
    startingBid: 45000,
    reservePrice: 90000,
    currentBid: 98500,
    reserveMet: true,
    minIncrement: 1500,
    timeLeftSeconds: 310,
    initialDurationSeconds: 86400 * 4,
    viewersCount: 189,
    bidsCount: 29,
    antiSnipingTriggered: 0,
    status: "active",
    seller: {
      name: "Marcus Aurelius Horology",
      handle: "@MarcusWatchVault",
      reputationScore: 100.0,
      verifiedKYC: true,
      tier: "Master Horologist",
      salesCompleted: 312,
      country: "Milan, Italy",
      avatarInitials: "MH",
      avatarColor: "#2e7d32"
    },
    provenance: [
      { year: "1954", event: "Delivered to Gubelin Jewellers, Lucerne, Switzerland" },
      { year: "1989", event: "Inherited by private family estate in Lake Como" },
      { year: "2018", event: "Full historical archive extract issued by Patek Philippe Museum, Geneva" },
      { year: "2026", event: "Complete laser-free diagnostic by certified independent Swiss watchmaker" }
    ],
    curatorialNotes: "The famed waterproof round-pusher 'Tasti Tondi' reference with Taubert & Fils screw-back case. Features rare warm aged champagne lacquer with blued steel central chronograph seconds hand and tachymeter scale. Movement Caliber 13-130 pristine, keeping chronometer accuracy.",
    authenticity: {
      expert: "Jean-Paul Delacroix",
      expertTitle: "Archival Consultant, Geneva Horological Society",
      certNumber: "AV-AUTH-2026-PATK-1463",
      issueDate: "September 18, 2026",
      blockchainHash: "0x77c49e218ab2401f99cba48375102fec90021b4a15",
      inspectionStatus: "Full Archive Extract & Movement Serial Matched"
    },
    specs: {
      "Reference": "1463 (Second Generation)",
      "Movement": "Calibre 13'''130 manual wind, 23 jewels",
      "Case": "18K Yellow Gold, 35mm diameter without crown",
      "Dial": "Unrestored original two-tone dial with applied Roman numerals",
      "Strap": "Original vintage patinated Mississippi alligator leather",
      "Water Resistance": "Original 1954 factory specification (tested static safe)"
    },
    bidHistory: [
      { id: "b10", bidder: "Zurich_Collector", amount: 98500, time: "1 min ago", verified: true, isYou: false },
      { id: "b11", bidder: "WallSt_Antiquarian", amount: 96000, time: "3 mins ago", verified: true, isYou: false },
      { id: "b12", bidder: "Zurich_Collector", amount: 93500, time: "7 mins ago", verified: true, isYou: false }
    ]
  },
  {
    id: "lot-103",
    lotNumber: "LOT #090",
    title: "Imperial Roman Gold Aureus of Augustus",
    subtitle: "Lugdunum Mint (2 BC–AD 4) • Gaius & Lucius Caesars Reverse • Choice XF",
    category: "Rare Coins",
    categoryKey: "coins",
    image: "assets/coin.jpg",
    highResImage: "assets/coin.jpg",
    featuredLotOfDay: false,
    startingBid: 18000,
    reservePrice: 38000,
    currentBid: 44200,
    reserveMet: true,
    minIncrement: 1000,
    timeLeftSeconds: 620,
    initialDurationSeconds: 86400 * 2,
    viewersCount: 144,
    bidsCount: 31,
    antiSnipingTriggered: 0,
    status: "active",
    seller: {
      name: "Dr. Cassius Vane",
      handle: "@ClassicalNumismatics",
      reputationScore: 99.4,
      verifiedKYC: true,
      tier: "Numismatic Fellow",
      salesCompleted: 88,
      country: "London, UK",
      avatarInitials: "CV",
      avatarColor: "#8e24aa"
    },
    provenance: [
      { year: "1903", event: "Discovered in the celebrated Boscoreale Treasure hoard near Pompeii" },
      { year: "1928", event: "Acquired by the Hirsch Collection, Munich" },
      { year: "1982", event: "Privately traded through Numismatic Fine Arts, Beverly Hills" },
      { year: "2024", event: "Graded and encapsulated by NGC Ancients: Choice XF, Strike 5/5, Surface 5/5" }
    ],
    curatorialNotes: "An extraordinary specimen struck during the height of the Pax Romana. The laurel portrait of Augustus Caesar exhibits high relief with full borders and dazzling mint luster with faint warm toning. Reverse features Gaius and Lucius Caesars standing facing, two shields and spears between.",
    authenticity: {
      expert: "Prof. Kenneth Sterling",
      expertTitle: "Fellow of the Royal Numismatic Society",
      certNumber: "AV-AUTH-2026-AUREUS-AUG",
      issueDate: "October 10, 2026",
      blockchainHash: "0x11e408bf39c514782bbcd3400aefc919d832b491a9",
      inspectionStatus: "NGC Encapsulated Certified Authentic Choice XF"
    },
    specs: {
      "Ruler": "Caesar Augustus (27 BC – AD 14)",
      "Mint": "Lugdunum (modern Lyon, France)",
      "Weight": "7.92 grams (pure 24k gold)",
      "Diameter": "19.8 mm",
      "NGC Grade": "Choice XF ★ (Strike 5/5, Surface 5/5, Fine Style)",
      "Reference": "RIC I 207; Calicó 176a"
    },
    bidHistory: [
      { id: "b20", bidder: "VaticanVault_88", amount: 44200, time: "5 mins ago", verified: true, isYou: false },
      { id: "b21", bidder: "AthenianSociety", amount: 42500, time: "12 mins ago", verified: true, isYou: false },
      { id: "b22", bidder: "VaticanVault_88", amount: 40000, time: "25 mins ago", verified: true, isYou: false }
    ]
  },
  {
    id: "lot-104",
    lotNumber: "LOT #091",
    title: "17th Century Maritime Brass Celestial Astrolabe",
    subtitle: "Attributed to Master Abd al-A'imma • Astronomical Rete & 4 Latitude Tympans",
    category: "Collectibles",
    categoryKey: "collectibles",
    image: "assets/astrolabe.jpg",
    highResImage: "assets/astrolabe.jpg",
    featuredLotOfDay: false,
    startingBid: 25000,
    reservePrice: 50000,
    currentBid: 56000,
    reserveMet: true,
    minIncrement: 1000,
    timeLeftSeconds: 1180,
    initialDurationSeconds: 86400 * 5,
    viewersCount: 96,
    bidsCount: 19,
    antiSnipingTriggered: 0,
    status: "active",
    seller: {
      name: "Captain Roderick Thorne",
      handle: "@MaritimeRelics",
      reputationScore: 98.9,
      verifiedKYC: true,
      tier: "Senior Antiquarian",
      salesCompleted: 64,
      country: "Edinburgh, Scotland",
      avatarInitials: "RT",
      avatarColor: "#0288d1"
    },
    provenance: [
      { year: "1682", event: "Forged in Isfahan observatory workshop for naval navigator" },
      { year: "1815", event: "Presented to the Royal Naval Academy, Greenwich" },
      { year: "1960", event: "Acquired by the Maritime Antiquities Trust of Scotland" },
      { year: "2023", event: "Cataloged with complete celestial star pointer mapping" }
    ],
    curatorialNotes: "Heavy cast brass planispheric astrolabe with throne pierced in arabesque vines. The rete holds 28 star pointers with silver inlaid pips. Four double-sided engraved plates calculated for navigation between latitudes 24°N and 48°N. Alidade with original sighting pinnules intact.",
    authenticity: {
      expert: "Dr. Fiona MacIntyre",
      expertTitle: "Curator Emeritus of Historical Scientific Instruments",
      certNumber: "AV-AUTH-2026-ASTRO-1682",
      issueDate: "September 29, 2026",
      blockchainHash: "0x44bf09d78216c891ba3e1509cd810237e1925b3310",
      inspectionStatus: "Scientific Spectral Alloy & Calibration Verified"
    },
    specs: {
      "Date": "circa 1680–1695",
      "Diameter": "18.5 cm (7.3 inches)",
      "Thickness": "1.2 cm",
      "Weight": "1.84 kg",
      "Material": "Engraved High-Copper Bell Brass & Silver Inlay",
      "Functions": "Solar Altitude, Equal & Unequal Hours, Astrological Houses"
    },
    bidHistory: [
      { id: "b30", bidder: "GreenwichHistorian", amount: 56000, time: "14 mins ago", verified: true, isYou: false },
      { id: "b31", bidder: "LisbonExplorer", amount: 54000, time: "22 mins ago", verified: true, isYou: false }
    ]
  },
  {
    id: "lot-105",
    lotNumber: "LOT #092",
    title: "16th Century Muromachi Katana by Osafune Sukesada",
    subtitle: "NBTHK Tokubetsu Juyo Token Certificate • Dragon Gold Inlay Tsuba & Hamon",
    category: "Ancient Artifacts",
    categoryKey: "artifacts",
    image: "assets/katana.jpg",
    highResImage: "assets/katana.jpg",
    featuredLotOfDay: false,
    startingBid: 35000,
    reservePrice: 70000,
    currentBid: 78500,
    reserveMet: true,
    minIncrement: 1500,
    timeLeftSeconds: 1940,
    initialDurationSeconds: 86400 * 6,
    viewersCount: 215,
    bidsCount: 36,
    antiSnipingTriggered: 0,
    status: "active",
    seller: {
      name: "Takamori Samurai Arts",
      handle: "@KyotoKotoSwords",
      reputationScore: 99.9,
      verifiedKYC: true,
      tier: "Grand Master Dealer",
      salesCompleted: 204,
      country: "Kyoto, Japan",
      avatarInitials: "TS",
      avatarColor: "#d32f2f"
    },
    provenance: [
      { year: "1573", event: "Forged in Bizen Province by master smith Osafune Sukesada" },
      { year: "1710", event: "Recorded in the armory register of the Sendai Date Daimyo Clan" },
      { year: "1958", event: "Designated as Tokubetsu Juyo Token (Especially Important Sword) by NBTHK" },
      { year: "2024", event: "Restored polish by Living National Treasure polisher in Tokyo" }
    ],
    curatorialNotes: "Magnificent koto blade displaying a vivid choji midare (clove blossom pattern) temper line with sunagashi and kinsuji lightning streaks. The tang is signed and dated. Mounted in complete Edo period koshirae featuring a shakudo tsuba depicting ascending gold dragons amidst thunderclouds.",
    authenticity: {
      expert: "Sensai Kenji Takahashi",
      expertTitle: "NBTHK Senior Appraiser & Blade Historian",
      certNumber: "AV-AUTH-2026-KATANA-BIZEN",
      issueDate: "October 1, 2026",
      blockchainHash: "0x99a4e2105cd6812be4071fa9900481ec45b23d90f2",
      inspectionStatus: "NBTHK Tokubetsu Juyo Papers Registered in Tokyo"
    },
    specs: {
      "Smith": "Bizen Osafune Sukesada",
      "Era": "Late Muromachi Period (Tensho Era, c. 1573)",
      "Nagasa (Blade Length)": "71.2 cm (28.03 inches)",
      "Sori (Curvature)": "2.1 cm koshi-zori",
      "Hamon": "Choji Midare with brilliant Nie and Nioi",
      "Koshirae": "Urushi black lacquer scabbard with solid gold dragon menuki"
    },
    bidHistory: [
      { id: "b40", bidder: "TokyoImperial_Collector", amount: 78500, time: "8 mins ago", verified: true, isYou: false },
      { id: "b41", bidder: "SiliconValleyRelics", amount: 76000, time: "16 mins ago", verified: true, isYou: false },
      { id: "b42", bidder: "TokyoImperial_Collector", amount: 73000, time: "30 mins ago", verified: true, isYou: false }
    ]
  },
  {
    id: "lot-106",
    lotNumber: "LOT #093",
    title: "Circle of Rembrandt: Portrait of an Amsterdam Noblewoman",
    subtitle: "Oil on Oak Panel (c. 1642) • Masterful Chiaroscuro • Period Gilded Frame",
    category: "Fine Art",
    categoryKey: "art",
    image: "assets/painting.jpg",
    highResImage: "assets/painting.jpg",
    featuredLotOfDay: false,
    startingBid: 95000,
    reservePrice: 180000,
    currentBid: 215000,
    reserveMet: true,
    minIncrement: 5000,
    timeLeftSeconds: 3400,
    initialDurationSeconds: 86400 * 7,
    viewersCount: 310,
    bidsCount: 48,
    antiSnipingTriggered: 0,
    status: "active",
    seller: {
      name: "Van Rijn Fine Old Masters Ltd.",
      handle: "@AmsterdamFineArt",
      reputationScore: 99.7,
      verifiedKYC: true,
      tier: "Sotheby's Associate Dealer",
      salesCompleted: 119,
      country: "Amsterdam, Netherlands",
      avatarInitials: "VR",
      avatarColor: "#e65100"
    },
    provenance: [
      { year: "1642", event: "Painted in Amsterdam, workshop circle of Rembrandt van Rijn" },
      { year: "1785", event: "Collection of Lord Northwick, Thirlestaine House, Cheltenham" },
      { year: "1935", event: "Acquired by the Wildenstein Gallery, New York" },
      { year: "1994", event: "Dendrochronology report by Prof. Peter Klein confirming Baltic oak felled 1638" },
      { year: "2025", event: "Exhibited in the Rijksmuseum special loan gallery" }
    ],
    curatorialNotes: "Sublime chiaroscuro study rendering the luminous skin tones and intricate gold-embroidered brocade corset of an aristocratic Dutch patrician. Pigment spectrometry detects genuine lapis lazuli and lead-tin yellow on double chalk-and-oil ground.",
    authenticity: {
      expert: "Dr. Willem Vermeer",
      expertTitle: "Member of the Rembrandt Research Project (RRP)",
      certNumber: "AV-AUTH-2026-REMB-1642",
      issueDate: "September 12, 2026",
      blockchainHash: "0xcc298a0051e73f4b8911029cde8709425ab8174e92",
      inspectionStatus: "Dendrochronology & Multi-Spectral Pigment Certified"
    },
    specs: {
      "Artist": "Circle of Rembrandt van Rijn (1606–1669)",
      "Medium": "Oil on single Baltic oak panel",
      "Dimensions": "76.5 x 61.2 cm (framed: 104 x 88 cm)",
      "Frame": "Original 17th-century carved Netherlandish gilded auricular frame",
      "Condition Report": "Minor stable historic craquelure; structural support flawless"
    },
    bidHistory: [
      { id: "b50", bidder: "Rijksmuseum_Patron", amount: 215000, time: "6 mins ago", verified: true, isYou: false },
      { id: "b51", bidder: "NewYorkPrivateMuseum", amount: 205000, time: "18 mins ago", verified: true, isYou: false },
      { id: "b52", bidder: "Rijksmuseum_Patron", amount: 195000, time: "42 mins ago", verified: true, isYou: false }
    ]
  }
];

// Curated Categories definitions
const CATEGORIES = [
  { id: "all", name: "All Relics", icon: "fas fa-layer-group", count: 6 },
  { id: "artifacts", name: "Ancient Artifacts", icon: "fas fa-landmark", count: 2 },
  { id: "watches", name: "Vintage Watches", icon: "fas fa-clock", count: 1 },
  { id: "coins", name: "Rare Coins & Medals", icon: "fas fa-coins", count: 1 },
  { id: "art", name: "Fine Art & Masters", icon: "fas fa-palette", count: 1 },
  { id: "collectibles", name: "Curios & Antiques", icon: "fas fa-compass", count: 1 }
];

// Verified Bidder simulation pool
const SIMULATED_BIDDERS = [
  { name: "GenevaHeritage_Vault", rep: 99.8, country: "CH", badge: "Tier 1 Private Vault" },
  { name: "Lord_Blackwood", rep: 99.2, country: "UK", badge: "Master Collector" },
  { name: "SingaporeCurator", rep: 98.7, country: "SG", badge: "Museum Trustee" },
  { name: "WallSt_Antiquarian", rep: 99.5, country: "US", badge: "Verified Syndicate" },
  { name: "KyotoDynasty_Art", rep: 100.0, country: "JP", badge: "Honorary Fellow" },
  { name: "VaticanVault_88", rep: 99.9, country: "VA", badge: "Patron Member" },
  { name: "Zurich_Collector", rep: 99.1, country: "CH", badge: "Verified Bidder" }
];
