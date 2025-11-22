// Map Google Places administrative_area_level_1 to our internal province IDs
export const GOOGLE_PROVINCE_MAP: Record<string, string> = {
    'Thành phố Hà Nội': 'hanoi',
    'Hà Nội': 'hanoi',
    'Hanoi': 'hanoi',
    'Thành phố Hồ Chí Minh': 'hcm',
    'Hồ Chí Minh': 'hcm',
    'Ho Chi Minh City': 'hcm',
    'Thành phố Đà Nẵng': 'danang',
    'Đà Nẵng': 'danang',
    'Da Nang': 'danang',
    'Thành phố Hải Phòng': 'haiphong',
    'Hải Phòng': 'haiphong',
    'Hai Phong': 'haiphong',
    'Thành phố Cần Thơ': 'cantho',
    'Cần Thơ': 'cantho',
    'Can Tho': 'cantho',
    'Tỉnh Thừa Thiên Huế': 'tthue',
    'Thừa Thiên Huế': 'tthue',
    'Thua Thien Hue': 'tthue',
    'Tỉnh Quảng Nam': 'quangnam',
    'Quảng Nam': 'quangnam',
    'Quang Nam': 'quangnam',
    'Tỉnh Khánh Hòa': 'khanhhoa',
    'Khánh Hòa': 'khanhhoa',
    'Khanh Hoa': 'khanhhoa',
    'Tỉnh Lâm Đồng': 'lamdong',
    'Lâm Đồng': 'lamdong',
    'Lam Dong': 'lamdong',
    'Tỉnh Quảng Ninh': 'quangninh',
    'Quảng Ninh': 'quangninh',
    'Quang Ninh': 'quangninh',
    'Tỉnh Lào Cai': 'laocai',
    'Lào Cai': 'laocai',
    'Lao Cai': 'laocai',
    'Tỉnh Kiên Giang': 'kiengiang',
    'Kiên Giang': 'kiengiang',
    'Kien Giang': 'kiengiang',
    'Tỉnh Bà Rịa - Vũng Tàu': 'baria',
    'Bà Rịa - Vũng Tàu': 'baria',
    'Ba Ria - Vung Tau': 'baria',
    'Tỉnh Bình Thuận': 'binhthuan',
    'Bình Thuận': 'binhthuan',
    'Binh Thuan': 'binhthuan',
    'Tỉnh Ninh Bình': 'ninhbinh',
    'Ninh Bình': 'ninhbinh',
    'Ninh Binh': 'ninhbinh',
    'Tỉnh Hà Giang': 'hagiang',
    'Hà Giang': 'hagiang',
    'Ha Giang': 'hagiang',
    'Tỉnh Cao Bằng': 'caobang',
    'Cao Bằng': 'caobang',
    'Cao Bang': 'caobang',
    // Add more as needed, focusing on major tourist destinations first
};

export function normalizeProvinceName(googleProvinceName: string): string | null {
    if (!googleProvinceName) return null;

    // Direct lookup
    if (GOOGLE_PROVINCE_MAP[googleProvinceName]) {
        return GOOGLE_PROVINCE_MAP[googleProvinceName];
    }

    // Try to normalize: remove "Tỉnh", "Thành phố", trim, lowercase
    const cleanName = googleProvinceName
        .replace(/^(Tỉnh|Thành phố)\s+/i, '')
        .trim();

    // Search in values (if we had a reverse map) or keys
    // For now, simple lookup is safer to avoid false positives

    return GOOGLE_PROVINCE_MAP[cleanName] || null;
}
