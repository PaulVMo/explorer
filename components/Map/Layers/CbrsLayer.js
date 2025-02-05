import { memo, useMemo } from 'react'
import { GeoJSONLayer } from 'react-mapbox-gl'
import { emptyGeoJSON } from '../../../utils/location'
import { h3ToGeo } from 'h3-js'
import { h3SetToFeatureCollection } from 'geojson2h3'
import geoJSON from 'geojson'
import useSelectedHex from '../../../hooks/useSelectedHex'

const CbrsLayer = ({ minZoom, maxZoom, onClick }) => {
  const { selectedHex } = useSelectedHex()

  const cbrsData = useMemo(() => {
    try {
      return require('../../../data/cbrs.csv')
    } catch (e) {
      return null
    }
  }, [])

  const cbrsHexGeo = useMemo(() => {
    if (!cbrsData) return emptyGeoJSON

    return h3SetToFeatureCollection(cbrsData[0])
  }, [cbrsData])

  const cbrsPointGeo = useMemo(() => {
    if (!cbrsData) return emptyGeoJSON

    const formattedData = cbrsData[0].map((res8Hex) => {
      const coords = h3ToGeo(res8Hex)
      return {
        lat: coords[0],
        lng: coords[1],
      }
    })

    return geoJSON.parse(formattedData, {
      Point: ['lat', 'lng'],
      include: ['height'],
    })
  }, [])

  const hexStyle = useMemo(
    () => ({
      'fill-color': '#D23E72',
      'fill-opacity': [
        'interpolate',
        ['exponential', 1.75],
        ['zoom'],
        minZoom,
        1,
        maxZoom,
        0.6,
      ],
    }),
    [maxZoom, minZoom],
  )

  const pointStyle = useMemo(
    () => ({
      'circle-color': '#D23E72',
      'circle-radius': {
        stops: [
          [minZoom, 2],
          [maxZoom, 5],
        ],
      },
      'circle-opacity': [
        'interpolate',
        ['exponential', 1],
        ['zoom'],
        minZoom,
        0.3,
        maxZoom,
        0,
      ],
    }),
    [maxZoom, minZoom],
  )

  return (
    <>
      <GeoJSONLayer
        id="cbrsHex"
        data={cbrsHexGeo}
        fillPaint={hexStyle}
        fillOnClick={onClick}
      />
      <GeoJSONLayer
        id="cbrsPoint"
        data={cbrsPointGeo}
        circlePaint={pointStyle}
      />
      <GeoJSONLayer
        data={selectedHex?.feature || emptyGeoJSON}
        linePaint={{
          'line-color': '#ffffff',
          'line-width': 4,
        }}
      />
    </>
  )
}

export default memo(CbrsLayer)
