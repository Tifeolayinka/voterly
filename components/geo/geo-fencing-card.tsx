"use client"

import "mapbox-gl/dist/mapbox-gl.css"

import { useEffect, useRef, useState } from "react"
import mapboxgl, { type GeoJSONSource } from "mapbox-gl"
import type { Feature, Polygon } from "geojson"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Loader2, MapPin, Navigation, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GeoConfig {
  lat: number
  lng: number
  radiusMetres: number
  venueName: string
}

interface SearchResult {
  id: string
  place_name: string
  center: [number, number] // [lng, lat]
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""
const RADIUS_SOURCE = "radius-source"
const RADIUS_FILL = "radius-fill"
const RADIUS_LINE = "radius-line"
const RADIUS_PRESETS = [100, 150, 250] as const

// Default map centre: Lagos, Nigeria
const DEFAULT_LNG = 3.3792
const DEFAULT_LAT = 6.5244

function makeCircle(lng: number, lat: number, radiusM: number): Feature<Polygon> {
  const km = radiusM / 1000
  const distX = km / (111.32 * Math.cos((lat * Math.PI) / 180))
  const distY = km / 110.574
  const pts = 64
  const ring: [number, number][] = []
  for (let i = 0; i < pts; i++) {
    const θ = (i / pts) * 2 * Math.PI
    ring.push([lng + distX * Math.cos(θ), lat + distY * Math.sin(θ)])
  }
  ring.push(ring[0])
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [ring] },
    properties: {},
  }
}

function syncRadius(map: mapboxgl.Map, lng: number, lat: number, radiusM: number) {
  const data = makeCircle(lng, lat, radiusM)
  const src = map.getSource(RADIUS_SOURCE) as GeoJSONSource | undefined
  if (src) {
    src.setData(data)
  } else {
    map.addSource(RADIUS_SOURCE, { type: "geojson", data })
    map.addLayer({
      id: RADIUS_FILL,
      type: "fill",
      source: RADIUS_SOURCE,
      paint: { "fill-color": "#3b82f6", "fill-opacity": 0.12 },
    })
    map.addLayer({
      id: RADIUS_LINE,
      type: "line",
      source: RADIUS_SOURCE,
      paint: { "line-color": "#3b82f6", "line-width": 2, "line-dasharray": [2, 1] },
    })
  }
}

function addDraggableMarker(
  map: mapboxgl.Map,
  lng: number,
  lat: number,
  onDragEnd: (lng: number, lat: number) => void
): mapboxgl.Marker {
  const marker = new mapboxgl.Marker({ color: "#3b82f6", draggable: true })
    .setLngLat([lng, lat])
    .addTo(map)
  marker.on("dragend", () => {
    const pos = marker.getLngLat()
    onDragEnd(pos.lng, pos.lat)
  })
  return marker
}

