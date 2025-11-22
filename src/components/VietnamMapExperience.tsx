import { useEffect, useMemo, useRef, useState } from 'react'
import type { CityInfo, RegionDefinition, RegionId } from '../data/regions'
import { provinces, regionCities, regions, vietnamViewBox } from '../data/regions'
import { cityDetails } from '../data/cityDetails'
import CityMap from './CityMap'

const parseViewBox = (viewBox: string): { minX: number; minY: number; width: number; height: number } => {
  const [minX, minY, width, height] = viewBox.split(' ').map(Number)
  return { minX, minY, width, height }
}

const getOverlayStyle = (
  point: [number, number],
  viewBoxMeta: ReturnType<typeof parseViewBox>
) => {
  const left = ((point[0] - viewBoxMeta.minX) / viewBoxMeta.width) * 100
  const top = ((point[1] - viewBoxMeta.minY) / viewBoxMeta.height) * 100
  return {
    left: `${left}%`,
    top: `${top}%`,
  }
}

const regionLookup: Record<RegionId, RegionDefinition> = regions.reduce(
  (acc, region) => {
    acc[region.id] = region
    return acc
  },
  {} as Record<RegionId, RegionDefinition>
)

const citiesByProvince = (() => {
  const lookup = new Map<string, CityInfo>()
  Object.values(regionCities).forEach((cityList) => {
    cityList.forEach((city) => {
      lookup.set(city.provinceId, city)
    })
  })
  return lookup
})()

export type { RegionId } from '../data/regions'

interface VietnamMapExperienceProps {
  activeRegion: RegionId | null
  onRegionSelect: (regionId: RegionId | null) => void
}

