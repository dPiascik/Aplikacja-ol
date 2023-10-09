import { Fill, Icon, Stroke, Style } from "ol/style";

export const polygonStyle = new Style({
    fill: new Fill({
      color: 'rgba(255, 0, 0, 0.2)', 
    }),
    stroke: new Stroke({
      color: 'red',
      width: 2, 
    }),
  })

  export const iconStyle = (azimuth: number) =>  new Style({
    image: new Icon({
      // src: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.nicepng.com%2Fpng%2Ffull%2F54-545066_car-top-view-png.png&f=1&nofb=1&ipt=f3f2e32d00337725c3aa95e55b71ffc81d01c02c21e1265460ad5a7517f9ef41&ipo=images',
      src: './fastRaceCar.svg',
      width: 50,
      rotation: -azimuth * (Math.PI / 180),
      rotateWithView: true,
    }),
  })
