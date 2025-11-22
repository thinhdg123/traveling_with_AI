import vietnamMap from '@svg-maps/vietnam'
import svgPathBounds from 'svg-path-bounds'

export type RegionId = 'north' | 'central' | 'south' | 'mekong'

export interface RegionDefinition {
  id: RegionId
  name: string
  description: string
  color: string
  glow: string
  accent: string
  viewBox: string
  provinceIds: string[]
  mapQuery?: string
  mapZoom?: number
  labelPosition: [number, number]
}

export interface CityInfo {
  id: string
  name: string
  provinceId: string
  population: string
  summary: string
  highlight: string
  mapQuery?: string
}

const REGION_CONFIG: Array<Omit<RegionDefinition, 'viewBox' | 'provinceIds' | 'labelPosition'>> = [
  {
    id: 'north',
    name: 'Miền Bắc',
    description: 'Cultural cradle stretching from the rugged northwest to the Red River delta.',
    color: '#3f7de0',
    glow: '#6ba5ff',
    accent: '#9bc7ff',
  },
  {
    id: 'central',
    name: 'Miền Trung',
    description: 'Coastal heritage cities and the coffee-rich Central Highlands.',
    color: '#f29f42',
    glow: '#ffd494',
    accent: '#ffebb5',
    mapQuery: '14.6516511,108.4276047',
    mapZoom: 6,
  },
  {
    id: 'south',
    name: 'Miền Nam',
    description: 'Hồ Chí Minh City and the fast-growing southeastern industrial corridor.',
    color: '#2fb5aa',
    glow: '#84e1d9',
    accent: '#b7f7ed',
    mapQuery: '11.2136337,106.912251',
    mapZoom: 7,
  },
  {
    id: 'mekong',
    name: 'Miền Tây',
    description: 'Lush waterways, floating markets, and fertile rice paddies.',
    color: '#7cd453',
    glow: '#c6f599',
    accent: '#e8ffd1',
  },
]

const regionProvinceMap: Record<RegionId, string[]> = {
  north: [
    'dienbien',
    'laichau',
    'sonla',
    'laocai',
    'yenbai',
    'phutho',
    'tuyenquang',
    'vinhphuc',
    'bacgiang',
    'bacninh',
    'backan',
    'caobang',
    'langson',
    'thainguyen',
    'hagiang',
    'hoabinh',
    'hanoi',
    'hanam',
    'hungyen',
    'haiduong',
    'haiphong',
    'quangninh',
    'namdinh',
    'thaibinh',
    'ninhbinh',
    'thanhhoa',
    'nghean',
  ],
  central: [
    'hatinh',
    'quangbinh',
    'quangtri',
    'tthue',
    'danang',
    'quangnam',
    'quangngai',
    'binhdinh',
    'phuyen',
    'khanhhoa',
    'ninhthuan',
    'binhthuan',
    'kontum',
    'gialai',
    'daklak',
    'daknong',
    'lamdong',
  ],
  south: ['hcm', 'binhduong', 'binhphuoc', 'dongnai', 'baria', 'tayninh', 'longan'],
  mekong: [
    'angiang',
    'baclieu',
    'bentre',
    'camau',
    'cantho',
    'dongthap',
    'haugiang',
    'kiengiang',
    'soctrang',
    'tiengiang',
    'travinh',
    'vinhlong',
  ],
}

const fallbackRegion: RegionId = 'central'
const ignoredProvinces = new Set(['hoangsa', 'truongsa'])

const mapData = vietnamMap
type SvgLocation = (typeof mapData.locations)[number]

export const vietnamViewBox = mapData.viewBox

export const PROVINCE_TO_REGION: Record<string, RegionId> = {}
Object.entries(regionProvinceMap).forEach(([regionId, provinceIds]) => {
  provinceIds.forEach((provinceId) => {
    PROVINCE_TO_REGION[provinceId] = regionId as RegionId
  })
})

export interface ProvinceShape extends SvgLocation {
  id: string
  path: string
  regionId: RegionId
  centroid: [number, number]
}

export const provinces: ProvinceShape[] = mapData.locations
  .filter((location) => !ignoredProvinces.has(location.id))
  .map((location) => {
    const [minX, minY, maxX, maxY] = svgPathBounds(location.path)
    const centroid: [number, number] = [(minX + maxX) / 2, (minY + maxY) / 2]
    return {
      ...location,
      regionId: PROVINCE_TO_REGION[location.id] ?? fallbackRegion,
      centroid,
    }
  })

