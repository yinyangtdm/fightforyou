const N = {
  bg:      "#2E3440",
  dark:    "#3B4252",
  mid:     "#434C5E",
  light:   "#4C566A",
  text:    "#D8DEE9",
  textDim: "#4C566A",
  blue:    "#5E81AC",
  blueMid: "#81A1C1",
  teal:    "#88C0D0",
  green:   "#A3BE8C",
  water:   "#3B4252",
}

const nordMapStyle = {
  version: 8 as const,
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}",
  sprite: "mapbox://sprites/mapbox/dark-v11",
  sources: {
    "mapbox-streets": {
      type: "vector" as const,
      url: "mapbox://mapbox.mapbox-streets-v8",
    },
  },
  layers: [
    { id: "background", type: "background" as const,
      paint: { "background-color": N.bg } },

    { id: "landcover", type: "fill" as const, source: "mapbox-streets", "source-layer": "landcover",
      paint: { "fill-color": N.dark, "fill-opacity": 0.5 } },

    { id: "landuse-park", type: "fill" as const, source: "mapbox-streets", "source-layer": "landuse",
      filter: ["match", ["get", "class"], ["park", "pitch", "playground", "cemetery", "grass"], true, false],
      paint: { "fill-color": "#3a4a3a" } },

    { id: "water", type: "fill" as const, source: "mapbox-streets", "source-layer": "water",
      paint: { "fill-color": N.water } },

    { id: "waterway", type: "line" as const, source: "mapbox-streets", "source-layer": "waterway",
      paint: { "line-color": N.water, "line-width": 1 } },

    { id: "road-path", type: "line" as const, source: "mapbox-streets", "source-layer": "road",
      filter: ["match", ["get", "class"], ["path", "pedestrian", "footway"], true, false],
      layout: { "line-cap": "round" as const, "line-join": "round" as const },
      paint: { "line-color": N.mid, "line-width": 1, "line-dasharray": [2, 2] } },

    { id: "road-service", type: "line" as const, source: "mapbox-streets", "source-layer": "road",
      filter: ["match", ["get", "class"], ["service", "driveway"], true, false],
      layout: { "line-cap": "round" as const, "line-join": "round" as const },
      paint: { "line-color": N.mid, "line-width": 1 } },

    { id: "road-street", type: "line" as const, source: "mapbox-streets", "source-layer": "road",
      filter: ["match", ["get", "class"], ["street", "street_limited"], true, false],
      layout: { "line-cap": "round" as const, "line-join": "round" as const },
      paint: { "line-color": N.light, "line-width": ["interpolate", ["linear"], ["zoom"], 12, 1, 16, 3] } },

    { id: "road-secondary", type: "line" as const, source: "mapbox-streets", "source-layer": "road",
      filter: ["match", ["get", "class"], ["secondary", "tertiary"], true, false],
      layout: { "line-cap": "round" as const, "line-join": "round" as const },
      paint: { "line-color": N.light, "line-width": ["interpolate", ["linear"], ["zoom"], 12, 1.5, 16, 4] } },

    { id: "road-primary", type: "line" as const, source: "mapbox-streets", "source-layer": "road",
      filter: ["match", ["get", "class"], ["primary"], true, false],
      layout: { "line-cap": "round" as const, "line-join": "round" as const },
      paint: { "line-color": N.blue, "line-width": ["interpolate", ["linear"], ["zoom"], 12, 2, 16, 5] } },

    { id: "road-motorway", type: "line" as const, source: "mapbox-streets", "source-layer": "road",
      filter: ["match", ["get", "class"], ["motorway", "trunk"], true, false],
      layout: { "line-cap": "round" as const, "line-join": "round" as const },
      paint: { "line-color": N.teal, "line-width": ["interpolate", ["linear"], ["zoom"], 12, 2.5, 16, 7] } },

    { id: "building", type: "fill" as const, source: "mapbox-streets", "source-layer": "building",
      paint: { "fill-color": N.dark, "fill-outline-color": N.mid } },

    { id: "road-label", type: "symbol" as const, source: "mapbox-streets", "source-layer": "road",
      layout: { "text-field": ["get", "name"], "text-size": 11,
        "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
        "symbol-placement": "line" as const, "text-max-angle": 30 },
      paint: { "text-color": N.textDim, "text-halo-color": N.bg, "text-halo-width": 1 } },

    { id: "place-neighborhood", type: "symbol" as const, source: "mapbox-streets", "source-layer": "place_label",
      filter: ["match", ["get", "class"], ["neighbourhood", "suburb", "district"], true, false],
      layout: { "text-field": ["get", "name"], "text-size": 11,
        "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
        "text-transform": "uppercase" as const, "text-letter-spacing": 0.1 },
      paint: { "text-color": N.textDim, "text-halo-color": N.bg, "text-halo-width": 1 } },

    { id: "place-city", type: "symbol" as const, source: "mapbox-streets", "source-layer": "place_label",
      filter: ["match", ["get", "class"], ["city", "town", "village"], true, false],
      layout: { "text-field": ["get", "name"], "text-size": 14,
        "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"] },
      paint: { "text-color": N.text, "text-halo-color": N.bg, "text-halo-width": 1.5 } },

    { id: "poi-label", type: "symbol" as const, source: "mapbox-streets", "source-layer": "poi_label",
      layout: { "text-field": ["get", "name"], "text-size": 10,
        "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
        "text-anchor": "top" as const, "text-offset": [0, 0.5], "text-max-width": 8 },
      paint: { "text-color": N.blueMid, "text-halo-color": N.bg, "text-halo-width": 1 } },
  ],
}

export default nordMapStyle