export function GeoFencingCard({
  value,
  onChange,
}: {
  value: GeoConfig | null
  onChange: (v: GeoConfig | null) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  // Stable refs so map event handlers always see the latest values
  const onChangeRef = useRef(onChange)
  const radiusRef = useRef(value?.radiusMetres ?? 150)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])
  useEffect(() => {
    radiusRef.current = value?.radiusMetres ?? 150
  }, [value?.radiusMetres])

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locError, setLocError] = useState("")
  const [customRadius, setCustomRadius] = useState("")
  const [showCustom, setShowCustom] = useState(false)

  const radius = value?.radiusMetres ?? 150
  const isCustom = !RADIUS_PRESETS.includes(radius as (typeof RADIUS_PRESETS)[number])

  // ── Map initialisation (runs once after mount) ──────────────────────
  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: value ? [value.lng, value.lat] : [DEFAULT_LNG, DEFAULT_LAT],
      zoom: value ? 15 : 10,
    })

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: false }), "top-right")

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat
      onChangeRef.current({ lat, lng, radiusMetres: radiusRef.current, venueName: "" })
    })

    mapRef.current = map

    if (value) {
      const m = addDraggableMarker(map, value.lng, value.lat, (lng, lat) => {
        onChangeRef.current({ lat, lng, radiusMetres: radiusRef.current, venueName: "" })
      })
      markerRef.current = m
      map.once("load", () => syncRadius(map, value.lng, value.lat, value.radiusMetres))
    }

    const ro = new ResizeObserver(() => map.resize())
    ro.observe(containerRef.current!)

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Sync value changes to the map ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !value) return

    const update = () => {
      if (markerRef.current) {
        markerRef.current.setLngLat([value.lng, value.lat])
      } else {
        markerRef.current = addDraggableMarker(map, value.lng, value.lat, (lng, lat) => {
          onChangeRef.current({ lat, lng, radiusMetres: radiusRef.current, venueName: "" })
        })
      }
      syncRadius(map, value.lng, value.lat, value.radiusMetres)
      map.flyTo({ center: [value.lng, value.lat], zoom: 15 })
    }

    if (map.isStyleLoaded()) {
      update()
    } else {
      map.once("load", update)
    }
  }, [value?.lat, value?.lng, value?.radiusMetres]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced geocoding search ──────────────────────────────────────
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      if (!MAPBOX_TOKEN) return
      setSearching(true)
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=poi,address,place&limit=5`
        const res = await fetch(url)
        const data = await res.json()
        setResults(data.features ?? [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  function handleSelectResult(r: SearchResult) {
    const [lng, lat] = r.center
    setQuery(r.place_name)
    setResults([])
    onChange({ lat, lng, radiusMetres: radius, venueName: r.place_name })
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.")
      return
    }
    setGettingLocation(true)
    setLocError("")
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGettingLocation(false)
        setQuery("My Location")
        onChange({
          lat: coords.latitude,
          lng: coords.longitude,
          radiusMetres: radius,
          venueName: "My Location",
        })
      },
      () => {
        setGettingLocation(false)
        setLocError(
          "Location access denied. Please allow it in your browser settings."
        )
      },
      { timeout: 10_000 }
    )
  }

  function applyCustomRadius() {
    const r = parseInt(customRadius)
    if (!value || isNaN(r) || r < 50 || r > 5000) return
    onChange({ ...value, radiusMetres: r })
    setShowCustom(false)
    setCustomRadius("")
  }

  // ── No token fallback ───────────────────────────────────────────────
  if (!MAPBOX_TOKEN) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-destructive font-medium">Mapbox token required</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add{" "}
          <code className="font-mono text-xs bg-muted px-1 rounded">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{" "}
          to{" "}
          <code className="font-mono text-xs bg-muted px-1 rounded">.env.local</code> to
          enable geo-fencing configuration.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Venue search */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search for a venue or address…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {query && !searching && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setResults([])
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectResult(r)}
                className="flex items-start gap-2.5 w-full px-3 py-2.5 text-left hover:bg-accent transition-colors"
              >
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm">{r.place_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Use my location + current location display */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={handleUseLocation}
          disabled={gettingLocation}
        >
          {gettingLocation ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Navigation className="h-3.5 w-3.5" />
          )}
          Use my location
        </Button>
        {!value && (
          <p className="text-xs text-muted-foreground">
            or click anywhere on the map to drop a pin
          </p>
        )}
        {value && (
          <p className="text-xs text-muted-foreground truncate max-w-xs">
            <MapPin className="inline h-3 w-3 mr-0.5" />
            {value.venueName || `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`}
          </p>
        )}
      </div>

      {locError && <p className="text-xs text-destructive">{locError}</p>}

      {/* Map */}
      <div
        ref={containerRef}
        className="w-full h-64 rounded-xl overflow-hidden border border-border"
      />

      {/* Radius selector */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Radius
        </Label>
        <div className="flex flex-wrap items-center gap-2">
          {RADIUS_PRESETS.map((r) => (
            <button
              key={r}
              type="button"
              disabled={!value}
              onClick={() => {
                if (value) onChange({ ...value, radiusMetres: r })
                setShowCustom(false)
              }}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40",
                radius === r && !showCustom
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent/50"
              )}
            >
              {r}m
            </button>
          ))}
          <button
            type="button"
            disabled={!value}
            onClick={() => setShowCustom((v) => !v)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40",
              showCustom || (isCustom && !!value)
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:bg-accent/50"
            )}
          >
            {isCustom && value ? `${radius}m` : "Custom"}
          </button>
        </div>

        {showCustom && (
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="number"
              placeholder="50–5000"
              value={customRadius}
              onChange={(e) => setCustomRadius(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyCustomRadius()}
              className="w-28 h-8 text-sm"
              min={50}
              max={5000}
            />
            <span className="text-xs text-muted-foreground">metres</span>
            <Button size="sm" onClick={applyCustomRadius}>
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* GPS drift advisory */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/40 border border-border p-3">
        <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          GPS accuracy varies by device and environment. Indoor venues may experience
          drift of 10–50m. Consider a larger radius to reduce false rejections.
        </p>
      </div>
    </div>
  )
}