function computeRegionViewMeta(): Record<
  RegionId,
  { viewBox: string; centroid: [number, number] }
> {
  const base: Record<RegionId, [number, number, number, number]> = {
    north: [Infinity, Infinity, -Infinity, -Infinity],
    central: [Infinity, Infinity, -Infinity, -Infinity],
    south: [Infinity, Infinity, -Infinity, -Infinity],
    mekong: [Infinity, Infinity, -Infinity, -Infinity],
  }

  provinces.forEach((province) => {
    const [minX, minY, maxX, maxY] = svgPathBounds(province.path)
    const bounds = base[province.regionId]
    base[province.regionId] = [
      Math.min(bounds[0], minX),
      Math.min(bounds[1], minY),
      Math.max(bounds[2], maxX),
      Math.max(bounds[3], maxY),
    ]
  })

  const padding = 24
  return Object.keys(base).reduce((acc, key) => {
    const regionId = key as RegionId
    const [minX, minY, maxX, maxY] = base[regionId]
    const width = maxX - minX
    const height = maxY - minY
    acc[regionId] = {
      viewBox: `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`,
      centroid: [(minX + maxX) / 2, (minY + maxY) / 2],
    }
    return acc
  }, {} as Record<RegionId, { viewBox: string; centroid: [number, number] }>)
}

const regionViewMeta = computeRegionViewMeta()

export const regions: RegionDefinition[] = REGION_CONFIG.map((config) => ({
  ...config,
  viewBox: regionViewMeta[config.id].viewBox,
  labelPosition: regionViewMeta[config.id].centroid,
  provinceIds: regionProvinceMap[config.id],
}))



