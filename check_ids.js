Object.values(regionCities).forEach(cities => {
    cities.forEach(city => {
        regionCityProvinceIds.add(city.provinceId);
    });
});

const missingInMap = [...regionCityProvinceIds].filter(id => !mapProvinceIds.has(id));
const missingInCities = [...mapProvinceIds].filter(id => !regionCityProvinceIds.has(id));

console.log("Province IDs in regions.ts but NOT in SVG map:", missingInMap);
console.log("Province IDs in SVG map but NOT in regions.ts:", missingInCities);