const VietnamMapExperience = ({ activeRegion, onRegionSelect }: VietnamMapExperienceProps) => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null)
  // const [activeRegion, setActiveRegion] = useState<RegionId | null>(null) // Lifted up
  const [selectedCity, setSelectedCity] = useState<CityInfo | null>(null)
  const [hoveredCity, setHoveredCity] = useState<CityInfo | null>(null)
  const [isPopupDimmed, setIsPopupDimmed] = useState(false)
  const selectedPopupRef = useRef<HTMLDivElement>(null)

  const vietnamView = useMemo(() => parseViewBox(vietnamViewBox), [])
  const provinceLookup = useMemo(() => {
    const map = new Map<string, (typeof provinces)[number]>()
    provinces.forEach((province) => {
      map.set(province.id, province)
    })
    return map
  }, [])

  useEffect(() => {
    setSelectedCity(null)
  }, [activeRegion])

  const mapSrc = useMemo(() => {
    if (selectedCity) {
      const query = selectedCity.mapQuery ?? `${selectedCity.name}, Vietnam`
      return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
    }

    if (activeRegion) {
      const region = regionLookup[activeRegion]
      if (region) {
        const query = region.mapQuery ?? `${region.name}, Vietnam`
        const zoomParam = region.mapZoom ? `&z=${region.mapZoom}` : ''
        return `https://www.google.com/maps?q=${encodeURIComponent(query)}${zoomParam}&output=embed`
      }
      return `https://www.google.com/maps?q=${encodeURIComponent('Vietnam')}&output=embed`
    }

    return `https://www.google.com/maps?q=${encodeURIComponent('Vietnam')}&output=embed`
  }, [selectedCity, activeRegion])

  const overviewPaths = useMemo(() => {
    return provinces.map((province) => {
      const region = regionLookup[province.regionId]
      const dimmed = hoveredRegion && hoveredRegion !== province.regionId
      return (
        <path
          key={`overview-${province.id}`}
          d={province.path}
          fill={region.color}
          stroke={region.color}
          strokeWidth={0.8}
          opacity={dimmed ? 0.35 : 0.9}
          className="map-province"
          onMouseEnter={() => setHoveredRegion(province.regionId)}
          onMouseLeave={() => setHoveredRegion(null)}
          onFocus={() => setHoveredRegion(province.regionId)}
          onBlur={() => setHoveredRegion(null)}
          onClick={() => {
            onRegionSelect(province.regionId)
            setHoveredRegion(null)
          }}
        />
      )
    })
  }, [hoveredRegion])

  const activeRegionDefinition = activeRegion ? regionLookup[activeRegion] : null
  const hoveredRegionDefinition = hoveredRegion ? regionLookup[hoveredRegion] : null

  const detailPaths = useMemo(() => {
    if (!activeRegionDefinition) {
      return null
    }

    return provinces.map((province) => {
      const inRegion = province.regionId === activeRegionDefinition.id
      const cityFromProvince = citiesByProvince.get(province.id)
      const isSelected = selectedCity?.provinceId === province.id
      const isHovered = hoveredCity?.provinceId === province.id
      const isDimmed = (hoveredCity || selectedCity) && !isHovered && inRegion && !isSelected

      // Determine target region for out-of-region clicks
      const targetRegion = province.regionId

      return (
        <path
          key={`detail-${province.id}`}
          d={province.path}
          fill={inRegion ? activeRegionDefinition.color : '#132033'}
          // Make out-of-region provinces slightly more visible (0.4) to indicate interactivity
          opacity={isDimmed ? 0.5 : inRegion ? 0.94 : 0.4}
          stroke={inRegion ? '#041120' : '#03070f'}
          strokeWidth={inRegion ? (isSelected || isHovered ? 2 : 1) : 0.7}
          // Always clickable now
          className={`map-province is-clickable ${isSelected ? 'is-selected' : ''}`}
          onMouseEnter={
            inRegion && cityFromProvince ? () => setHoveredCity(cityFromProvince) : undefined
          }
          onMouseLeave={inRegion ? () => setHoveredCity(null) : undefined}
          onClick={() => {
            if (inRegion && cityFromProvince) {
              setSelectedCity(cityFromProvince)
              setHoveredCity(null)
            } else if (!inRegion) {
              // Switch to the clicked province's region
              onRegionSelect(targetRegion)
              setHoveredRegion(null)
            }
          }}
        />
      )
    })
  }, [activeRegionDefinition, selectedCity, hoveredCity, onRegionSelect])

  const renderOverview = () => (
    <div className="w-full h-full flex flex-col">
      <div className="map-wrapper flex-1">
        <div className="map-split">
          <div className="map-pane map-pane--main">
            <svg viewBox={vietnamViewBox} className="vietnam-map overview" role="img">
              <title>Vietnam map overview by macro region</title>
              {overviewPaths}
            </svg>
            {hoveredRegionDefinition && (
              <div
                className="map-overlay"
                style={getOverlayStyle(hoveredRegionDefinition.labelPosition, vietnamView)}
              >
                <p className="map-overlay__title">{hoveredRegionDefinition.name}</p>
              </div>
            )}
          </div>
          <div className="map-pane map-pane--embed">
            <iframe
              title="Google Maps - Việt Nam / vùng đang xem"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  )

  useEffect(() => {
    if (!selectedCity) {
      setIsPopupDimmed(false)
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (selectedPopupRef.current) {
        const rect = selectedPopupRef.current.getBoundingClientRect()
        const isOver =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        setIsPopupDimmed(isOver)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [selectedCity])

  const renderDetail = () => {
    if (!activeRegionDefinition) {
      return null
    }

    const regionViewMeta = parseViewBox(activeRegionDefinition.viewBox)

    const selectedCityProvince = selectedCity
      ? provinceLookup.get(selectedCity.provinceId)
      : null

    const hoveredCityProvince = hoveredCity ? provinceLookup.get(hoveredCity.provinceId) : null

    return (
      <div className="w-full h-full flex flex-col relative">
        <button
          className="ghost-button absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm hover:bg-black/70"
          onClick={() => onRegionSelect(null)}
        >
          ← Trở về toàn quốc
        </button>

        <div className="map-wrapper flex-1">
          <div className="map-split">
            <div className="map-pane map-pane--main">
              <svg viewBox={activeRegionDefinition.viewBox} className="vietnam-map detail" role="img">
                <title>Zoomed view for {activeRegionDefinition.name}</title>
                {detailPaths}
              </svg>
              {hoveredCity && hoveredCityProvince && hoveredCity.id !== selectedCity?.id && (
                <div
                  className="map-overlay map-overlay--city"
                  style={getOverlayStyle(hoveredCityProvince.centroid, regionViewMeta)}
                >
                  <p className="map-overlay__title">{hoveredCity.name}</p>
                </div>
              )}
              {selectedCity && selectedCityProvince && (() => {
                const regionCenter = {
                  x: regionViewMeta.minX + regionViewMeta.width / 2,
                  y: regionViewMeta.minY + regionViewMeta.height / 2,
                }
                const cityCenter = {
                  x: selectedCityProvince.centroid[0],
                  y: selectedCityProvince.centroid[1],
                }

                const isLeft = cityCenter.x < regionCenter.x
                const isTop = cityCenter.y < regionCenter.y

                // Place popup in the opposite quadrant, anchored near the center
                const style: React.CSSProperties = {
                  position: 'absolute',
                  maxWidth: '220px',
                  transition: 'all 0.3s ease',
                  opacity: isPopupDimmed ? 0.4 : 1,
                  transform: 'none',
                  zIndex: 10,
                  // If city is Left, popup goes Right (starts at 55% from Left). 
                  // If city is Right, popup goes Left (starts at 55% from Right).
                  left: isLeft ? '55%' : 'auto',
                  right: isLeft ? 'auto' : '55%',
                  // If city is Top, popup goes Bottom (starts at 55% from Top).
                  // If city is Bottom, popup goes Top (starts at 55% from Bottom).
                  top: isTop ? '55%' : 'auto',
                  bottom: isTop ? 'auto' : '55%',
                }

                return (
                  <div
                    ref={selectedPopupRef}
                    className="map-overlay map-overlay--city map-overlay--selected"
                    style={style}
                  >
                    <p className="map-overlay__title">{selectedCity.name}</p>
                  </div>
                )
              })()}
            </div>
            <div className="map-pane map-pane--embed">
              {selectedCity && cityDetails[selectedCity.id] ? (
                <CityMap cityId={selectedCity.id} details={cityDetails[selectedCity.id]} />
              ) : (
                <iframe
                  title={
                    selectedCity
                      ? `Bản đồ ${selectedCity.name}`
                      : `Google Maps - ${activeRegionDefinition.name}`
                  }
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="experience w-full h-full p-4">
      {activeRegion ? renderDetail() : renderOverview()}
    </section>
  )
}

export default VietnamMapExperience