export const regionCities: Record<RegionId, CityInfo[]> = {
  north: [
    {
      id: 'hanoi',
      name: 'Hà Nội',
      provinceId: 'hanoi',
      population: '8.4M',
      summary: 'Capital of Vietnam and heart of the Red River Delta.',
      highlight: 'Old Quarter, West Lake, craft coffee scene.',
      mapQuery: '21.0285,105.8542',
    },
    {
      id: 'haiphong',
      name: 'Hải Phòng',
      provinceId: 'haiphong',
      population: '2.3M',
      summary: 'Northern deep-water port and logistics powerhouse.',
      highlight: 'Cat Ba ferries, flamboyant phoenix flowers in May.',
      mapQuery: '20.8449,106.6881',
    },
    {
      id: 'halong',
      name: 'Hạ Long',
      provinceId: 'quangninh',
      population: '0.35M',
      summary: 'Gateway city to the UNESCO-listed limestone bay.',
      highlight: 'Overnight cruises, sunrises from Bai Tho mountain.',
      mapQuery: '20.9599,107.0425',
    },
    {
      id: 'dienbienphu',
      name: 'Điện Biên Phủ',
      provinceId: 'dienbien',
      population: '0.08M',
      summary: 'Historic city famous for the 1954 victory.',
      highlight: 'Dien Bien Phu Victory Museum, A1 Hill.',
      mapQuery: '21.3869,103.0204',
    },
    {
      id: 'laichau',
      name: 'Lai Châu',
      provinceId: 'laichau',
      population: '0.05M',
      summary: 'Mountainous frontier city with stunning caves.',
      highlight: 'Pu Sam Cap caves, community tourism.',
      mapQuery: '22.3959,103.4603',
    },
    {
      id: 'sonla',
      name: 'Sơn La',
      provinceId: 'sonla',
      population: '0.1M',
      summary: 'Cultural hub of the Northwest mountains.',
      highlight: 'Son La Prison Museum, Moc Chau tea hills nearby.',
      mapQuery: '21.3286,103.9092',
    },
    {
      id: 'sapa',
      name: 'Sa Pa',
      provinceId: 'laocai',
      population: '0.06M',
      summary: 'Misty town overlooking terraced rice fields.',
      highlight: 'Fansipan peak, Cat Cat village, trekking.',
      mapQuery: '22.3364,103.8438',
    },
    {
      id: 'yenbai',
      name: 'Yên Bái',
      provinceId: 'yenbai',
      population: '0.1M',
      summary: 'Gateway to the spectacular Mu Cang Chai terraces.',
      highlight: 'Thac Ba Lake, paragliding over rice fields.',
      mapQuery: '21.7055,104.8743',
    },
    {
      id: 'viettri',
      name: 'Việt Trì',
      provinceId: 'phutho',
      population: '0.3M',
      summary: 'City of festivals at the confluence of three rivers.',
      highlight: 'Hung Kings Temple complex, Xoan singing.',
      mapQuery: '21.3234,105.4022',
    },
    {
      id: 'tuyenquang',
      name: 'Tuyên Quang',
      provinceId: 'tuyenquang',
      population: '0.15M',
      summary: 'Historical revolutionary base with lush forests.',
      highlight: 'Tan Trao banyan tree, Mid-Autumn Festival parades.',
      mapQuery: '21.8255,105.2127',
    },
    {
      id: 'vinhyen',
      name: 'Vĩnh Yên',
      provinceId: 'vinhphuc',
      population: '0.15M',
      summary: 'Satellite city with resorts and golf courses.',
      highlight: 'Tam Dao National Park nearby, Dai Lai Lake.',
      mapQuery: '21.3083,105.6046',
    },
    {
      id: 'bacgiang',
      name: 'Bắc Giang',
      provinceId: 'bacgiang',
      population: '0.2M',
      summary: 'Fruit capital famous for lychees.',
      highlight: 'Vinh Nghiem Pagoda, Xuong Giang citadel.',
      mapQuery: '21.2731,106.1946',
    },
    {
      id: 'bacninh',
      name: 'Bắc Ninh',
      provinceId: 'bacninh',
      population: '0.27M',
      summary: 'Smallest province but a cultural giant of Quan Ho singing.',
      highlight: 'Do Temple, Phat Tich Pagoda.',
      mapQuery: '21.1861,106.0763',
    },
    {
      id: 'backan',
      name: 'Bắc Kạn',
      provinceId: 'backan',
      population: '0.05M',
      summary: 'Gateway to the pristine Ba Be National Park.',
      highlight: 'Ba Be Lake boat trips, Puong Cave.',
      mapQuery: '22.1470,105.8348',
    },
    {
      id: 'caobang',
      name: 'Cao Bằng',
      provinceId: 'caobang',
      population: '0.08M',
      summary: 'Frontier city near the majestic Ban Gioc Waterfall.',
      highlight: 'Ban Gioc Waterfall, Pac Bo Cave.',
      mapQuery: '22.6667,106.2500',
    },
    {
      id: 'langson',
      name: 'Lạng Sơn',
      provinceId: 'langson',
      population: '0.1M',
      summary: 'Border trade hub with historic citadels.',
      highlight: 'Tam Thanh Cave, Mac Dynasty Citadel.',
      mapQuery: '21.8533,106.7614',
    },
    {
      id: 'thainguyen',
      name: 'Thái Nguyên',
      provinceId: 'thainguyen',
      population: '0.4M',
      summary: 'Tea capital of Vietnam and industrial center.',
      highlight: 'Museum of Cultures of Vietnam\'s Ethnic Groups, Tan Cuong tea hills.',
      mapQuery: '21.5942,105.8482',
    },
    {
      id: 'hagiang',
      name: 'Hà Giang',
      provinceId: 'hagiang',
      population: '0.07M',
      summary: 'Starting point for the legendary Ha Giang Loop.',
      highlight: 'Dong Van Karst Plateau, Ma Pi Leng Pass.',
      mapQuery: '22.8233,104.9839',
    },
    {
      id: 'hoabinh',
      name: 'Hòa Bình',
      provinceId: 'hoabinh',
      population: '0.1M',
      summary: 'Gateway to the Northwest, home to Muong culture.',
      highlight: 'Hoa Binh Hydropower Plant, Mai Chau valley nearby.',
      mapQuery: '20.8133,105.3383',
    },
    {
      id: 'phuly',
      name: 'Phủ Lý',
      provinceId: 'hanam',
      population: '0.16M',
      summary: 'Transport hub at the gateway to Hanoi.',
      highlight: 'Tam Chuc Pagoda complex nearby.',
      mapQuery: '20.5411,105.9147',
    },
    {
      id: 'hungyen',
      name: 'Hưng Yên',
      provinceId: 'hungyen',
      population: '0.1M',
      summary: 'Historic trading port of Pho Hien.',
      highlight: 'Pho Hien relic site, lotus ponds.',
      mapQuery: '20.6464,106.0511',
    },
    {
      id: 'haiduong',
      name: 'Hải Dương',
      provinceId: 'haiduong',
      population: '0.3M',
      summary: 'Center of Red River Delta culture and mung bean cakes.',
      highlight: 'Con Son - Kiep Bac complex.',
      mapQuery: '20.9394,106.3139',
    },
    {
      id: 'namdinh',
      name: 'Nam Định',
      provinceId: 'namdinh',
      population: '0.25M',
      summary: 'Cradle of the Tran Dynasty and traditional churches.',
      highlight: 'Tran Temple, Phu Day complex.',
      mapQuery: '20.4179,106.1689',
    },
    {
      id: 'thaibinh',
      name: 'Thái Bình',
      provinceId: 'thaibinh',
      population: '0.2M',
      summary: 'Rice granary of the North.',
      highlight: 'Keo Pagoda, Dong Chau beach.',
      mapQuery: '20.4463,106.3366',
    },
    {
      id: 'ninhbinh',
      name: 'Ninh Bình',
      provinceId: 'ninhbinh',
      population: '0.13M',
      summary: 'Famous for "Halong Bay on land".',
      highlight: 'Trang An, Tam Coc, Bai Dinh Pagoda.',
      mapQuery: '20.2545,105.9751',
    },
    {
      id: 'thanhhoa',
      name: 'Thanh Hóa',
      provinceId: 'thanhhoa',
      population: '0.4M',
      summary: 'Large province bridging North and Central Vietnam.',
      highlight: 'Sam Son beach, Citadel of the Ho Dynasty.',
      mapQuery: '19.8067,105.7768',
    },
    {
      id: 'vinh',
      name: 'Vinh',
      provinceId: 'nghean',
      population: '0.5M',
      summary: 'Hometown of President Ho Chi Minh.',
      highlight: 'Kim Lien relic site, Cua Lo beach.',
      mapQuery: '18.6734,105.6867',
    },
  ],
  central: [
    {
      id: 'danang',
      name: 'Đà Nẵng',
      provinceId: 'danang',
      population: '1.3M',
      summary: 'Modern beach city between Hải Vân Pass and Marble Mountains.',
      highlight: 'Dragon Bridge fire show, Mỹ Khê sunrise walks.',
      mapQuery: '16.0544,108.2022',
    },
    {
      id: 'hue',
      name: 'Huế',
      provinceId: 'tthue',
      population: '0.65M',
      summary: 'Imperial citadel and poetic Perfume River setting.',
      highlight: 'Royal tombs, vegetarian royal cuisine.',
      mapQuery: '16.4637,107.5909',
    },
    {
      id: 'nhatrang',
      name: 'Nha Trang',
      provinceId: 'khanhhoa',
      population: '0.54M',
      summary: 'Coastal getaway with islands and vibrant nightlife.',
      highlight: 'Hon Mun coral reefs, seafood night markets.',
      mapQuery: '12.2388,109.1967',
    },
    {
      id: 'hatinh',
      name: 'Hà Tĩnh',
      provinceId: 'hatinh',
      population: '0.1M',
      summary: 'Land of poets and historic sites.',
      highlight: 'Dong Loc Junction, Thien Cam beach.',
      mapQuery: '18.3427,105.9058',
    },
    {
      id: 'donghoi',
      name: 'Đồng Hới',
      provinceId: 'quangbinh',
      population: '0.12M',
      summary: 'Gateway to the Kingdom of Caves.',
      highlight: 'Phong Nha - Ke Bang National Park, Nhat Le beach.',
      mapQuery: '17.4765,106.5984',
    },
    {
      id: 'dongha',
      name: 'Đông Hà',
      provinceId: 'quangtri',
      population: '0.1M',
      summary: 'City rising from the ashes of war.',
      highlight: 'Vinh Moc Tunnels, Hien Luong Bridge.',
      mapQuery: '16.8053,107.0994',
    },
    {
      id: 'hoian',
      name: 'Hội An',
      provinceId: 'quangnam',
      population: '0.1M',
      summary: 'Ancient yellow-walled trading port.',
      highlight: 'Lantern festival, ancient town streets, tailoring.',
      mapQuery: '15.8801,108.3380',
    },
    {
      id: 'quangngai',
      name: 'Quảng Ngãi',
      provinceId: 'quangngai',
      population: '0.26M',
      summary: 'Coastal city with Ly Son island nearby.',
      highlight: 'Ly Son Island garlic fields, My Lai memorial.',
      mapQuery: '15.1205,108.7923',
    },
    {
      id: 'quynhon',
      name: 'Quy Nhơn',
      provinceId: 'binhdinh',
      population: '0.46M',
      summary: 'Martial arts land with pristine beaches.',
      highlight: 'Ky Co beach, Eo Gio, Cham towers.',
      mapQuery: '13.7820,109.2194',
    },
    {
      id: 'tuyhoa',
      name: 'Tuy Hòa',
      provinceId: 'phuyen',
      population: '0.2M',
      summary: 'Peaceful coastal city of "Yellow Flowers on Green Grass".',
      highlight: 'Ganh Da Dia basalt columns, Nghinh Phong tower.',
      mapQuery: '13.0882,109.3149',
    },
    {
      id: 'phanrang',
      name: 'Phan Rang',
      provinceId: 'ninhthuan',
      population: '0.17M',
      summary: 'Land of sun, wind, and Cham culture.',
      highlight: 'Po Klong Garai towers, vineyards, Vinh Hy Bay.',
      mapQuery: '11.5623,108.9933',
    },
    {
      id: 'phanthiet',
      name: 'Phan Thiết',
      provinceId: 'binhthuan',
      population: '0.23M',
      summary: 'Resort capital with sand dunes.',
      highlight: 'Mui Ne sand dunes, fairy stream, fish sauce.',
      mapQuery: '10.9805,108.2615',
    },
    {
      id: 'kontum',
      name: 'Kon Tum',
      provinceId: 'kontum',
      population: '0.17M',
      summary: 'Quiet highland city with wooden church.',
      highlight: 'Wooden Cathedral, Rong houses.',
      mapQuery: '14.3529,108.0000',
    },
    {
      id: 'pleiku',
      name: 'Pleiku',
      provinceId: 'gialai',
      population: '0.26M',
      summary: 'Mountain city famous for "Pleiku Eyes" lake.',
      highlight: 'T\'Nung Lake (Sea Lake), coffee plantations.',
      mapQuery: '13.9833,108.0000',
    },
    {
      id: 'buonmathuot',
      name: 'Buôn Ma Thuột',
      provinceId: 'daklak',
      population: '0.38M',
      summary: 'Coffee capital of Vietnam.',
      highlight: 'Coffee Museum, Dray Nur waterfall, elephant rides.',
      mapQuery: '12.6667,108.0500',
    },
    {
      id: 'gianghia',
      name: 'Gia Nghĩa',
      provinceId: 'daknong',
      population: '0.06M',
      summary: 'Young city in the M\'Nong plateau.',
      highlight: 'Ta Dung Lake, volcanic caves.',
      mapQuery: '11.9975,107.6955',
    },
    {
      id: 'dalat',
      name: 'Đà Lạt',
      provinceId: 'lamdong',
      population: '0.4M',
      summary: 'City of eternal spring and romance.',
      highlight: 'Xuan Huong Lake, flower gardens, french villas.',
      mapQuery: '11.9404,108.4583',
    },
  ],
  south: [
    {
      id: 'hochiminh',
      name: 'Hồ Chí Minh City',
      provinceId: 'hcm',
      population: '10.3M',
      summary: 'Vietnam’s economic engine and skyscraper skyline.',
      highlight: 'Nguyễn Huệ promenade, Saigon craft beer, hidden alleys.',
      mapQuery: '10.8231,106.6297',
    },
    {
      id: 'bienhoa',
      name: 'Biên Hòa',
      provinceId: 'dongnai',
      population: '1.2M',
      summary: 'Industrial hub along the Đồng Nai river.',
      highlight: 'Bửu Long pagoda, riverside garden cafés.',
      mapQuery: '10.9574,106.8427',
    },
    {
      id: 'vungtau',
      name: 'Vũng Tàu',
      provinceId: 'baria',
      population: '0.5M',
      summary: 'Coastal escape for southern city dwellers.',
      highlight: 'Christ of Vũng Tàu statue, Back Beach surf.',
      mapQuery: '10.3460,107.0843',
    },
    {
      id: 'thudaumot',
      name: 'Thủ Dầu Một',
      provinceId: 'binhduong',
      population: '0.3M',
      summary: 'Modern garden city and industrial center.',
      highlight: 'Hoi Khanh Pagoda, Dai Nam Wonderland.',
      mapQuery: '10.9805,106.6519',
    },
    {
      id: 'dongxoai',
      name: 'Đồng Xoài',
      provinceId: 'binhphuoc',
      population: '0.1M',
      summary: 'Rubber capital of the southeast.',
      highlight: 'Ba Ra Mountain, rubber forests.',
      mapQuery: '11.5333,106.8833',
    },
    {
      id: 'tayninh',
      name: 'Tây Ninh',
      provinceId: 'tayninh',
      population: '0.13M',
      summary: 'Holy land of Caodaism.',
      highlight: 'Cao Dai Holy See, Ba Den Mountain.',
      mapQuery: '11.3107,106.0983',
    },
    {
      id: 'tanan',
      name: 'Tân An',
      provinceId: 'longan',
      population: '0.15M',
      summary: 'Gateway between HCMC and the Mekong Delta.',
      highlight: 'Happyland, Vam Co Tay river.',
      mapQuery: '10.5375,106.4142',
    },
  ],
  mekong: [
    {
      id: 'cantho',
      name: 'Cần Thơ',
      provinceId: 'cantho',
      population: '1.2M',
      summary: 'Delta capital with bustling floating markets.',
      highlight: 'Cái Răng dawn boat trips, orchard homestays.',
      mapQuery: '10.0452,105.7469',
    },
    {
      id: 'mytho',
      name: 'Mỹ Tho',
      provinceId: 'tiengiang',
      population: '0.28M',
      summary: 'Launch point for canals and coconut candy villages.',
      highlight: 'Phoenix & Unicorn island sampan rides.',
      mapQuery: '10.3550,106.3475',
    },
    {
      id: 'rachgia',
      name: 'Rạch Giá',
      provinceId: 'kiengiang',
      population: '0.43M',
      summary: 'Ferry gateway to Phú Quốc and Nam Du archipelagos.',
      highlight: 'Nguyễn Trung Trực festival, sunset boardwalks.',
      mapQuery: '10.0119,105.0809',
    },
    {
      id: 'longxuyen',
      name: 'Long Xuyên',
      provinceId: 'angiang',
      population: '0.37M',
      summary: 'Prosperous city on the Hau River.',
      highlight: 'Floating market, memorial of President Ton Duc Thang.',
      mapQuery: '10.3759,105.4185',
    },
    {
      id: 'baclieu',
      name: 'Bạc Liêu',
      provinceId: 'baclieu',
      population: '0.15M',
      summary: 'Land of the "Prince of Bac Lieu" and wind farms.',
      highlight: 'Prince of Bac Lieu House, Wind Farm.',
      mapQuery: '9.2941,105.7278',
    },
    {
      id: 'bentre',
      name: 'Bến Tre',
      provinceId: 'bentre',
      population: '0.12M',
      summary: 'Kingdom of coconuts.',
      highlight: 'Coconut candy workshops, river ecotourism.',
      mapQuery: '10.2417,106.3750',
    },
    {
      id: 'camau',
      name: 'Cà Mau',
      provinceId: 'camau',
      population: '0.3M',
      summary: 'Southernmost city of Vietnam.',
      highlight: 'Cape Ca Mau, U Minh Ha forest.',
      mapQuery: '9.1769,105.1500',
    },
    {
      id: 'caolanh',
      name: 'Cao Lãnh',
      provinceId: 'dongthap',
      population: '0.16M',
      summary: 'Land of pink lotuses.',
      highlight: 'Xeo Quyt forest, Nguyen Sinh Sac tomb.',
      mapQuery: '10.4603,105.6328',
    },
    {
      id: 'vithanh',
      name: 'Vị Thanh',
      provinceId: 'haugiang',
      population: '0.07M',
      summary: 'Young city by the Xa No canal.',
      highlight: 'Xa No Park, pineapple fields.',
      mapQuery: '9.7833,105.4667',
    },
    {
      id: 'soctrang',
      name: 'Sóc Trăng',
      provinceId: 'soctrang',
      population: '0.14M',
      summary: 'Fusion of Khmer, Chinese, and Vietnamese cultures.',
      highlight: 'Bat Pagoda, Ngo Boat Race Festival.',
      mapQuery: '9.6033,105.9722',
    },
    {
      id: 'travinh',
      name: 'Trà Vinh',
      provinceId: 'travinh',
      population: '0.11M',
      summary: 'Green city with ancient trees and Khmer pagodas.',
      highlight: 'Ba Om Pond, Ang Pagoda.',
      mapQuery: '9.9347,106.3453',
    },
    {
      id: 'vinhlong',
      name: 'Vĩnh Long',
      provinceId: 'vinhlong',
      population: '0.14M',
      summary: 'Island orchards in the middle of the river.',
      highlight: 'An Binh Islet, Cai Be floating market nearby.',
      mapQuery: '10.2542,105.9722',
    },
  ],
}

