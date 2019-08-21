import React, { useState, useEffect } from 'react';
import { Map as LeafletMap, TileLayer, GeoJSON } from 'react-leaflet';
import colormap from 'colormap';

const AffordabilityMap = props => {

    const numberOfBins = 72;
    const colorMap = 'portland';
      
    let colors = colormap({
      colormap: colorMap,
      nshades: numberOfBins,
      format: 'hex',
      alpha: 1
    });

    // console.log('INSIDE MAP COMPONENT')
    // console.log(props.data)
    // console.log(props.geojson)

    return (
        <LeafletMap
          key={'leaflet-map'}
          center={[33.8, -84.4]}
          zoom={9}
          maxZoom={18}
          attributionControl={true}
          zoomControl={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={true}
          animate={false}
          // easeLinearity={0.7}
        >

        { props.geojson && props.data ?
          <GeoJSON
          key={'affordabily-layer'}
          data={props.geojson}
          
          style={feature => {

            const minValue = 10;
            const maxValue = 50;
            const geoid = parseInt(feature.properties['GEOID'])
            // console.log(geoid);
            const tractDataObj = props.data.find(tract => geoid === tract['Census Tract']);
            // console.log(tractDataObj)
            const value = tractDataObj ? tractDataObj['Percent of Income'] : null;
            const distFromMin = value - minValue;
            const range = maxValue - minValue;
            const binningRatio = distFromMin/range;
            const indexRange = numberOfBins - 1;
    
            const color = value ? colors[Math.floor(value === 0 ? 0 : binningRatio * indexRange)] : null;

            return ({
                color: value < minValue ? colors[0] : value > maxValue ? colors[colors.length -1] : color,
                weight: 1,
                fillColor: value < minValue ? colors[0] : value > maxValue ? colors[colors.length -1] : color,
                fillOpacity: value ? 1 : 0
            })
          }}
        /> : null
        }

          <TileLayer
          key={'tile-layer-default'}
          // url='https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
         
    
        </LeafletMap>
    
      );
}

export default AffordabilityMap;