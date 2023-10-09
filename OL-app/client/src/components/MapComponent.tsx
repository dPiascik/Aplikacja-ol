import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';
import jsonFilePath from '../assets/raceTrack.json';
import { GeoJSONFeature} from 'ol/format/GeoJSON';
import {Point} from 'ol/geom';
import { iconStyle, polygonStyle } from '../style/MapStyle';
import { Coordinate } from 'ol/coordinate';
import { MapControls } from './MapControls';
import { PositionData, SendDataToServer } from '../Models';
import { Extent } from 'ol/extent';

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<Map| null>(null);
  const [popupContent, setPopupContent] = useState<string>('');
  const [isGeoJSONLoaded, setIsGeoJSONLoaded] = useState<boolean>(false);
  const isAnimating = useRef<boolean>(false);
  const timerId = useRef<ReturnType<typeof setInterval>>();
  const currentIndex = useRef<number>(0);
  let [geojson, setGeoJSON] = useState<GeoJSONFeature>(null); 
  const [delay, setDelay] = useState<number>(50);
  const isIntervalRunning = useRef<boolean>(false);
  const outsideInfoRef = useRef<HTMLDivElement>(null);
  const vectorSourceRef = useRef<VectorSource>(new VectorSource());


  useEffect(() => {
    resetMapState();
    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      zIndex: 10,
    });
  
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(jsonFilePath, {
        featureProjection: 'EPSG:3857',
      }),
    });
    map.current = new Map({
      target: mapRef.current as HTMLElement,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        polygonLayer, vectorLayer
      ],
      view: new View({
        center: [0, 0],
        zoom: 1.5,
      }),
    });
    
    map.current.getView().fit(vectorSource.getExtent(), map.current.getSize() as any);
    return () => {
      map.current?.setTarget(undefined);
    };
  }, []);


  const resetMapState = () => {
    isAnimating.current = false;
    vectorSourceRef.current?.clear();
    clearInterval(timerId.current)
    currentIndex.current = 0;
  };

  const startInterval = () => {
    if (isGeoJSONLoaded && isAnimating.current == false && currentIndex.current != geojson.features.length - 1) {
      timerId.current = setInterval(updateFeature, delay);
      isAnimating.current = true;
      isIntervalRunning.current = true;
    }
    
  };

  const pauseInterval = () => {
    if (isAnimating.current === true) {
      clearInterval(timerId.current);
      isAnimating.current = false;
      isIntervalRunning.current = false;
    }
  };

  const restartAnimation = () => {
    resetMapState();
  };


  const polygonSource = new VectorSource({
    features: new GeoJSON().readFeatures(jsonFilePath, {
      featureProjection: 'EPSG:3857',
    }),
  });

  const polygonLayer = new VectorLayer({
    source: polygonSource,
    style: polygonStyle
  });

  const handleLoadGeoJSON = (file: File, delay: number) => {
    resetMapState();
    if (outsideInfoRef.current) {
      outsideInfoRef.current.innerHTML = '';
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const geojson = JSON.parse(e.target?.result as string);
        setGeoJSON(geojson);
        setIsGeoJSONLoaded(true);
      } catch (error) {
        console.error('Error parsing GeoJSON:', error);
      }
    };
    reader.readAsText(file);
  };

  function calculateAzimuth(currentCoords: Coordinate, nextCoords: Coordinate) {;
    const toDegrees = (radian: number): number => radian * (180 / Math.PI);
  
    const dx = nextCoords[0] - currentCoords[0];
    const dy = nextCoords[1] - currentCoords[1];

    let azimuth = toDegrees(Math.atan2(dy, dx));

    if (azimuth < 0) {
      azimuth += 360;
  }

    return azimuth;
  }

 
  const updateFeature = () => {
    
    if (geojson && geojson.features && currentIndex.current < geojson.features.length - 1) {
      vectorSourceRef.current.clear();
      const currentFeature = new GeoJSON().readFeature(geojson.features[currentIndex.current], {
        featureProjection: 'EPSG:3857',
      });
      const destlat = new GeoJSON().readFeature(geojson.features[currentIndex.current+1], {
        featureProjection: 'EPSG:3857',
      });
      
      const azimuth = calculateAzimuth((currentFeature.getGeometry() as Point).getCoordinates(), (destlat.getGeometry() as Point).getCoordinates());
     
      let isOutside: boolean = true;
      if(polygonLayer == null){return}

      polygonLayer.getSource()?.getFeatures().forEach((polygonFeature) => {
        if (polygonFeature.getGeometry()?.intersectsCoordinate((currentFeature.getGeometry() as Point).getCoordinates())) {
          isOutside = false;
        }
      })
  
      if (isOutside) {
        const currentCoordinates = (currentFeature.getGeometry() as Point).getCoordinates();
        
          const [lon, lat] = (currentFeature.getGeometry() as Point).getCoordinates();
          const dataToSave: PositionData = {
            latitude: lat,
            longitude: lon,
            isInsidePolygon: true,
            exitTime: new Date(),
          };
          SendDataToServer(dataToSave);
          if (outsideInfoRef.current) {
            outsideInfoRef.current.innerHTML = `Punkt jest poza torem na współrzędnych ${currentCoordinates}`;
          }   
      } else {
        if (outsideInfoRef.current) {
          outsideInfoRef.current.innerHTML = '';
        }
      }
      vectorSourceRef.current?.addFeature(currentFeature);
      currentFeature.setStyle(iconStyle(azimuth));
      if(map.current)
      {
        const mapView = map.current.getView();
        const extent = vectorSourceRef.current?.getExtent() as Extent;
        const size = map.current.getSize();
        mapView.fit(extent, {
        size: size,
        maxZoom: 19,
      })
      }
      currentIndex.current++;
      if (currentIndex.current == geojson.features.length - 1) {
        clearInterval(timerId.current);
        isAnimating.current = false;
        currentIndex.current = 0;
      }
    } else {
      console.error('GeoJSON or features are undefined or currentIndex is out of bounds.');
    }
  };

  return (
    <div>
      <div className="map" ref={mapRef}></div>
      {popupContent && (
        <div className="popup">
          <div className="popup-content">{popupContent}</div>
          <button onClick={() => setPopupContent('')} className="popup-close-button">
            Close
          </button>
        </div>
      )}
      <MapControls
        onLoadGeoJSON={handleLoadGeoJSON}
        delay={delay}
        setDelay={setDelay}
        vectorSource={vectorSourceRef.current as VectorSource}
      />
      <div className="outside-info" ref={outsideInfoRef}></div>
      <button className='btn btn-black' onClick={startInterval}>Start</button>
      <button className='btn btn-black' onClick={pauseInterval}>Stop</button>
      <button className='btn btn-black' onClick={restartAnimation}>Restart</button>
    </div>
  );
};

export default MapComponent;